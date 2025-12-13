const fs = require('fs');

const filename = 'recipes.json';
// Verifica che il file JSON esista
if (!fs.existsSync(filename)) {
    console.error(`❌ File ${filename} non trovato!`);
    process.exit(1);
}

// Leggi il file JSON

const recipes = JSON.parse(fs.readFileSync(filename, 'utf8'));
recipes.forEach(element => {
    console.log(element.Nome,element.Autore);
});