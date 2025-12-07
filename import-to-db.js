const fs = require('fs');
const sqlite3 = require('better-sqlite3');
const filename = 'recipes.json';
// Verifica che il file JSON esista
if (!fs.existsSync(filename)) {
    console.error(`❌ File ${filename} non trovato!`);
    process.exit(1);
}

// Leggi il file JSON

const recipes = JSON.parse(fs.readFileSync(filename, 'utf8'));
console.log(`📦 Trovate ${recipes.length} ricette in ${filename}\n`);

// Backup del database esistente
if (fs.existsSync('recipes.db')) {
    const backupName = `recipes.db.backup-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}`;
    fs.copyFileSync('recipes.db', backupName);
    console.log(`💾 Backup creato: ${backupName}`);
    fs.unlinkSync('recipes.db');
}

// Crea il database
const db = new sqlite3('recipes.db');

// Crea le tabelle
db.exec(`
    CREATE TABLE IF NOT EXISTS ricette (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        autore TEXT,
        data_inserimento TEXT,
        difficolta TEXT,
        costo TEXT,
        tempo_preparazione INTEGER,
        tempo_cottura INTEGER,
        quantita INTEGER,
        metodo_cottura TEXT,
        tipo_piatto TEXT,
        istruzioni TEXT
    );
    create table if not exists autori ( 
    id integer primary key autoincrement,
    nome text not null unique
);        
    CREATE TABLE IF NOT EXISTS ingredienti (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ricetta_id INTEGER,
        ingrediente TEXT,
        FOREIGN KEY (ricetta_id) REFERENCES ricette(id)
    );

    CREATE TABLE IF NOT EXISTS vini (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ricetta_id INTEGER,
        vino TEXT,
        FOREIGN KEY (ricetta_id) REFERENCES ricette(id)
    );

    CREATE INDEX idx_ricette_nome ON ricette(nome);
    CREATE INDEX idx_ricette_tipo ON ricette(tipo_piatto);
    CREATE INDEX idx_ricette_autore ON ricette(autore);
`);

console.log('✅ Tabelle create');

// Prepara gli statement
const insertRicetta = db.prepare(`
    INSERT INTO ricette (nome, autore, data_inserimento, difficolta, costo, 
                        tempo_preparazione, tempo_cottura, quantita, metodo_cottura, 
                        tipo_piatto, istruzioni)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertIngrediente = db.prepare(`
    INSERT INTO ingredienti (ricetta_id, ingrediente)
    VALUES (?, ?)
`);

const insertVino = db.prepare(`
    INSERT INTO vini (ricetta_id, vino)
    VALUES (?, ?)
`);

// Inserisci i dati in una transazione
const insertAll = db.transaction((recipes) => {
    let count = 0;
    for (const recipe of recipes) {
        // Inserisci ricetta
        const result = insertRicetta.run(
            recipe.Nome || '',
            recipe.Autore || '',
            recipe.DataInserimento || '',
            recipe.Difficolta || '',
            recipe.Costo || '',
            recipe.TempoPreparazione || null,
            recipe.TempoCottura || null,
            recipe.Quantita || null,
            recipe.MetodoCottura || '',
            recipe.TipoPiatto || '',
            recipe.Istruzioni || ''
        );

        const ricettaId = result.lastInsertRowid;

        // Inserisci ingredienti
        if (recipe.Ingredienti && Array.isArray(recipe.Ingredienti)) {
            for (const ing of recipe.Ingredienti) {
                insertIngrediente.run(ricettaId, ing);
            }
        }

        // Inserisci vini
        if (recipe.VinoPreferibile && Array.isArray(recipe.VinoPreferibile)) {
            for (const vino of recipe.VinoPreferibile) {
                insertVino.run(ricettaId, vino);
            }
        }
        count++;
    }
    return count;
});
// Esegui l'inserimento
const totalInserted = insertAll(recipes);


console.log(`\n✅ Database aggiornato: recipes.db`);
console.log(`📊 Ricette importate: ${totalInserted}`);
// Aggiorna autori
//db.prepare('update ricette set autore=\'Internet\' where autore not like \'Nonna%\'').run();
//db.prepare('insert into autori (nome) select distinct autore from ricette').run();

// Mostra statistiche
const stats = db.prepare(`
    SELECT tipo_piatto, COUNT(*) as count 
    FROM ricette 
    GROUP BY tipo_piatto 
    ORDER BY count DESC
`).all();

console.log('\nRicette per tipo:');
stats.forEach(row => {
    console.log(`  ${row.tipo_piatto || 'Senza tipo'}: ${row.count}`);
});

const stats2 = db.prepare(`
    SELECT autore, COUNT(*) as count 
    FROM ricette 
    GROUP BY autore 
    ORDER BY count DESC
`).all();

console.log('\nRicette per autore:');
stats2.forEach(row => {
    console.log(`  ${row.autore || 'Senza tipo'}: ${row.count}`);
});
const fileSize = fs.statSync('recipes.db').size;
console.log(`\n📦 Dimensione database: ${(fileSize / 1024).toFixed(2)} KB`);

db.close();

console.log('\n✅ Importazione completata!');
