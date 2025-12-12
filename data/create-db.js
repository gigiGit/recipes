const fs = require('fs');
const sqlite3 = require('better-sqlite3');

// Leggi il file JSON
const recipes = JSON.parse(fs.readFileSync('data/recipes.json', 'utf8'));

// Rimuovi il database esistente se presente
if (fs.existsSync('data/recipes.db')) {
    fs.unlinkSync('data/recipes.db');
    console.log('Database esistente rimosso');
}

// Crea il database
const db = new sqlite3('data/recipes.db');

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
        istruzioni TEXT,
        immagine1 TEXT,
        immagine2 TEXT,
        immagine3 TEXT
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

console.log('Tabelle create con successo');

// Prepara gli statement
const insertRicetta = db.prepare(`
    INSERT INTO ricette (nome, autore, data_inserimento, difficolta, costo, 
                        tempo_preparazione, tempo_cottura, quantita, metodo_cottura, 
                        tipo_piatto, istruzioni, immagine1, immagine2, immagine3)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            recipe.Istruzioni || '',
            recipe.Immagine1 || '',
            recipe.Immagine2 || '',
            recipe.Immagine3 || ''
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
        if (count % 100 === 0) {
            console.log(`Inserite ${count} ricette...`);
        }
    }
    return count;
});

// Esegui l'inserimento
const totalInserted = insertAll(recipes);

console.log(`\n✅ Database creato con successo: data/recipes.db`);
console.log(`Ricette inserite: ${totalInserted}`);

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

// Mostra dimensione file
const fileSize = fs.statSync('data/recipes.db').size;
console.log(`\nDimensione database: ${(fileSize / 1024).toFixed(2)} KB`);

db.close();

console.log('\n✅ Database creato con successo: data/recipes.db');
