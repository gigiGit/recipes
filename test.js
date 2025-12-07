const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, 'recipes.json');


// Helper: load and save recipes
function loadRecipes() {
  return fs.readJsonSync(DB_PATH, { throws: false }) || [];
}
const autore={};
const NonnaGio=[];
const ricette=loadRecipes();
ricette.forEach((ricetta, index) => {
  console.log(`Ricetta #${index + 1}:${ricetta.Autore}: ${ricetta.Nome}`);
  if(!autore[ricetta.Autore]) autore[ricetta.Autore]=[];
  autore[ricetta.Autore].push(ricetta.Nome);
  if (ricetta.Autore==="Nonna Gio'") NonnaGio.push(ricetta);
});
console.log('\nNumero di ricette per autore:');
for(const a in autore){
  console.log(`- ${a||'<Sconosciuto>'}: ${autore[a]}`);
} 
console.log(`\nRicette di Nonna Gio (${NonnaGio.length}):`);
NonnaGio.forEach((nome)=>console.log(`- ${nome.Nome}`));
fs.writeJSONSync(path.join(__dirname, 'NonnaGio.json'), NonnaGio, {spaces: 2});