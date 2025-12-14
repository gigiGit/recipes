const fs = require('fs');
const path = require('path');

// Funzione per generare istruzioni dettagliate basate sugli ingredienti
function generateDetailedInstructions(name, ingredients) {
    const ing = ingredients.map(i => i.toLowerCase());

    let prepSteps = [];
    let cookSteps = [];
    let postSteps = [];

    // Logica generale per dolci
    if (name.toLowerCase().includes('torta') || name.toLowerCase().includes('dolce') || name.toLowerCase().includes('crosta') || name.toLowerCase().includes('panna') || name.toLowerCase().includes('tiramisù')) {
        if (ing.some(i => i.includes('farina') || i.includes('pane grattugiato'))) {
            prepSteps.push('In una ciotola, mescola gli ingredienti secchi come farina o pane grattugiato.');
        }
        if (ing.some(i => i.includes('uova'))) {
            prepSteps.push('Sbatti le uova con lo zucchero fino a ottenere un composto spumoso.');
        }
        if (ing.some(i => i.includes('burro') || i.includes('olio'))) {
            prepSteps.push('Aggiungi burro fuso o olio al composto.');
        }
        if (ing.some(i => i.includes('latte') || i.includes('panna'))) {
            prepSteps.push('Incorpora gradualmente il latte o la panna, mescolando bene.');
        }
        prepSteps.push('Versa il composto in una teglia imburrata e infarinata.');

        cookSteps.push('Preriscalda il forno a 180°C.');
        cookSteps.push('Inforna e cuoci per 25-40 minuti, o fino a quando uno stuzzicadenti inserito al centro esce pulito.');

        postSteps.push('Sforna e lascia raffreddare prima di servire.');
    }
    // Logica per primi piatti
    else if (name.toLowerCase().includes('pasta') || name.toLowerCase().includes('risotto') || name.toLowerCase().includes('polenta')) {
        if (ing.some(i => i.includes('pasta'))) {
            prepSteps.push('Porta a ebollizione abbondante acqua salata.');
            cookSteps.push('Cucina la pasta seguendo le istruzioni sulla confezione.');
        }
        if (ing.some(i => i.includes('riso'))) {
            prepSteps.push('In una pentola, fai tostare il riso con olio o burro.');
            cookSteps.push('Aggiungi brodo gradualmente e cuoci mescolando fino a cottura.');
        }
        if (ing.some(i => i.includes('sugo') || i.includes('pomodoro'))) {
            prepSteps.push('Prepara il sugo cuocendo pomodori e aromi.');
            cookSteps.push('Scola la pasta e condisci con il sugo caldo.');
        }
        postSteps.push('Servi immediatamente.');
    }
    // Logica per fritti
    else if (ing.some(i => i.includes('olio') && ing.some(i => i.includes('friggere')))) {
        prepSteps.push('Prepara l\'impasto o gli ingredienti da friggere.');
        cookSteps.push('Scalda abbondante olio in una padella profonda.');
        cookSteps.push('Friggi gli ingredienti fino a doratura.');
        postSteps.push('Scola su carta assorbente e servi caldo.');
    }
    // Default
    else {
        prepSteps.push('Prepara tutti gli ingredienti necessari.');
        cookSteps.push('Cucina seguendo il metodo tradizionale per questo piatto.');
        postSteps.push('Servi e gusta!');
    }

    // Formatta in HTML
    let text = '<h3>Preparazione:</h3>\n';
    prepSteps.forEach((step, index) => text += `${index + 1}. ${step}<br>\n`);
    text += '\n<h3>Cottura:</h3>\n';
    cookSteps.forEach((step, index) => text += `${index + 1}. ${step}<br>\n`);
    text += '\n<h3>Post Cottura:</h3>\n';
    postSteps.forEach((step, index) => text += `${index + 1}. ${step}<br>\n`);

    return text;
}

const recipesFile = 'recipes.json';
const instructionsDir = 'Istruzioni';

// Leggi recipes.json
const recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf8'));

recipes.forEach(recipe => {
    const name = recipe.Nome;
    const ingredients = recipe.Ingredienti || [];

    const safeName = name.replace(/[^a-zA-Z0-9\-_\.]/g, '_').replace(/\s+/g, '_');
    const filePath = path.join(instructionsDir, `${safeName}.txt`);

    const detailedInstructions = generateDetailedInstructions(name, ingredients);

    fs.writeFileSync(filePath, detailedInstructions, 'utf8');
    console.log(`Aggiornato: ${name}`);
});

console.log('Tutte le istruzioni sono state espanse e formattate!');