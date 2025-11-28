
// --- Versione coerente e senza duplicati ---
async function fetchRicette() {
  const res = await fetch('/api/ricette');
  return res.json();
}

function renderRicette(ricette) {
  const list = document.getElementById('ricette-list');
  list.innerHTML = '';
  ricette.forEach((r, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <b>${r.Nome}</b><br>
      <small>Inserita il: ${r.DataInserimento || ''} da ${r.Autore || ''}</small><br>
      Difficoltà: ${r.Difficolta || ''} | Costo: ${r.Costo || ''}<br>
      Tempo prep: ${r.TempoPreparazione || ''} min | Tempo cottura: ${r.TempoCottura || ''} min<br>
      Quantità: ${r.Quantita || ''} porzioni<br>
      Metodo cottura: ${r.MetodoCottura || ''}<br>
      Tipo piatto: ${r.TipoPiatto || ''}<br>
      Vino preferibile: ${(r.VinoPreferibile||[]).join(', ')}<br>
      Ingredienti:<ul class="ingredienti-list">${(r.Ingredienti||[]).map(i => `<li>${i}</li>`).join('')}</ul>
      Istruzioni: ${r.Istruzioni}<br>
      <button onclick="editRicetta(${idx})">Modifica</button>
      <button onclick="deleteRicetta(${idx})">Elimina</button>`;
    list.appendChild(li);
  });
}

async function loadRicette() {
  const ricette = await fetchRicette();
  renderRicette(ricette);
}

function showForm(ricetta = {}, index = null) {
  const form = document.createElement('form');
  form.innerHTML = `
    <input name="Nome" placeholder="Nome ricetta" value="${ricetta.Nome || ''}" required><br>
    <input name="Autore" placeholder="Autore" value="${ricetta.Autore || ''}"><br>
    <input name="DataInserimento" type="date" value="${ricetta.DataInserimento || ''}"><br>
    <select name="Difficolta">
      <option value="">Difficoltà</option>
      <option value="facile" ${ricetta.Difficolta==='facile'?'selected':''}>Facile</option>
      <option value="Medio" ${ricetta.Difficolta==='Medio'?'selected':''}>Medio</option>
      <option value="Difficile" ${ricetta.Difficolta==='Difficile'?'selected':''}>Difficile</option>
      <option value="veri esperti" ${ricetta.Difficolta==='veri esperti'?'selected':''}>Veri esperti</option>
    </select><br>
      <label>Costo:<br><select name="Costo">
        <option value="">Scegli costo</option>
        <option value="economico" ${ricetta.Costo==='economico'?'selected':''}>Economico</option>
        <option value="medio" ${ricetta.Costo==='medio'?'selected':''}>Medio</option>
        <option value="costoso" ${ricetta.Costo==='costoso'?'selected':''}>Costoso</option>
      </select></label><br>
    <input name="TempoPreparazione" type="number" placeholder="Tempo preparazione (min)" value="${ricetta.TempoPreparazione || ''}"><br>
    <input name="TempoCottura" type="number" placeholder="Tempo cottura (min)" value="${ricetta.TempoCottura || ''}"><br>
    <input name="Quantita" type="number" placeholder="Quantità (porzioni)" value="${ricetta.Quantita || ''}"><br>
    <select name="MetodoCottura">
      <option value="">Metodo di cottura</option>
      <option value="Forno" ${ricetta.MetodoCottura==='Forno'?'selected':''}>Forno</option>
      <option value="Fornello" ${ricetta.MetodoCottura==='Fornello'?'selected':''}>Fornello</option>
      <option value="Nessuna" ${ricetta.MetodoCottura==='Nessuna'?'selected':''}>Nessuna</option>
      <option value="Microonde" ${ricetta.MetodoCottura==='Microonde'?'selected':''}>Microonde</option>
      <option value="Induzione" ${ricetta.MetodoCottura==='Induzione'?'selected':''}>Induzione</option>
      <option value="friggitrice" ${ricetta.MetodoCottura==='friggitrice'?'selected':''}>Friggitrice</option>
      <option value="tostapane" ${ricetta.MetodoCottura==='tostapane'?'selected':''}>Tostapane</option>
    </select><br>
      <label>Metodo di cottura:<br><select name="MetodoCottura">
        <option value="">Scegli metodo</option>
        <option value="Forno" ${ricetta.MetodoCottura==='Forno'?'selected':''}>Forno</option>
        <option value="Fornello" ${ricetta.MetodoCottura==='Fornello'?'selected':''}>Fornello</option>
        <option value="Nessuna" ${ricetta.MetodoCottura==='Nessuna'?'selected':''}>Nessuna</option>
        <option value="Microonde" ${ricetta.MetodoCottura==='Microonde'?'selected':''}>Microonde</option>
        <option value="Induzione" ${ricetta.MetodoCottura==='Induzione'?'selected':''}>Induzione</option>
        <option value="friggitrice" ${ricetta.MetodoCottura==='friggitrice'?'selected':''}>Friggitrice</option>
        <option value="tostapane" ${ricetta.MetodoCottura==='tostapane'?'selected':''}>Tostapane</option>
      </select></label><br>
      <label>Tipo piatto:<br><input name="TipoPiatto" placeholder="Tipo piatto" value="${ricetta.TipoPiatto || ''}"></label><br>
    <textarea name="VinoPreferibile" placeholder="Vini preferibili (uno per riga)">${Array.isArray(ricetta.VinoPreferibile) ? ricetta.VinoPreferibile.join('\n') : ''}</textarea><br>
    <textarea name="Ingredienti" placeholder="Ingredienti (uno per riga)" required>${Array.isArray(ricetta.Ingredienti) ? ricetta.Ingredienti.join('\n') : ''}</textarea><br>
    <textarea name="Istruzioni" placeholder="Istruzioni" required>${ricetta.Istruzioni || ''}</textarea><br>
    <button type="submit">${index !== null ? 'Salva' : 'Aggiungi'}</button>
    <button type="button" onclick="hideForm()">Annulla</button>
  `;
  form.onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    // Ingredienti e vini come array
    data.Ingredienti = data.Ingredienti.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    data.VinoPreferibile = data.VinoPreferibile.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (index !== null) {
      await fetch(`/api/ricette/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch('/api/ricette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    hideForm();
    loadRicette();
  };
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
  }
}


let ricetteGlobal = [];
let filtroTipo = null;
let filtroTesto = '';

function groupByTipoPiatto(ricette) {
  const gruppi = {};
  ricette.forEach((r, idx) => {
    const tipo = r.TipoPiatto || 'Altro';
    if (!gruppi[tipo]) gruppi[tipo] = [];
    gruppi[tipo].push({ ...r, _idx: idx });
  });
  return gruppi;
}

function renderSidebar(ricette) {
  const sidebar = document.getElementById('sidebar-list');
  sidebar.innerHTML = '';
  const gruppi = groupByTipoPiatto(ricette);
  // Pulsante per tornare all'elenco completo
  const allBtn = document.createElement('button');
  allBtn.textContent = 'Mostra tutte le ricette';
  allBtn.style.marginBottom = '1em';
  allBtn.onclick = () => {
    filtroTipo = null;
    filtroTesto = '';
    document.getElementById('search-input').value = '';
    filterRicette();
  };
  sidebar.appendChild(allBtn);
  // Ordine canonico dei tipi di portata italiani
  const ordinePortate = [
    'Antipasto',
    'Primo',
    'Secondo',
    'Piatto Unico',
    'Contorno',
    'Dolce',
    'Altro'
  ];
  // Ordina i tipi secondo l'ordine canonico, aggiungendo eventuali tipi non previsti in fondo in ordine alfabetico
  const tipiOrdinati = Object.keys(gruppi).sort((a, b) => {
    const ia = ordinePortate.indexOf(a);
    const ib = ordinePortate.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  tipiOrdinati.forEach(tipo => {
    const header = document.createElement('div');
    header.className = 'tipo-header';
    header.textContent = tipo;
    header.onclick = () => {
      const ul = header.nextSibling;
      ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
    };
    sidebar.appendChild(header);
    const ul = document.createElement('ul');
    ul.style.display = 'block';
    gruppi[tipo].forEach(r => {
      const li = document.createElement('li');
      const link = document.createElement('span');
      link.className = 'ricetta-link';
      link.textContent = r.Nome;
      link.onclick = () => {
        filtroTipo = null;
        filtroTesto = '';
        document.getElementById('search-input').value = '';
        renderRicettaSelezionata(r._idx);
      };
      li.appendChild(link);
      ul.appendChild(li);
    });
    sidebar.appendChild(ul);
  });
}

function renderRicettaSelezionata(idx) {
  const ricetta = ricetteGlobal[idx];
  const list = document.getElementById('ricette-list');
  list.innerHTML = '';
  const li = document.createElement('li');
  li.innerHTML = `
    <b>${ricetta.Nome}</b><br>
    <small>Inserita il: ${ricetta.DataInserimento || ''} da ${ricetta.Autore || ''}</small><br>
    Difficoltà: ${ricetta.Difficolta || ''} | Costo: ${ricetta.Costo || ''}<br>
    Tempo prep: ${ricetta.TempoPreparazione || ''} min | Tempo cottura: ${ricetta.TempoCottura || ''} min<br>
    Quantità: ${ricetta.Quantita || ''} porzioni<br>
    Metodo cottura: ${ricetta.MetodoCottura || ''}<br>
    Tipo piatto: ${ricetta.TipoPiatto || ''}<br>
    Vino preferibile: ${(ricetta.VinoPreferibile||[]).join(', ')}<br>
    Ingredienti:<ul class="ingredienti-list">${(ricetta.Ingredienti||[]).map(i => `<li>${i}</li>`).join('')}</ul>
    Istruzioni: ${ricetta.Istruzioni}<br>
    <button onclick="editRicetta(${idx})">Modifica</button>
    <button onclick="deleteRicetta(${idx})">Elimina</button>
  `;
  list.appendChild(li);
}

function filterRicette() {
  let ricette = ricetteGlobal;
  if (filtroTipo) ricette = ricette.filter(r => (r.TipoPiatto||'Altro') === filtroTipo);
  if (filtroTesto) {
    const t = filtroTesto.toLowerCase();
    ricette = ricette.filter(r =>
      Object.values(r).some(val =>
        (Array.isArray(val) ? val.join(' ') : String(val || '')).toLowerCase().includes(t)
      )
    );
  }
  renderRicette(ricette);
}

async function loadRicette() {
  ricetteGlobal = await fetchRicette();
  renderSidebar(ricetteGlobal);
  filterRicette();
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
});
