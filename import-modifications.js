const fs = require('fs');
const sqlite3 = require('better-sqlite3');

// File di input (modifiche dall'app Android)
const MODIFICATIONS_FILE = process.argv[2] || 'recipe_modifications.json';
const RECIPES_JSON = 'recipes.json';
const DB_FILE = 'recipes.db';

console.log(`📱 Import incrementale modifiche Android\n`);

// Verifica che il file delle modifiche esista
if (!fs.existsSync(MODIFICATIONS_FILE)) {
    console.error(`❌ File ${MODIFICATIONS_FILE} non trovato!`);
    console.log(`\nUtilizzo: node import-modifications.js [file_modifiche.json]`);
    console.log(`Esempio: node import-modifications.js recipe_modifications.json`);
    process.exit(1);
}

// Leggi le modifiche
let modifications;
try {
    modifications = JSON.parse(fs.readFileSync(MODIFICATIONS_FILE, 'utf8'));
    if (!Array.isArray(modifications)) {
        modifications = [modifications];
    }
    console.log(`📦 Trovate ${modifications.length} modifiche da importare\n`);
} catch (error) {
    console.error(`❌ Errore lettura ${MODIFICATIONS_FILE}:`, error.message);
    process.exit(1);
}

// Backup del recipes.json
const backupName = `recipes.json.backup-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}`;
if (fs.existsSync(RECIPES_JSON)) {
    fs.copyFileSync(RECIPES_JSON, backupName);
    console.log(`💾 Backup creato: ${backupName}`);
}

// Carica recipes.json esistente
let recipes = [];
if (fs.existsSync(RECIPES_JSON)) {
    recipes = JSON.parse(fs.readFileSync(RECIPES_JSON, 'utf8'));
    console.log(`📖 Ricette esistenti: ${recipes.length}`);
}

// Statistiche
let stats = {
    added: 0,
    updated: 0,
    errors: 0,
    unchanged: 0
};

// Applica le modifiche
modifications.forEach((mod, index) => {
    try {
        const recipeName = mod.Nome || mod.nome;
        if (!recipeName) {
            console.warn(`⚠️  Modifica ${index + 1}: Nome mancante, saltata`);
            stats.errors++;
            return;
        }

        // Cerca ricetta esistente
        const existingIndex = recipes.findIndex(r => r.Nome === recipeName);
        
        if (existingIndex >= 0) {
            // Verifica se ci sono effettive differenze
            const existing = recipes[existingIndex];
            const hasChanges = JSON.stringify(existing) !== JSON.stringify(mod);
            
            if (hasChanges) {
                recipes[existingIndex] = mod;
                stats.updated++;
                console.log(`✏️  Aggiornata: ${recipeName}`);
            } else {
                stats.unchanged++;
                console.log(`➖ Invariata: ${recipeName}`);
            }
        } else {
            // Nuova ricetta
            recipes.push(mod);
            stats.added++;
            console.log(`➕ Aggiunta: ${recipeName}`);
        }
    } catch (error) {
        console.error(`❌ Errore modifica ${index + 1}:`, error.message);
        stats.errors++;
    }
});

// Ordina alfabeticamente
recipes.sort((a, b) => (a.Nome || '').localeCompare(b.Nome || '', 'it', { sensitivity: 'base' }));

// Salva recipes.json aggiornato
fs.writeFileSync(RECIPES_JSON, JSON.stringify(recipes, null, 2), 'utf8');
console.log(`\n✅ File ${RECIPES_JSON} aggiornato`);
console.log(`📊 Totale ricette: ${recipes.length}`);

