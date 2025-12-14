const fs = require('fs');
const path = require('path');

const recipesFile = 'recipes.json';
const outputDir = 'Istruzioni';

// Verifica che il file JSON esista
if (!fs.existsSync(recipesFile)) {
    console.error(`❌ File ${recipesFile} non trovato!`);
    process.exit(1);
}

// Crea la directory di output se non esiste
const outputPath = path.join(__dirname, outputDir);
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
    console.log(`📁 Directory ${outputDir} creata.`);
}

// Leggi il file JSON
const recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf8'));

let exportedCount = 0;

recipes.forEach(recipe => {
    const name = recipe.Nome;
    const instructions = recipe.Istruzioni;

    if (name && instructions) {
        // Sanitizza il nome del file: sostituisci spazi con _, rimuovi caratteri non validi
        const safeName = name.replace(/[^a-zA-Z0-9\-_\.]/g, '_').replace(/\s+/g, '_');
        const fileName = `${safeName}.txt`;
        const filePath = path.join(outputPath, fileName);

        fs.writeFileSync(filePath, instructions, 'utf8');
        console.log(`✅ Esportato: ${fileName}`);
        exportedCount++;
    } else {
        console.log(`⚠️ Ricetta "${name}" senza istruzioni, saltata.`);
    }
});

console.log(`\n🎉 Esportazione completata! ${exportedCount} file creati in ${outputDir}/`);