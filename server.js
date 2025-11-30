const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'recipes.json');

app.use(bodyParser.json());
app.use(express.static('public'));

// Helper: load and save recipes
function loadRecipes() {
  return fs.readJsonSync(DB_PATH, { throws: false }) || [];
}
function saveRecipes(recipes) {
  fs.writeJsonSync(DB_PATH, recipes, { spaces: 2 });
}


// API: lista tutte le ricette
app.get('/api/ricette', (req, res) => {
  res.json(loadRecipes());
});

// API: aggiungi una ricetta

app.post('/api/ricette', (req, res) => {
  const recipes = loadRecipes();
  const newRecipe = {
    Nome: req.body.Nome,
    Ingredienti: Array.isArray(req.body.Ingredienti)
      ? req.body.Ingredienti
      : (typeof req.body.Ingredienti === 'string' ? req.body.Ingredienti.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean) : []),
    Istruzioni: req.body.Istruzioni,
    DataInserimento: req.body.DataInserimento || new Date().toISOString().slice(0, 10),
    Autore: req.body.Autore || '',
    Difficolta: req.body.Difficolta || '',
    Costo: req.body.Costo || '',
    TempoPreparazione: req.body.TempoPreparazione ? Number(req.body.TempoPreparazione) : null,
    TempoCottura: req.body.TempoCottura ? Number(req.body.TempoCottura) : null,
    Quantita: req.body.Quantita ? Number(req.body.Quantita) : null,
    MetodoCottura: req.body.MetodoCottura || '',
    VinoPreferibile: Array.isArray(req.body.VinoPreferibile)
      ? req.body.VinoPreferibile
      : (typeof req.body.VinoPreferibile === 'string' ? req.body.VinoPreferibile.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean) : []),
    TipoPiatto: req.body.TipoPiatto || ''
  };
  recipes.push(newRecipe);
  saveRecipes(recipes);
  res.status(201).json(newRecipe);
});

// API: modifica una ricetta (per indice)

app.put('/api/ricette/:index', (req, res) => {
  const recipes = loadRecipes();
  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= recipes.length) {
    return res.status(404).json({ error: 'Ricetta non trovata' });
  }
  recipes[idx] = {
    Nome: req.body.Nome,
    Ingredienti: Array.isArray(req.body.Ingredienti)
      ? req.body.Ingredienti
      : (typeof req.body.Ingredienti === 'string' ? req.body.Ingredienti.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean) : []),
    Istruzioni: req.body.Istruzioni,
    DataInserimento: req.body.DataInserimento || recipes[idx].DataInserimento || new Date().toISOString().slice(0, 10),
    Autore: req.body.Autore || recipes[idx].Autore || '',
    Difficolta: req.body.Difficolta || recipes[idx].Difficolta || '',
    Costo: req.body.Costo || recipes[idx].Costo || '',
    TempoPreparazione: req.body.TempoPreparazione ? Number(req.body.TempoPreparazione) : recipes[idx].TempoPreparazione || null,
    TempoCottura: req.body.TempoCottura ? Number(req.body.TempoCottura) : recipes[idx].TempoCottura || null,
    Quantita: req.body.Quantita ? Number(req.body.Quantita) : recipes[idx].Quantita || null,
    MetodoCottura: req.body.MetodoCottura || recipes[idx].MetodoCottura || '',
    VinoPreferibile: Array.isArray(req.body.VinoPreferibile)
      ? req.body.VinoPreferibile
      : (typeof req.body.VinoPreferibile === 'string' ? req.body.VinoPreferibile.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean) : []),
    TipoPiatto: req.body.TipoPiatto || recipes[idx].TipoPiatto || ''
  };
  saveRecipes(recipes);
  res.json(recipes[idx]);
});

// API: elimina una ricetta (per indice)
app.delete('/api/ricette/:index', (req, res) => {
  let recipes = loadRecipes();
  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= recipes.length) {
    return res.status(404).json({ error: 'Ricetta non trovata' });
  }
  const removed = recipes.splice(idx, 1);
  saveRecipes(recipes);
  res.json(removed[0]);
});

// API: dettaglio ricetta (per indice)
app.get('/api/ricette/:index', (req, res) => {
  const recipes = loadRecipes();
  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= recipes.length) {
    return res.status(404).json({ error: 'Ricetta non trovata' });
  }
  res.json(recipes[idx]);
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Ricette in ascolto su http://localhost:${PORT}`);
});
