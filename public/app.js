
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
  
  // Ordina alfabeticamente ogni gruppo
  Object.keys(gruppi).forEach(tipo => {
    gruppi[tipo].sort((a, b) => a.Nome.localeCompare(b.Nome, 'it'));
  });
  
  return gruppi;
}

function renderSidebar(ricette) {
  const tabButtons = document.getElementById('tab-buttons');
  const tabContent = document.getElementById('tab-content');
  tabButtons.innerHTML = '';
  tabContent.innerHTML = '';
  
  const gruppi = groupByTipoPiatto(ricette);
  
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
  
  // Ordina i tipi secondo l'ordine canonico
  const tipiOrdinati = Object.keys(gruppi).sort((a, b) => {
    const ia = ordinePortate.indexOf(a);
    const ib = ordinePortate.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  
  // Tab "Tutte"
  const allTab = document.createElement('button');
  allTab.className = 'tab-button active';
  allTab.textContent = 'Tutte';
  allTab.onclick = () => switchTab('all');
  tabButtons.appendChild(allTab);
  
  const allPane = document.createElement('div');
  allPane.className = 'tab-pane active';
  allPane.id = 'tab-all';
  const allUl = document.createElement('ul');
  ricette.forEach((r, idx) => {
    const li = document.createElement('li');
    const link = document.createElement('span');
    link.className = 'ricetta-link';
    link.textContent = r.Nome;
    link.onclick = () => {
      filtroTipo = null;
      filtroTesto = '';
      document.getElementById('search-input').value = '';
      renderRicettaSelezionata(idx);
    };
    li.appendChild(link);
    allUl.appendChild(li);
  });
  allPane.appendChild(allUl);
  tabContent.appendChild(allPane);
  
  // Crea tab per ogni tipo
  tipiOrdinati.forEach(tipo => {
    const tab = document.createElement('button');
    tab.className = 'tab-button';
    tab.textContent = tipo;
    tab.onclick = () => switchTab(tipo);
    tabButtons.appendChild(tab);
    
    const pane = document.createElement('div');
    pane.className = 'tab-pane';
    pane.id = `tab-${tipo.toLowerCase().replace(/\s+/g, '-')}`;
    const ul = document.createElement('ul');
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
    pane.appendChild(ul);
    tabContent.appendChild(pane);
  });
}

function switchTab(tipo) {
  // Rimuovi classe active da tutti i pulsanti
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  // Nascondi tutti i pannelli
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  
  // Attiva il tab selezionato
  if (tipo === 'all') {
    document.querySelector('.tab-button').classList.add('active');
    document.getElementById('tab-all').classList.add('active');
  } else {
    const tabId = tipo.toLowerCase().replace(/\s+/g, '-');
    // Trova e attiva il pulsante corrispondente
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => {
      if (btn.textContent === tipo) {
        btn.classList.add('active');
      }
    });
    const tabPane = document.getElementById(`tab-${tabId}`);
    if (tabPane) {
      tabPane.classList.add('active');
    }
  }
}

function renderRicettaSelezionata(idx) {
  const ricetta = ricetteGlobal[idx];
  const list = document.getElementById('ricette-list');
  list.innerHTML = '';
  const li = document.createElement('li');
  li.innerHTML = `
    <b>${ricetta.Nome}</b>
    <div style="margin: 1em 0;">
      <small>Inserita il: ${ricetta.DataInserimento || ''} da ${ricetta.Autore || ''}</small>
    </div>
    <div style="margin: 1em 0;">
      <span class="ricetta-info"><strong>Difficoltà:</strong> ${ricetta.Difficolta || ''}</span>
      <span class="ricetta-info"><strong>Costo:</strong> ${ricetta.Costo || ''}</span>
    </div>
    <div style="margin: 1em 0;">
      <span class="ricetta-info"><strong>Tempo preparazione:</strong> ${ricetta.TempoPreparazione || ''} min</span>
      <span class="ricetta-info"><strong>Tempo cottura:</strong> ${ricetta.TempoCottura || ''} min</span>
    </div>
    <div style="margin: 1em 0;">
      <span class="ricetta-info"><strong>Quantità:</strong> ${ricetta.Quantita || ''} porzioni</span>
      <span class="ricetta-info"><strong>Metodo cottura:</strong> ${ricetta.MetodoCottura || ''}</span>
    </div>
    <div style="margin: 1em 0;">
      <span class="ricetta-info"><strong>Tipo piatto:</strong> ${ricetta.TipoPiatto || ''}</span>
      <span class="ricetta-info"><strong>Vino preferibile:</strong> ${(ricetta.VinoPreferibile||[]).join(', ')}</span>
    </div>
    <div style="margin: 1.5em 0;">
      <strong style="font-size: 1.2em; color: #f39c12; display: block; margin-bottom: 0.5em;">🥘 Ingredienti:</strong>
      <ul class="ingredienti-list">${(ricetta.Ingredienti||[]).map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
    <div class="ricetta-istruzioni">
      <strong style="font-size: 1.2em; color: #27ae60; display: block; margin-bottom: 0.8em;">📝 Istruzioni:</strong>
      ${ricetta.Istruzioni}
    </div>
    <div style="margin-top: 2em; padding-top: 1.5em; border-top: 2px solid #ecf0f1;">
      <button onclick="editRicetta(${idx})">✏️ Modifica</button>
      <button onclick="deleteRicetta(${idx})" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);">🗑️ Elimina</button>
      <button onclick="window.print()" style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%);">🖨️ Stampa Ricetta</button>
      <button onclick="condividiRicetta(${idx})" style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);">📤 Condividi</button>
    </div>
  `;
  list.appendChild(li);
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
  
  // Se c'è una ricerca attiva e ci sono risultati, seleziona la prima ricetta e attiva il tab corrispondente
  if (filtroTesto && ricette.length > 0) {
    const primaRicetta = ricette[0];
    const idxGlobale = ricetteGlobal.findIndex(r => r.Nome === primaRicetta.Nome);
    if (idxGlobale !== -1) {
      renderRicettaSelezionata(idxGlobale);
      // Attiva il tab corrispondente al tipo di piatto della prima ricetta
      const tipoPiatto = primaRicetta.TipoPiatto || 'Altro';
      switchTab(tipoPiatto);
    }
  }
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
