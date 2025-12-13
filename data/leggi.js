const fs = require('fs');

const filename = 'recipes.json';
// Verifica che il file JSON esista
if (!fs.existsSync(filename)) {
    console.error(`❌ File ${filename} non trovato!`);
    process.exit(1);
}

// Leggi il file JSON
const nonnaGio = []
const recipes = JSON.parse(fs.readFileSync(filename, 'utf8'));
recipes.forEach(element => {

    if (element.Autore === "Nonna Gio'") {
        console.log(element.Nome, element.Autore);
        nonnaGio.push(element);
    }
});

fs.writeFileSync('nonna.json', JSON.stringify(nonnaGio, null, 2), 'utf8');