const fs = require('fs');
const path = require('path');
const https = require('https');
const recipes = JSON.parse(fs.readFileSync('recipes.json', 'utf8'));
// Funzione per cercare immagine su Lorem Picsum (senza API key)
function getImageUrl(seed) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/300/200`;
}

// Funzione per scaricare immagine
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { }); // Elimina file parziale
            reject(err);
        });
    });
}

async function updateImages() {
    for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        const seed = recipe.Nome; // Usa il nome come seed per immagine consistente
        if (recipe.Immagine2 === null) {
            try {
                console.log(`Generando immagine per: ${recipe.Nome}`);
                const imageUrl = getImageUrl(seed);
                const filename = `${recipe.Nome.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                const filepath = path.join(__dirname, 'images', filename);

                await downloadImage(imageUrl, filepath);
                recipe.Immagine2 = filename;

                console.log(`Salvata immagine: ${filename}`);
            } catch (err) {
                console.error(`Errore per ${recipe.Nome}:`, err.message);
                recipe.Immagine2 = null;
            }
        }
        // Pausa per evitare sovraccarico
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Salva il JSON aggiornato
    fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2));
    console.log('Aggiornamento completato.');
}

updateImages().catch(console.error);