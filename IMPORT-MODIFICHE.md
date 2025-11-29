# Import Modifiche Android - Guida Rapida

Script Node.js per importare incrementalmente le modifiche dall'app Android.

## Utilizzo Base

```bash
node import-modifications.js recipe_modifications.json
```

## Cosa Fa

1. ✅ Legge il file JSON delle modifiche (ricevuto via email dall'app Android)
2. ✅ Crea backup automatici di `recipes.json` e `recipes.db`
3. ✅ Aggiunge nuove ricette al database principale
4. ✅ Aggiorna ricette esistenti con le modifiche
5. ✅ Rimuove duplicati dal database SQLite
6. ✅ Sincronizza sia JSON che database
7. ✅ Archivia il file importato con timestamp

## Workflow Completo

### 1. Ricevi Email dall'App Android

L'app invia modifiche via email a `famiglia.giusti2018@gmail.com` con allegato `recipe_modifications.json`

### 2. Salva il File

Scarica l'allegato email nella cartella del progetto:
```
C:\git-repo\recipes\recipe_modifications.json
```

### 3. Importa le Modifiche

```bash
cd C:\git-repo\recipes
node import-modifications.js recipe_modifications.json
```

### 4. Verifica il Risultato

Lo script mostra:
- ➕ Ricette aggiunte
- ✏️ Ricette aggiornate
- ➖ Ricette invariate
- ❌ Eventuali errori

**Output esempio:**
```
📱 Import incrementale modifiche Android

📦 Trovate 2 modifiche da importare

💾 Backup creato: recipes.json.backup-2025-11-29T21-56-10
📖 Ricette esistenti: 100
➕ Aggiunta: Carbonara
✏️ Aggiornata: Tiramisù

✅ File recipes.json aggiornato
📊 Totale ricette: 101

🔄 Aggiornamento database SQLite...
💾 Backup DB: recipes.db.backup-2025-11-29T21-56-10
🔍 Controllo duplicati nel database...
⚠️ Trovati 1 nomi duplicati, risoluzione in corso...
   🧹 Rimossi 1 duplicati di "Tiramisù"
✅ Database aggiornato: 1 aggiunte, 1 aggiornate

📊 RIEPILOGO IMPORTAZIONE
==================================================
➕ Ricette aggiunte:      1
✏️ Ricette aggiornate:    1
➖ Ricette invariate:     0
❌ Errori:                0
==================================================
📦 Totale ricette finali: 101

📁 Modifiche archiviate: recipe_modifications.json.imported-2025-11-29T21-56-10
```

### 5. File Archiviati

Dopo l'import trovi:
- `recipe_modifications.json.imported-TIMESTAMP` - Modifiche archiviate
- `recipes.json.backup-TIMESTAMP` - Backup JSON
- `recipes.db.backup-TIMESTAMP` - Backup database

Puoi eliminare `recipe_modifications.json` se l'import è andato a buon fine.

## Sicurezza

✅ **Backup automatici**: Ogni import crea backup con timestamp  
✅ **Rollback manuale**: Ripristina da `.backup-*` se necessario  
✅ **Gestione duplicati**: Rimuove automaticamente ricette duplicate  
✅ **Verifica modifiche**: Mostra cosa cambia prima di applicare  

## Ripristino da Backup

Se qualcosa va storto:

```powershell
# Ripristina JSON
Copy-Item recipes.json.backup-2025-11-29T21-56-10 recipes.json

# Ripristina database
Copy-Item recipes.db.backup-2025-11-29T21-56-10 recipes.db
```

## Parametri

```bash
# File specifico
node import-modifications.js mie_modifiche.json

# File di default (recipe_modifications.json)
node import-modifications.js
```

## Requisiti

- Node.js (già installato)
- Modulo `better-sqlite3` (già installato)
- `recipes.json` esistente
- `recipes.db` (opzionale, viene creato se manca)

## Limiti

⚠️ **Non eseguire in WSL**: Il modulo better-sqlite3 è compilato per Windows  
⚠️ **Un import alla volta**: Attendi che finisca prima di importare altro  
⚠️ **Verifica backup**: Controlla sempre che ci sia spazio su disco per i backup  

## Integrazione Build Android

Dopo l'import, ricostruisci l'APK Android per includere le nuove ricette:

```bash
cd android
.\build.bat
```

Questo sincronizza automaticamente `recipes.json` nell'app Android.
