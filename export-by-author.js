const fs = require('fs');
const sqlite3 = require('better-sqlite3');

const DB_FILE = 'recipes.db';

// Parametri da linea di comando
const args = process.argv.slice(2);
const author = args[0]; // Autore da cercare (opzionale)
const outputFile = args[1] || 'ricette-estratte.json';

console.log(`📖 Estrazione ricette dal database SQLite\n`);

// Verifica database
if (!fs.existsSync(DB_FILE)) {
    console.error(`❌ Database ${DB_FILE} non trovato!`);
    console.log(`\nEsegui prima: node import-to-db.js`);
    process.exit(1);
}

const db = new sqlite3(DB_FILE);

// Mostra statistiche generali
console.log(`📊 STATISTICHE DATABASE\n`);
const totalRecipes = db.prepare('SELECT COUNT(*) as count FROM ricette').get().count;
console.log(`Totale ricette: ${totalRecipes}`);

const authors = db.prepare(`
    SELECT autore, COUNT(*) as count 
    FROM ricette 
    WHERE autore IS NOT NULL AND autore != ''
    GROUP BY autore 
    ORDER BY count DESC
`).all();

console.log(`\nAutori disponibili:`);
authors.forEach(a => {
    console.log(`  • ${a.autore}: ${a.count} ricette`);
});

const noAuthor = db.prepare(`
    SELECT COUNT(*) as count 
    FROM ricette 
    WHERE autore IS NULL OR autore = ''
`).get().count;

if (noAuthor > 0) {
    console.log(`  • (Senza autore): ${noAuthor} ricette`);
}

console.log(`\n${'='.repeat(60)}\n`);

// Query principale
let query = `
    SELECT 
        id, nome, autore, data_inserimento, difficolta, costo,
        tempo_preparazione, tempo_cottura, quantita, metodo_cottura,
        tipo_piatto, istruzioni
    FROM ricette
`;

let params = [];
let filterDescription = 'TUTTE le ricette';

if (author) {
    // Cerca per autore (case-insensitive, parziale)
    query += ` WHERE autore LIKE ? COLLATE NOCASE`;
    params.push(`%${author}%`);
    filterDescription = `ricette di autore che contiene "${author}"`;
}

query += ` ORDER BY nome COLLATE NOCASE`;

console.log(`🔍 Estrazione: ${filterDescription}\n`);

// Esegui query
const ricette = db.prepare(query).all(...params);

if (ricette.length === 0) {
    console.warn(`⚠️  Nessuna ricetta trovata!`);
    if (author) {
        console.log(`\nProva con uno di questi autori:`);
        authors.forEach(a => console.log(`  node export-by-author.js "${a.autore}"`));
    }
    db.close();
    process.exit(0);
}

console.log(`✅ Trovate ${ricette.length} ricette\n`);

// Prepara query per ingredienti e vini
const getIngredienti = db.prepare('SELECT ingrediente FROM ingredienti WHERE ricetta_id = ? ORDER BY id');
const getVini = db.prepare('SELECT vino FROM vini WHERE ricetta_id = ? ORDER BY id');

// Costruisci array JSON
const recipes = ricette.map(r => {
    const ingredienti = getIngredienti.all(r.id).map(i => i.ingrediente);
    const vini = getVini.all(r.id).map(v => v.vino);
    
    return {
        Nome: r.nome,
        Ingredienti: ingredienti,
        Istruzioni: r.istruzioni || '',
        DataInserimento: r.data_inserimento || '',
        Autore: r.autore || '',
        Difficolta: r.difficolta || '',
        Costo: r.costo || '',
        TempoPreparazione: r.tempo_preparazione || null,
        TempoCottura: r.tempo_cottura || null,
        Quantita: r.quantita || null,
        MetodoCottura: r.metodo_cottura || '',
        VinoPreferibile: vini,
        TipoPiatto: r.tipo_piatto || ''
    };
});

db.close();

// Salva file JSON
fs.writeFileSync(outputFile, JSON.stringify(recipes, null, 2), 'utf8');

const fileSize = fs.statSync(outputFile).size;
console.log(`✅ File creato: ${outputFile}`);
console.log(`📦 Dimensione: ${(fileSize / 1024).toFixed(2)} KB`);
console.log(`📊 Ricette esportate: ${recipes.length}\n`);

// Statistiche per tipo
const byType = recipes.reduce((acc, r) => {
    const tipo = r.TipoPiatto || 'Senza tipo';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
}, {});

console.log(`Ricette per tipo:`);
Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tipo, count]) => {
        console.log(`  ${tipo}: ${count}`);
    });

console.log(`\n✅ Estrazione completata!`);

// Mostra esempi d'uso
if (!author && ricette.length > 10) {
    console.log(`\n💡 SUGGERIMENTO:`);
    console.log(`Per estrarre solo ricette di un autore specifico:`);
    authors.slice(0, 3).forEach(a => {
        console.log(`  node export-by-author.js "${a.autore}"`);
    });
    console.log(`\nPer salvare in un file diverso:`);
    console.log(`  node export-by-author.js "Nonna Gio'" mie-ricette.json`);
}
