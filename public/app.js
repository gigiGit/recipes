
// --- Versione coerente e senza duplicati ---
let currentRecipes = [];

async function fetchRicette() {
  const res = await fetch('/api/ricette');
  return res.json();
}
function templateRicetta(ricetta){
  let template=`
          <li id="recipe-template" style="display: none;">
            <b class="recipe-name"></b><br>
            <div id="container1">
              <div id="pannello1">
                <small class="recipe-meta"></small><br>
                Difficoltà: <span class="recipe-difficulty"></span> | Costo: <span class="recipe-cost"></span><br>
                Tempo prep: <span class="recipe-prep-time"></span> min | Tempo cottura: <span
                  class="recipe-cook-time"></span> min<br>
                Quantità: <span class="recipe-quantity"></span> porzioni<br>
                Metodo cottura: <span class="recipe-method"></span><br>
                Tipo piatto: <span class="recipe-type"></span><br>
                Vino preferibile: <span class="recipe-wines"></span><br>
              </div>
              <div id="recipe-image-1" class="recipe-images"></div>
            </div>
            <div id="container2">
              <div id="recipe-ingredients">
              Ingredienti:<ul class="ingredienti-list"></ul>
              </div>
              <div id="recipe-image-2" class="recipe-images"></div>
            </div>
            Istruzioni: <span class="recipe-instructions"></span><br>
            <div id="recipe-image-3" class="recipe-images"></div>
            <button class="edit-btn">Modifica</button>
            <button class="delete-btn">Elimina</button>
            <button class="print-btn">🖨️ Stampa Ricetta</button>
          </li>
          <div id="selected-recipe-content"></div>
        `;
        return template;
}
function showRecipe(r) {
  if (!r) return;
  
  const template = document.getElementById('recipe-template');
  const contentDiv = document.getElementById('selected-recipe-content');
  contentDiv.innerHTML = '';
  
  const li = template.cloneNode(true);
  li.id = '';
  li.style.display = 'block';
  
  // Popola i campi
  li.querySelector('.recipe-name').textContent = r.Nome;
  li.querySelector('.recipe-meta').textContent = `Inserita il: ${r.DataInserimento || ''} da ${r.Autore || ''}`;
  li.querySelector('.recipe-difficulty').textContent = r.Difficolta || '';
  li.querySelector('.recipe-cost').textContent = r.Costo || '';
  li.querySelector('.recipe-prep-time').textContent = r.TempoPreparazione || '';
  li.querySelector('.recipe-cook-time').textContent = r.TempoCottura || '';
  li.querySelector('.recipe-quantity').textContent = r.Quantita || '';
  li.querySelector('.recipe-method').textContent = r.MetodoCottura || '';
  li.querySelector('.recipe-type').textContent = r.TipoPiatto || '';
  li.querySelector('.recipe-wines').textContent = (r.VinoPreferibile || []).join(', ');
  
  // Immagini
  li.querySelector('#recipe-image-1').innerHTML = r.Immagine1 ? `<img src="/images/${r.Immagine1}" alt="Foto autore">` : `<img src="/images/placeholder.jpg" alt="Foto autore">`;
  li.querySelector('#recipe-image-2').innerHTML = r.Immagine2 ? `<img src="/images/${r.Immagine2}" alt="Foto piatto">` : `<img src="/images/placeholder.jpg" alt="Foto piatto">`;
  li.querySelector('#recipe-image-3').innerHTML = r.Immagine3 ? `<img src="/images/${r.Immagine3}" alt="Foto passaggio">` : `<img src="/images/placeholder.jpg" alt="Foto passaggio">`;
  
  // Ingredienti
  const ingredientiUl = li.querySelector('.ingredienti-list');
  ingredientiUl.innerHTML = (r.Ingredienti || []).map(i => `<li>${i}</li>`).join('');
  
  // Istruzioni
  li.querySelector('.recipe-instructions').textContent = r.Istruzioni;
  
  // Bottoni
  li.querySelector('.edit-btn').onclick = () => editRicetta(r.id);
  li.querySelector('.delete-btn').onclick = () => deleteRicetta(r.id);
  li.querySelector('.print-btn').onclick = () => window.print();
  
  contentDiv.appendChild(li);
  document.getElementById('selected-recipe').style.display = 'block';
}

