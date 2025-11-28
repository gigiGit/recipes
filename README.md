# Inventario Ricette di Cucina

Questo progetto è una semplice applicazione Node.js per gestire un inventario di ricette di cucina, utilizzando un file JSON come database. Comprende:

- Un backend Node.js/Express per inserire, modificare, eliminare e visualizzare ricette
- Un database locale in formato JSON
- Un generatore di pagine statiche HTML per la consultazione offline di tutte le ricette

## Funzionalità
- Aggiungi, modifica, elimina ricette
- Visualizza tutte le ricette
- Esporta tutte le ricette in pagine HTML statiche

## Avvio rapido
1. Installa le dipendenze:
   ```
npm install
   ```
2. Avvia il server:
   ```
npm start
   ```
3. Per generare le pagine statiche:
   ```
npm run build-static
   ```

## Struttura del progetto
- `recipes.json` — Database delle ricette
- `server.js` — Backend Express
- `static-generator.js` — Script per generare pagine statiche
- `public/` — Frontend web
- `static/` — Pagine HTML statiche generate

## Note
- Tutti i dati sono salvati localmente, nessun database esterno richiesto.
- Le pagine statiche sono consultabili offline.
