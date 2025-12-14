let editor;
let currentRecipeIndex = null;
let currentRecipe = null;

document.addEventListener('DOMContentLoaded', () => {
  editor = SUNEDITOR.create('istruzioni', {
    buttonList: [
      ['undo', 'redo'],
      ['font', 'fontSize', 'formatBlock'],
      ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
      ['fontColor', 'hiliteColor', 'textStyle'],
      ['removeFormat'],
      ['outdent', 'indent'],
      ['align', 'horizontalRule', 'list', 'lineHeight'],
      ['table', 'link', 'image', 'video'],
      ['fullScreen', 'showBlocks', 'codeView'],
      ['preview', 'print']
    ],
    height: '300px'
  });

  loadRecipeList();

  document.getElementById('save-btn').addEventListener('click', saveRecipe);
});

async function loadRecipeList() {
  try {
    const response = await fetch('/api/ricette');
    const recipes = await response.json();
    console.log('Recipes loaded:', recipes);
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';
    recipes.forEach((recipe, index) => {
      const li = document.createElement('li');
      li.textContent = recipe.Nome;
      li.addEventListener('click', () => loadRecipe(index));
      recipeList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading recipe list:', error);
  }
}

async function loadRecipe(index) {
  try {
    const response = await fetch('/api/ricette');
    const recipes = await response.json();
    currentRecipe = recipes[index];
    document.getElementById('nome').value = currentRecipe.Nome || '';
    document.getElementById('ingredienti').value = Array.isArray(currentRecipe.Ingredienti) ? currentRecipe.Ingredienti.join('\n') : currentRecipe.Ingredienti || '';
    editor.setContents(currentRecipe.Istruzioni || '');
    document.getElementById('autore').value = currentRecipe.Autore || '';
    document.getElementById('difficolta').value = currentRecipe.Difficolta || '';
    document.getElementById('costo').value = currentRecipe.Costo || '';
    document.getElementById('tempo').value = currentRecipe.TempoPreparazione || '';
    currentRecipeIndex = index;
  } catch (error) {
    console.error('Error loading recipe:', error);
  }
}

async function saveRecipe() {
  if (!currentRecipe) {
    alert('No recipe selected');
    return;
  }
  const updatedRecipe = {
    ...currentRecipe,
    Nome: document.getElementById('nome').value,
    Ingredienti: document.getElementById('ingredienti').value.split('\n').map(s => s.trim()).filter(Boolean),
    Istruzioni: editor.getContents(),
    Autore: document.getElementById('autore').value,
    Difficolta: document.getElementById('difficolta').value,
    Costo: document.getElementById('costo').value,
    TempoPreparazione: Number(document.getElementById('tempo').value) || null
  };
  try {
    const response = await fetch(`/api/ricette/${currentRecipeIndex}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedRecipe)
    });
    const result = await response.json();
    alert('Recipe saved successfully');
  } catch (error) {
    console.error('Error saving recipe:', error);
  }
}