const fs = require('fs');
const path = require('path');

const recipesFile = 'recipes.json';
const instructionsDir = 'Istruzioni';

// Verifica che il file JSON esista
if (!fs.existsSync(recipesFile)) {
    console.error(`❌ File ${recipesFile} non trovato!`);
    process.exit(1);
}

// Verifica che la directory Istruzioni esista
const instructionsPath = path.join(__dirname, instructionsDir);
if (!fs.existsSync(instructionsPath)) {
    console.error(`❌ Directory ${instructionsDir} non trovata!`);
    process.exit(1);
}

// Leggi il file JSON
const recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf8'));

let updatedCount = 0;

recipes.forEach(recipe => {
    const name = recipe.Nome;
    const currentInstructions = recipe.Istruzioni;

    if (name) {
        // Genera il nome file sanitizzato
        const safeName = name.replace(/[^a-zA-Z0-9\-_\.]/g, '_').replace(/\s+/g, '_');
        const fileName = `${safeName}.txt`;
        const filePath = path.join(instructionsPath, fileName);

        if (fs.existsSync(filePath)) {
            // Leggi le nuove istruzioni dal file
            const newInstructions = fs.readFileSync(filePath, 'utf8').trim();

            if (newInstructions !== currentInstructions) {
                recipe.Istruzioni = newInstructions;
                console.log(`✅ Aggiornato: ${name}`);
                updatedCount++;
            } else {
                console.log(`ℹ️ Nessuna modifica: ${name}`);
            }
        } else {
            console.log(`⚠️ File istruzioni non trovato: ${fileName} per "${name}"`);
        }
    }
});

// Scrivi il file JSON aggiornato
fs.writeFileSync(recipesFile, JSON.stringify(recipes, null, 2), 'utf8');

console.log(`\n🎉 Ricostruzione completata! ${updatedCount} ricette aggiornate.`);