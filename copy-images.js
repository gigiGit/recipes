const fs = require('fs');
const path = require('path');

// Funzione per svuotare una cartella
function emptyDir(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        // Se è una sottocartella, svuotala ricorsivamente
        emptyDir(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }
}

// Carica recipes.json
const recipesPath = path.join(__dirname, 'data', 'recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

// Raccogli immagini uniche usate
const usedImages = new Set();
recipes.forEach(recipe => {
  if (recipe.Immagine1 && recipe.Immagine1 !== 'placeholder.jpg') usedImages.add(recipe.Immagine1);
  if (recipe.Immagine2 && recipe.Immagine2 !== 'placeholder.jpg') usedImages.add(recipe.Immagine2);
  if (recipe.Immagine3 && recipe.Immagine3 !== 'placeholder.jpg') usedImages.add(recipe.Immagine3);
});

// Aggiungi sempre placeholder
usedImages.add('placeholder.jpg');

// Cartelle di destinazione
const publicImagesDir = path.join(__dirname, 'public', 'images');
const assetsImagesDir = path.join(__dirname, 'RecipesApp', 'app', 'src', 'main', 'assets', 'images');

// Svuota le cartelle destinazione
emptyDir(publicImagesDir);
emptyDir(assetsImagesDir);

// Assicurati che le cartelle esistano
if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}
if (!fs.existsSync(assetsImagesDir)) {
  fs.mkdirSync(assetsImagesDir, { recursive: true });
}

// Copia solo immagini usate
const dataImagesDir = path.join(__dirname, 'data', 'images');
usedImages.forEach(image => {
  const src = path.join(dataImagesDir, image);
  if (fs.existsSync(src)) {
    const destPublic = path.join(publicImagesDir, image);
    const destAssets = path.join(assetsImagesDir, image);
    
    fs.copyFileSync(src, destPublic);
    fs.copyFileSync(src, destAssets);
    
    console.log(`Copiata ${image} in public e assets`);
  } else {
    console.log(`Immagine ${image} non trovata in data/images/`);
  }
});

console.log('Copia immagini usate completata.');