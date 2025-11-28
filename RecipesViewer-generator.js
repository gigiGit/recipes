
const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, 'recipes.json');
const OUT_DIR = path.join(__dirname, 'static');
//fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.ensureDirSync(OUT_DIR);
const recipes = fs.readJsonSync(DB_PATH, { throws: false }) || [];
fs.writeFileSync(path.join(OUT_DIR, 'recipes.js'), "const recipes=" + JSON.stringify(recipes,null,2) + ";");