// Funzione helper per generare HTML della ricetta usando il template (per stampa)
function generateRecipeHTML(r) {
  const template = document.getElementById('recipe-template');
  const li = template.cloneNode(true);
  li.id = '';
  li.style.display = 'block';
  
  // Popola i campi
  li.querySelector('.recipe-name').textContent = r.Nome;
  li.querySelector('.recipe-meta').textContent = `Inserita il: ${r.DataInserimento || ''} da ${r.Autore || ''}`;
  li.querySelector('.recipe-difficulty').textContent = r.Difficolta || '';
  li.querySelector('.recipe-cost').textContent = r.Costo || '';
  li.querySelector('.recipe-prep-time').textContent = r.TempoPreparazione || '';
  li.querySelector('.recipe-cook-time').textContent = r.TempoCottura || '';
  li.querySelector('.recipe-quantity').textContent = r.Quantita || '';
  li.querySelector('.recipe-method').textContent = r.MetodoCottura || '';
  li.querySelector('.recipe-type').textContent = r.TipoPiatto || '';
  li.querySelector('.recipe-wines').textContent = (r.VinoPreferibile || []).join(', ');
  
  // Immagini
  li.querySelector('#recipe-image-1').innerHTML = r.Immagine1 ? `<img src="/images/${r.Immagine1}" alt="Foto autore">` : `<img src="/images/placeholder.jpg" alt="Foto autore">`;
  li.querySelector('#recipe-image-2').innerHTML = r.Immagine2 ? `<img src="/images/${r.Immagine2}" alt="Foto piatto">` : `<img src="/images/placeholder.jpg" alt="Foto piatto">`;
  li.querySelector('#recipe-image-3').innerHTML = r.Immagine3 ? `<img src="/images/${r.Immagine3}" alt="Foto passaggio">` : `<img src="/images/placeholder.jpg" alt="Foto passaggio">`;
  
  // Ingredienti
  const ingredientiUl = li.querySelector('.ingredienti-list');
  ingredientiUl.innerHTML = (r.Ingredienti || []).map(i => `<li>${i}</li>`).join('');
  
  // Istruzioni
  li.querySelector('.recipe-instructions').textContent = r.Istruzioni;
  
  // Rimuovi i bottoni per la stampa
  li.querySelector('.edit-btn').remove();
  li.querySelector('.delete-btn').remove();
  li.querySelector('.print-btn').remove();
  
  return li.outerHTML;
}

async function loadRicette() {
  currentRecipes = await fetchRicette();
  currentRecipes.forEach((r, idx) => r._globalIdx = idx);
  ricetteGlobal = currentRecipes;
  renderSidebar(currentRecipes);
}

