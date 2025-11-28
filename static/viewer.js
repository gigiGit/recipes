
let ricetteGlobal = [];
let filtroTipo = null;
let filtroTesto = '';

function renderRicette(ricette) {
  const list = document.getElementById('ricette-list');
  list.innerHTML = '';
  ricette.forEach((r) => {
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
    `;
    list.appendChild(li);
  });
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

function groupByTipoPiatto(ricette) {
  const gruppi = {};
  ricette.forEach((r, idx) => {
    const tipo = r.TipoPiatto || 'Altro';
    if (!gruppi[tipo]) gruppi[tipo] = [];
    gruppi[tipo].push({ ...r, _idx: idx });
  });
  return gruppi;
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

document.addEventListener('DOMContentLoaded', () => {
  // recipes è già globale
  ricetteGlobal = recipes;
  renderSidebar(ricetteGlobal);
  filterRicette();
  const search = document.getElementById('search-input');
  if (search) {
    search.addEventListener('input', e => {
      filtroTesto = e.target.value;
      filtroTipo = null;
      filterRicette();
    });
  }
});