// Aggiorna anche il database SQLite se esiste
if (fs.existsSync(DB_FILE)) {
    console.log(`\n🔄 Aggiornamento database SQLite...`);
    
    try {
        // Backup del database
        const dbBackupName = `recipes.db.backup-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}`;
        fs.copyFileSync(DB_FILE, dbBackupName);
        console.log(`💾 Backup DB: ${dbBackupName}`);
        
        const db = new sqlite3(DB_FILE);
        
        // Rimuovi eventuali duplicati prima di iniziare
        console.log(`🔍 Controllo duplicati nel database...`);
        const duplicates = db.prepare(`
            SELECT nome, COUNT(*) as cnt 
            FROM ricette 
            GROUP BY nome COLLATE NOCASE
            HAVING cnt > 1
        `).all();
        
        if (duplicates.length > 0) {
            console.log(`⚠️  Trovati ${duplicates.length} nomi duplicati, risoluzione in corso...`);
            const removeDuplicates = db.transaction(() => {
                duplicates.forEach(dup => {
                    // Mantieni solo il primo, elimina gli altri
                    const ids = db.prepare('SELECT id FROM ricette WHERE nome = ? COLLATE NOCASE ORDER BY id').all(dup.nome);
                    for (let i = 1; i < ids.length; i++) {
                        db.prepare('DELETE FROM ingredienti WHERE ricetta_id = ?').run(ids[i].id);
                        db.prepare('DELETE FROM vini WHERE ricetta_id = ?').run(ids[i].id);
                        db.prepare('DELETE FROM ricette WHERE id = ?').run(ids[i].id);
                    }
                    console.log(`   🧹 Rimossi ${ids.length - 1} duplicati di "${dup.nome}"`);
                });
            });
            removeDuplicates();
        }
        
        // Prepara gli statement
        const findRicetta = db.prepare('SELECT id FROM ricette WHERE nome = ? COLLATE NOCASE');
        const insertRicetta = db.prepare(`
            INSERT INTO ricette (nome, autore, data_inserimento, difficolta, costo, 
                                tempo_preparazione, tempo_cottura, quantita, metodo_cottura, 
                                tipo_piatto, istruzioni)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const updateRicetta = db.prepare(`
            UPDATE ricette SET 
                nome = ?, autore = ?, data_inserimento = ?, difficolta = ?, costo = ?,
                tempo_preparazione = ?, tempo_cottura = ?, quantita = ?, 
                metodo_cottura = ?, tipo_piatto = ?, istruzioni = ?
            WHERE id = ?
        `);
        const deleteIngredienti = db.prepare('DELETE FROM ingredienti WHERE ricetta_id = ?');
        const deleteVini = db.prepare('DELETE FROM vini WHERE ricetta_id = ?');
        const insertIngrediente = db.prepare('INSERT INTO ingredienti (ricetta_id, ingrediente) VALUES (?, ?)');
        const insertVino = db.prepare('INSERT INTO vini (ricetta_id, vino) VALUES (?, ?)');
        
        // Esegui in transazione
        const updateDB = db.transaction((modifications) => {
            let dbStats = { added: 0, updated: 0 };
            
            modifications.forEach(mod => {
                const recipeName = mod.Nome || mod.nome;
                if (!recipeName) return;
                
                const existing = findRicetta.get(recipeName);
                let ricettaId;
                
                if (existing) {
                    // Aggiorna ricetta esistente
                    updateRicetta.run(
                        recipeName,
                        mod.Autore || '',
                        mod.DataInserimento || '',
                        mod.Difficolta || '',
                        mod.Costo || '',
                        mod.TempoPreparazione || null,
                        mod.TempoCottura || null,
                        mod.Quantita || null,
                        mod.MetodoCottura || '',
                        mod.TipoPiatto || '',
                        mod.Istruzioni || '',
                        existing.id
                    );
                    ricettaId = existing.id;
                    dbStats.updated++;
                    
                    // Rimuovi vecchi ingredienti e vini
                    deleteIngredienti.run(ricettaId);
                    deleteVini.run(ricettaId);
                } else {
                    // Inserisci nuova ricetta
                    const result = insertRicetta.run(
                        recipeName,
                        mod.Autore || '',
                        mod.DataInserimento || '',
                        mod.Difficolta || '',
                        mod.Costo || '',
                        mod.TempoPreparazione || null,
                        mod.TempoCottura || null,
                        mod.Quantita || null,
                        mod.MetodoCottura || '',
                        mod.TipoPiatto || '',
                        mod.Istruzioni || ''
                    );
                    ricettaId = result.lastInsertRowid;
                    dbStats.added++;
                }
                
                // Inserisci ingredienti
                if (mod.Ingredienti && Array.isArray(mod.Ingredienti)) {
                    mod.Ingredienti.forEach(ing => {
                        insertIngrediente.run(ricettaId, ing);
                    });
                }
                
                // Inserisci vini
                if (mod.VinoPreferibile && Array.isArray(mod.VinoPreferibile)) {
                    mod.VinoPreferibile.forEach(vino => {
                        insertVino.run(ricettaId, vino);
                    });
                }
            });
            
            return dbStats;
        });
        
        const dbStats = updateDB(modifications);
        console.log(`✅ Database aggiornato: ${dbStats.added} aggiunte, ${dbStats.updated} aggiornate`);
        
        db.close();
    } catch (error) {
        console.error(`❌ Errore aggiornamento database:`, error.message);
    }
} else {
    console.log(`\n⚠️  Database ${DB_FILE} non trovato, saltato aggiornamento DB`);
    console.log(`   Esegui 'node import-to-db.js' per creare il database`);
}

// Riepilogo finale
console.log(`\n📊 RIEPILOGO IMPORTAZIONE`);
console.log(`${'='.repeat(50)}`);
console.log(`➕ Ricette aggiunte:      ${stats.added}`);
console.log(`✏️  Ricette aggiornate:    ${stats.updated}`);
console.log(`➖ Ricette invariate:     ${stats.unchanged}`);
console.log(`❌ Errori:                ${stats.errors}`);
console.log(`${'='.repeat(50)}`);
console.log(`📦 Totale ricette finali: ${recipes.length}\n`);

// Archivia il file delle modifiche
const archiveName = `${MODIFICATIONS_FILE}.imported-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}`;
fs.copyFileSync(MODIFICATIONS_FILE, archiveName);
console.log(`📁 Modifiche archiviate: ${archiveName}`);
console.log(`   Puoi eliminare il file ${MODIFICATIONS_FILE} se l'import è corretto\n`);

console.log(`✅ Import completato con successo!`);
