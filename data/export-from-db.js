const fs = require('fs');
const sqlite3 = require('better-sqlite3');

// Verifica che il database esista
if (!fs.existsSync('data/recipes.db')) {
    console.error('❌ Database data/recipes.db non trovato!');
    console.log('Esegui prima: node create-db.js');
    process.exit(1);
}

// Apri il database
const db = new sqlite3('data/recipes.db');

console.log('📦 Esportazione ricette dal database SQLite...\n');

// Recupera tutte le ricette
const ricette = db.prepare(`
    SELECT id, nome, autore, data_inserimento, difficolta, costo,
           tempo_preparazione, tempo_cottura, quantita, metodo_cottura,
           tipo_piatto, istruzioni
    FROM ricette
    ORDER BY nome COLLATE NOCASE
`).all();

// Per ogni ricetta, recupera ingredienti e vini
const recipes = ricette.map(r => {
    // Recupera ingredienti
    const ingredienti = db.prepare(`
        SELECT ingrediente 
        FROM ingredienti 
        WHERE ricetta_id = ?
    `).all(r.id).map(row => row.ingrediente);
    
    // Recupera vini
    const vini = db.prepare(`
        SELECT vino 
        FROM vini 
        WHERE ricetta_id = ?
    `).all(r.id).map(row => row.vino);
    
    // Costruisci l'oggetto ricetta nel formato JSON originale
    return {
        Nome: r.nome,
        Ingredienti: ingredienti,
        Istruzioni: r.istruzioni,
        DataInserimento: r.data_inserimento || '',
        Autore: r.autore || '',
        Difficolta: r.difficolta || '',
        Costo: r.costo || '',
        TempoPreparazione: r.tempo_preparazione,
        TempoCottura: r.tempo_cottura,
        Quantita: r.quantita,
        MetodoCottura: r.metodo_cottura || '',
        TipoPiatto: r.tipo_piatto || '',
        VinoPreferibile: vini
    };
});

db.close();

// Scrivi il file JSON
const jsonOutput = JSON.stringify(recipes, null, 2);
fs.writeFileSync('recipes.json', jsonOutput, 'utf8');

console.log(`✅ Esportate ${recipes.length} ricette in recipes.json`);
console.log(`📊 Dimensione file: ${(fs.statSync('recipes.json').size / 1024).toFixed(2)} KB`);

// Mostra statistiche
const stats = {};
recipes.forEach(r => {
    const tipo = r.TipoPiatto || 'Senza tipo';
    stats[tipo] = (stats[tipo] || 0) + 1;
});

console.log('\nRicette per tipo:');
Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([tipo, count]) => {
    console.log(`  ${tipo}: ${count}`);
});

console.log('\n✅ File recipes.json generato con successo dal database!');