function showForm(ricetta = {}, index = null) {
  const form = document.createElement('form');
  form.innerHTML = `
    <label>Nome ricetta:<br><input name="Nome" placeholder="Nome ricetta" value="${ricetta.Nome || ''}" required></label><br>
    <label>Autore:<br><input name="Autore" placeholder="Autore" value="${ricetta.Autore || ''}"></label><br>
    <label>Data inserimento:<br><input name="DataInserimento" type="date" value="${ricetta.DataInserimento || ''}"></label><br>
    <label>Difficoltà:<br><select name="Difficolta">
      <option value="">Scegli difficoltà</option>
      <option value="facile" ${ricetta.Difficolta==='facile'?'selected':''}>Facile</option>
      <option value="Medio" ${ricetta.Difficolta==='Medio'?'selected':''}>Medio</option>
      <option value="Difficile" ${ricetta.Difficolta==='Difficile'?'selected':''}>Difficile</option>
      <option value="veri esperti" ${ricetta.Difficolta==='veri esperti'?'selected':''}>Veri esperti</option>
    </select></label><br>
    <label>Costo:<br><select name="Costo">
      <option value="">Scegli costo</option>
      <option value="economico" ${ricetta.Costo==='economico'?'selected':''}>Economico</option>
      <option value="medio" ${ricetta.Costo==='medio'?'selected':''}>Medio</option>
      <option value="costoso" ${ricetta.Costo==='costoso'?'selected':''}>Costoso</option>
    </select></label><br>
    <label>Tempo preparazione (min):<br><input name="TempoPreparazione" type="number" placeholder="Tempo preparazione (min)" value="${ricetta.TempoPreparazione || ''}"></label><br>
    <label>Tempo cottura (min):<br><input name="TempoCottura" type="number" placeholder="Tempo cottura (min)" value="${ricetta.TempoCottura || ''}"></label><br>
    <label>Quantità (porzioni):<br><input name="Quantita" type="number" placeholder="Quantità (porzioni)" value="${ricetta.Quantita || ''}"></label><br>
    <label>Metodo di cottura:<br><select name="MetodoCottura">
      <option value="">Scegli metodo</option>
      <option value="Forno" ${ricetta.MetodoCottura==='Forno'?'selected':''}>Forno</option>
      <option value="Fornello" ${ricetta.MetodoCottura==='Fornello'?'selected':''}>Fornello</option>
      <option value="Nessuna" ${ricetta.MetodoCottura==='Nessuna'?'selected':''}>Nessuna</option>
      <option value="Microonde" ${ricetta.MetodoCottura==='Microonde'?'selected':''}>Microonde</option>
      <option value="Induzione" ${ricetta.MetodoCottura==='Induzione'?'selected':''}>Induzione</option>
      <option value="friggitrice" ${ricetta.MetodoCottura==='friggitrice'?'selected':''}>Friggitrice</option>
      <option value="Friggitrice" ${ricetta.MetodoCottura==='Friggitrice'?'selected':''}>Friggitrice</option>
      <option value="tostapane" ${ricetta.MetodoCottura==='tostapane'?'selected':''}>Tostapane</option>
    </select></label><br>
    <label>Tipo piatto:<br><input name="TipoPiatto" placeholder="Tipo piatto (es. Primo, Secondo, Dolce)" value="${ricetta.TipoPiatto || ''}"></label><br>
    <label>Vini preferibili (uno per riga):<br><textarea name="VinoPreferibile" placeholder="Vini preferibili (uno per riga)">${Array.isArray(ricetta.VinoPreferibile) ? ricetta.VinoPreferibile.join('\n') : ''}</textarea></label><br>
    <label>Immagine1 (foto o logo autore):<br><input type="file" id="file1" accept="image/*"><br><input name="Immagine1" id="url1" placeholder="URL immagine autore" value="${ricetta.Immagine1 || ''}" readonly></label><br>
    <label>Immagine2 (foto del piatto):<br><input type="file" id="file2" accept="image/*"><br><input name="Immagine2" id="url2" placeholder="URL immagine piatto" value="${ricetta.Immagine2 || ''}" readonly></label><br>
    <label>Immagine3 (foto passaggio):<br><input type="file" id="file3" accept="image/*"><br><input name="Immagine3" id="url3" placeholder="URL immagine passaggio" value="${ricetta.Immagine3 || ''}" readonly></label><br>
    <label>Ingredienti (uno per riga):<br><textarea name="Ingredienti" placeholder="Ingredienti (uno per riga)" required>${Array.isArray(ricetta.Ingredienti) ? ricetta.Ingredienti.join('\n') : ''}</textarea></label><br>
    <label>Istruzioni:<br><textarea name="Istruzioni" placeholder="Istruzioni" required>${ricetta.Istruzioni || ''}</textarea></label><br>
    <button type="submit">${index !== null ? '💾 Salva modifiche' : '➕ Aggiungi ricetta'}</button>
    <button type="button" onclick="hideForm()">❌ Annulla</button>
  `;
  form.onsubmit = async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {};
    
    // Converti FormData in oggetto gestendo correttamente i duplicati
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Se la chiave esiste già, prendi l'ultimo valore
        data[key] = value;
      } else {
        data[key] = value;
      }
    }
    
    // Ingredienti e vini come array
    data.Ingredienti = data.Ingredienti.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    data.VinoPreferibile = data.VinoPreferibile.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    
    try {
      if (index !== null) {
        const response = await fetch(`/api/ricette/${index}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Errore nel salvataggio');
      } else {
        const response = await fetch('/api/ricette', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Errore nell\'aggiunta');
      }
      hideForm();
      await loadRicette();
      alert(index !== null ? '✅ Ricetta modificata con successo!' : '✅ Ricetta aggiunta con successo!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };
  
  // Funzione per upload immagine
  async function uploadImage(file, urlInput) {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Errore upload');
      const result = await response.json();
      urlInput.value = result.url;
    } catch (error) {
      alert('Errore upload immagine: ' + error.message);
    }
  }
  
  // Event listeners per upload
  form.querySelector('#file1').addEventListener('change', (e) => uploadImage(e.target.files[0], form.querySelector('#url1')));
  form.querySelector('#file2').addEventListener('change', (e) => uploadImage(e.target.files[0], form.querySelector('#url2')));
  form.querySelector('#file3').addEventListener('change', (e) => uploadImage(e.target.files[0], form.querySelector('#url3')));
  
  document.getElementById('form-container').innerHTML = '';
  document.getElementById('form-container').appendChild(form);
  document.getElementById('form-container').style.display = 'block';
}

function hideForm() {
  document.getElementById('form-container').style.display = 'none';
}

async function editRicetta(index) {
  const res = await fetch(`/api/ricette/${index}`);
  const ricetta = await res.json();
  showForm(ricetta, index);
}

async function deleteRicetta(index) {
  if (confirm('Eliminare questa ricetta?')) {
    await fetch(`/api/ricette/${index}`, { method: 'DELETE' });
    loadRicette();
    document.getElementById('selected-recipe').style.display = 'none';
  }
}


let ricetteGlobal = [];
let filtroTipo = null;
let filtroTesto = '';

function groupByTipoPiatto(ricette) {
  const gruppi = {};
  ricette.forEach((r, idx) => {
    const tipo = r.TipoPiatto || 'Liquore';
    if (!gruppi[tipo]) gruppi[tipo] = [];
    gruppi[tipo].push({ ...r, _idx: r.id });
  });
  
  // Ordina alfabeticamente ogni gruppo
  Object.keys(gruppi).forEach(tipo => {
    gruppi[tipo].sort((a, b) => a.Nome.localeCompare(b.Nome, 'it'));
  });
  
  return gruppi;
}

function groupByAutore(ricette) {
  const gruppi = {};
  ricette.forEach((r, idx) => {
    const autore = r.Autore || 'Senza autore';
    if (!gruppi[autore]) gruppi[autore] = [];
    gruppi[autore].push({ ...r, _idx: r.id });
  });
  
  // Ordina alfabeticamente ogni gruppo
  Object.keys(gruppi).forEach(autore => {
    gruppi[autore].sort((a, b) => a.Nome.localeCompare(b.Nome, 'it'));
  });
  
  return gruppi;
}

function renderSidebar(ricette) {
  const authorSelect = document.getElementById('author-select');
  const recipeFilter = document.getElementById('recipe-filter');
  const treeContent = document.getElementById('tree-content');
  
  // Popola il combo box degli autori
  const autori = [...new Set(ricette.map(r => r.Autore).filter(a => a && a.trim()))].sort((a, b) => a.localeCompare(b, 'it'));
  authorSelect.innerHTML = '<option value="">Tutti gli autori</option>';
  autori.forEach(autore => {
    const option = document.createElement('option');
    option.value = autore;
    option.textContent = autore;
    authorSelect.appendChild(option);
  });
  
  // Crea l'albero organizzato per tipo piatti
  const gruppiTipo = groupByTipoPiatto(ricette);
  
  // Ordine canonico dei tipi di portata italiani
  const ordinePortate = [
    'Antipasto',
    'Primo',
    'Secondo', 
    'Piatto Unico',
    'Contorno',
    'Dolce',
    'Liquore'
  ];
  
  // Ordina i tipi secondo l'ordine canonico
  const tipiOrdinati = Object.keys(gruppiTipo).sort((a, b) => {
    const ia = ordinePortate.indexOf(a);
    const ib = ordinePortate.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  
  treeContent.innerHTML = '';
  
  tipiOrdinati.forEach(tipo => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'tree-category';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'tree-category-header';
    headerDiv.textContent = `${tipo} (${gruppiTipo[tipo].length})`;
    headerDiv.onclick = () => toggleCategory(headerDiv);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'tree-category-content expanded';
    
    gruppiTipo[tipo].forEach(ricetta => {
      const recipeDiv = document.createElement('div');
      recipeDiv.className = 'tree-recipe';
      recipeDiv.textContent = ricetta.Nome;
      recipeDiv.onclick = () => showRecipe(ricetta);
      contentDiv.appendChild(recipeDiv);
    });
    
    categoryDiv.appendChild(headerDiv);
    categoryDiv.appendChild(contentDiv);
    treeContent.appendChild(categoryDiv);
  });
  
  // Gestisci gli eventi dei filtri
  authorSelect.onchange = applyFilters;
  recipeFilter.oninput = applyFilters;
  
  // Gestisci i pulsanti di stampa
  document.getElementById('print-filtered').onclick = printFilteredRecipes;
  document.getElementById('print-all').onclick = printAllRecipes;
  
  // Inizializza il contatore
  updateTotalCounter(ricette.length);
}

function toggleCategory(header) {
  const content = header.nextElementSibling;
  content.classList.toggle('expanded');
}

function applyFilters() {
  const authorSelect = document.getElementById('author-select');
  const recipeFilter = document.getElementById('recipe-filter');
  const selectedAuthor = authorSelect.value;
  const filterText = recipeFilter.value.toLowerCase().trim();
  
  const treeRecipes = document.querySelectorAll('.tree-recipe');
  const treeCategories = document.querySelectorAll('.tree-category');
  
  let totalVisible = 0;
  
  treeRecipes.forEach(recipeDiv => {
    const recipeName = recipeDiv.textContent;
    const ricetta = ricetteGlobal.find(r => r.Nome === recipeName);
    if (!ricetta) return;
    
    const matchesAuthor = !selectedAuthor || ricetta.Autore === selectedAuthor;
    const matchesText = !filterText || 
                       ricetta.Nome.toLowerCase().includes(filterText) || 
                       (ricetta.Ingredienti && ricetta.Ingredienti.some(i => i.toLowerCase().includes(filterText))) ||
                       (ricetta.Istruzioni && ricetta.Istruzioni.toLowerCase().includes(filterText)) ||
                       (ricetta.Autore && ricetta.Autore.toLowerCase().includes(filterText)) ||
                       (ricetta.TipoPiatto && ricetta.TipoPiatto.toLowerCase().includes(filterText));
    
    if (matchesAuthor && matchesText) {
      recipeDiv.style.display = 'block';
      totalVisible++;
    } else {
      recipeDiv.style.display = 'none';
    }
  });
  
  // Mostra/nascondi le categorie se hanno ricette visibili
  treeCategories.forEach(category => {
    const visibleRecipes = category.querySelectorAll('.tree-recipe[style*="block"]');
    const header = category.querySelector('.tree-category-header');
    const categoryName = header.textContent.replace(/\(\d+\)$/, '').trim();
    
    if (visibleRecipes.length > 0) {
      category.style.display = 'block';
      header.textContent = `${categoryName} (${visibleRecipes.length})`;
    } else {
      category.style.display = 'none';
    }
  });
  
  // Aggiorna il contatore totale
  updateTotalCounter(totalVisible);
}

function updateTotalCounter(count) {
  const totalElement = document.getElementById('total-counter');
  if (!totalElement) {
    const counter = document.createElement('div');
    counter.id = 'total-counter';
    counter.style.cssText = 'margin-top: 1em; padding: 0.5em; background: rgba(52, 152, 219, 0.1); border-radius: 4px; text-align: center; color: #ecf0f1; font-size: 0.9em;';
    document.getElementById('filters').appendChild(counter);
  }
  document.getElementById('total-counter').textContent = `Ricette visibili: ${count} di ${ricetteGlobal.length}`;
}

function renderRicettaSelezionata(idx) {
  showRecipe(ricetteGlobal[idx]);
}

async function condividiRicetta(idx) {
  const ricetta = ricetteGlobal[idx];
  const testoCondivisione = `${ricetta.Nome}

Ingredienti:
${(ricetta.Ingredienti || []).map(i => `• ${i}`).join('\n')}

Istruzioni:
${ricetta.Istruzioni}

Tempo preparazione: ${ricetta.TempoPreparazione || '?'} min
Tempo cottura: ${ricetta.TempoCottura || '?'} min
Porzioni: ${ricetta.Quantita || '?'}`;

  // Prova a usare l'API Web Share se disponibile
  if (navigator.share) {
    try {
      await navigator.share({
        title: ricetta.Nome,
        text: testoCondivisione,
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        copiaRicettaInClipboard(testoCondivisione);
      }
    }
  } else {
    // Fallback: copia negli appunti
    copiaRicettaInClipboard(testoCondivisione);
  }
}

function copiaRicettaInClipboard(testo) {
  navigator.clipboard.writeText(testo).then(() => {
    alert('✅ Ricetta copiata negli appunti! Puoi incollarla dove vuoi.');
  }).catch(() => {
    // Fallback per browser che non supportano clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = testo;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('✅ Ricetta copiata negli appunti!');
  });
}

function filterRicette() {
  let ricette = ricetteGlobal;
  if (filtroTipo) ricette = ricette.filter(r => (r.TipoPiatto||'Liquore') === filtroTipo);
  if (filtroTesto) {
    const t = filtroTesto.toLowerCase();
    ricette = ricette.filter(r =>
      Object.values(r).some(val =>
        (Array.isArray(val) ? val.join(' ') : String(val || '')).toLowerCase().includes(t)
      )
    );
  }
  
  // Mostra tutte le ricette filtrate
  renderSidebar(ricette);
}

async function loadRicette() {
  currentRecipes = await fetchRicette();
  ricetteGlobal = currentRecipes;
  renderSidebar(currentRecipes);
}

document.addEventListener('DOMContentLoaded', () => {
  loadRicette();
  const search = document.getElementById('search-input');
  if (search) {
    search.addEventListener('input', e => {
      filtroTesto = e.target.value;
      filtroTipo = null;
      filterRicette();
    });
  }
  document.getElementById('print-filtered').addEventListener('click', printFilteredRecipes);
  document.getElementById('print-all').addEventListener('click', printAllRecipes);
});

function printFilteredRecipes() {
  // Raccogli tutte le ricette filtrate (visibili)
  const visibleRecipes = [];
  const treeRecipes = document.querySelectorAll('.tree-recipe[style*="block"]');
  
  treeRecipes.forEach(recipeDiv => {
    const recipeName = recipeDiv.textContent;
    const ricetta = ricetteGlobal.find(r => r.Nome === recipeName);
    if (ricetta) {
      visibleRecipes.push(ricetta);
    }
  });
  
  if (visibleRecipes.length === 0) {
    alert('Nessuna ricetta da stampare. Applica dei filtri per selezionare le ricette desiderate.');
    return;
  }
  
  // Genera HTML per la stampa
  let html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ricette Filtrate - ${new Date().toLocaleDateString('it-IT')}</title>
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .page-break { page-break-before: always; }
          .recipe { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
          .recipe-title { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
          .recipe-meta { font-size: 12px; color: #7f8c8d; margin-bottom: 15px; }
          .recipe-section { margin: 10px 0; }
          .recipe-section strong { color: #2980b9; }
          .ingredients { background: #f8f9fa; padding: 10px; border-left: 4px solid #f39c12; margin: 10px 0; }
          .ingredients ul { margin: 0; padding-left: 20px; }
          .instructions { line-height: 1.6; margin: 15px 0; }
          .recipe-images { margin: 10px 0; }
          .recipe-images img { max-width: 150px; margin-right: 10px; height: auto; }
          #recipe-image-2 img { width: 200px; height: auto; }
          .header { text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #2c3e50; margin: 0; }
          .header p { color: #7f8c8d; margin: 5px 0 0 0; }
          /* Stili per il template */
          .recipe-name { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; display: block; }
          #container1, #container2 { margin: 10px 0; }
          #pannello1 { margin-bottom: 10px; }
          .ingredienti-list { margin: 0; padding-left: 20px; }
          .recipe-instructions { line-height: 1.6; margin: 15px 0; display: block; }
          .edit-btn, .delete-btn, .print-btn { display: none !important; }
        }
        
        @media screen {
          body { font-family: Arial, sans-serif; margin: 20px; }
          .print-hint { background: #e8f4f8; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; margin-bottom: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Ricette di Cucina</h1>
        <p>Stampato il ${new Date().toLocaleDateString('it-IT')} - ${visibleRecipes.length} ricette filtrate</p>
      </div>
      
      <div class="print-hint">
        <strong>Suggerimento:</strong> Usa Ctrl+P (o Cmd+P su Mac) per stampare questo documento come PDF, oppure salva come PDF dal tuo browser.
      </div>
  `;
  
  // Aggiungi ogni ricetta
  visibleRecipes.forEach((ricetta, index) => {
    if (index > 0) {
      html += '<div class="page-break"></div>';
    }
    
    html += generateRecipeHTML(ricetta);
  });
  
  html += `
    </body>
    </html>
  `;
  
  // Apri in una nuova finestra
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Attendi che la pagina sia caricata prima di suggerire la stampa
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.focus();
      // Non chiamare automaticamente print() per dare all'utente il controllo
    }, 500);
  };
}

