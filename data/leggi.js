const fs = require('fs');
const path = require('path');

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

    if ( element.Autore === "Nonna Gio'") {
        console.log(element.Nome, element.Autore);
        nonnaGio.push(element);
        let filename1 = element.Immagine1;
        let filename2 = element.Immagine2;
        let filename3 = element.Immagine3;
        /*
        if (filename1 && filename1 !== "") {
            let fname=filename1;
            let srcFile = path.join("images",fname);
            let dstFile = path.join("..","RecipesApp","app","src","main","assets","images",fname);
            if (!fs.existsSync(srcFile)) {
                console.error(`❌ File immagine ${filename1} non trovato in data/images/ !`);
            } else {
                fs.mkdirSync(path.dirname(dstFile), { recursive: true });
                fs.copyFileSync(srcFile, dstFile);
            }
        }
            */
        if (filename2 && filename2 !== "") {
            let fname=filename2;
            let srcFile = path.join("images",fname);
            let dstFile = path.join("..","RecipesApp","app","src","main","assets","images",fname);
            if (!fs.existsSync(srcFile)) {
                console.error(`❌ File immagine ${filename2} non trovato in data/images/ !`);
            } else {
                fs.mkdirSync(path.dirname(dstFile), { recursive: true });
                fs.copyFileSync(srcFile, dstFile);
            }
        }
        /*
        if (filename3 && filename3 !== "") {
            let fname=filename3;
            let srcFile = path.join("images",fname);
            let dstFile = path.join("..","RecipesApp","app","src","main","assets","images",fname);
            if (!fs.existsSync(srcFile)) {
                console.error(`❌ File immagine ${filename3} non trovato in data/images/ !`);
            } else {
                fs.mkdirSync(path.dirname(dstFile), { recursive: true });
                fs.copyFileSync(srcFile, dstFile);
            }
        }
            */
    }
});

fs.writeFileSync(__dirname + '/../RecipesApp/app/src/main/assets/recipes.json', JSON.stringify(nonnaGio, null, 2), 'utf8');
fs.writeFileSync(__dirname + 'nonna.json', JSON.stringify(nonnaGio, null, 2), 'utf8');
