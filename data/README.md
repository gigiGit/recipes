# Recipe Editor App

Questa app web permette di modificare facilmente le istruzioni delle ricette presenti nella cartella `Istruzioni`.

## Come usare

1. Installa le dipendenze: `npm install`
2. Avvia il server: `npm start`
3. Apri il browser e vai a `http://localhost:3000`
4. Nella sidebar, clicca su un file per caricarlo nell'editor.
5. Modifica il contenuto e clicca "Save" per salvare.

## Struttura

- `server.js`: Server Express con API per leggere/scrivere file.
- `public/`: File statici del frontend.
  - `index.html`: Pagina principale.
  - `style.css`: Stili.
  - `app.js`: Logica JavaScript.