function printAllRecipes() {
  // Usa tutte le ricette del ricettario
  const allRecipes = [...ricetteGlobal];
  
  if (allRecipes.length === 0) {
    alert('Nessuna ricetta da stampare.');
    return;
  }
  
  // Ordina le ricette per tipo piatto e poi per nome (come nell'albero)
  const gruppiTipo = groupByTipoPiatto(allRecipes);
  
  // Ordine canonico dei tipi di portata italiani
  const ordinePortate = [
    'Antipasto',
    'Primo',
    'Secondo', 
    'Piatto Unico',
    'Contorno',
    'Dolce',
    'Liquore'
  ];
  
  // Riordina secondo l'ordine canonico
  const tipiOrdinati = Object.keys(gruppiTipo).sort((a, b) => {
    const ia = ordinePortate.indexOf(a);
    const ib = ordinePortate.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  
  // Genera HTML per la stampa
  let html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ricettario Completo - ${new Date().toLocaleDateString('it-IT')}</title>
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .page-break { page-break-before: always; }
          .category-title { font-size: 16px; font-weight: bold; color: #2980b9; margin: 20px 0 10px 0; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
          .recipe { margin-bottom: 25px; border-bottom: 1px solid #ecf0f1; padding-bottom: 15px; }
          .recipe-title { font-size: 16px; font-weight: bold; color: #2c3e50; margin-bottom: 8px; }
          .recipe-meta { font-size: 11px; color: #7f8c8d; margin-bottom: 12px; }
          .recipe-section { margin: 8px 0; font-size: 12px; }
          .recipe-section strong { color: #2980b9; }
          .ingredients { background: #f8f9fa; padding: 8px; border-left: 3px solid #f39c12; margin: 8px 0; }
          .ingredients ul { margin: 0; padding-left: 18px; }
          .instructions { line-height: 1.5; margin: 12px 0; font-size: 12px; }
          .recipe-images { margin: 8px 0; }
          .recipe-images img { max-width: 150px; margin-right: 8px; height: auto; }
          #recipe-image-2 img { width: 200px; height: auto; }
          .header { text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { color: #2c3e50; margin: 0; font-size: 24px; }
          .header p { color: #7f8c8d; margin: 5px 0 0 0; font-size: 14px; }
          /* Stili per il template */
          .recipe-name { font-size: 16px; font-weight: bold; color: #2c3e50; margin-bottom: 8px; display: block; }
          #container1, #container2 { margin: 8px 0; }
          #pannello1 { margin-bottom: 8px; }
          .ingredienti-list { margin: 0; padding-left: 18px; }
          .recipe-instructions { line-height: 1.5; margin: 12px 0; font-size: 12px; display: block; }
          .edit-btn, .delete-btn, .print-btn { display: none !important; }
        }
        
        @media screen {
          body { font-family: Arial, sans-serif; margin: 20px; }
          .print-hint { background: #e8f4f8; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; margin-bottom: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Ricettario Completo</h1>
        <p>Stampato il ${new Date().toLocaleDateString('it-IT')} - ${allRecipes.length} ricette totali</p>
      </div>
      
      <div class="print-hint">
        <strong>Suggerimento:</strong> Usa Ctrl+P (o Cmd+P su Mac) per stampare questo documento come PDF, oppure salva come PDF dal tuo browser.
      </div>
  `;
  
  // Aggiungi ogni categoria e le sue ricette
  tipiOrdinati.forEach(tipo => {
    html += `<div class="category-title">${tipo} (${gruppiTipo[tipo].length} ricette)</div>`;
    
    gruppiTipo[tipo].forEach(ricetta => {
      html += generateRecipeHTML(ricetta);
    });
    
    // Aggiungi un'interruzione di pagina dopo ogni categoria (eccetto l'ultima)
    if (tipo !== tipiOrdinati[tipiOrdinati.length - 1]) {
      html += '<div class="page-break"></div>';
    }
  });
  
  html += `
    </body>
    </html>
  `;
  
  // Apri in una nuova finestra
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Attendi che la pagina sia caricata
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.focus();
    }, 500);
  };
}
