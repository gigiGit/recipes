# Sistema di Backup SQLite per Ricette

## Panoramica

Questo sistema fornisce backup e ripristino del file `recipes.json` utilizzando un database SQLite come storage sicuro.

## File Componenti

- **`import-to-db.js`**: Importa `recipes.json` nel database SQLite
- **`export-from-db.js`**: Esporta il database SQLite in `recipes.json`
- **`recipes.db`**: Database SQLite (creato automaticamente)

## Struttura Database

Il database contiene 3 tabelle con relazioni normalizzate:

```sql
ricette
  ├── id (PRIMARY KEY)
  ├── nome, autore, data_inserimento
  ├── difficolta, costo
  ├── tempo_preparazione, tempo_cottura, quantita
  ├── metodo_cottura, tipo_piatto
  └── istruzioni

ingredienti
  ├── id (PRIMARY KEY)
  ├── ricetta_id (FOREIGN KEY → ricette.id)
  └── ingrediente

vini
  ├── id (PRIMARY KEY)
  ├── ricetta_id (FOREIGN KEY → ricette.id)
  └── vino
```

Indici creati: `nome`, `tipo_piatto`, `autore`

## Utilizzo

### Creare un Backup

```powershell
node import-to-db.js
```

Questo comando:
- Legge `recipes.json`
- Crea automaticamente backup del database esistente (se presente) con timestamp
- Crea nuovo `recipes.db` con tutte le ricette
- Mostra statistiche per tipo di piatto

**Output esempio:**
```
📦 Trovate 9 ricette in recipes.json
💾 Backup creato: recipes.db.backup-2025-11-29T21-31-59
✅ Tabelle create
✅ Database aggiornato: recipes.db
📊 Ricette importate: 9

Ricette per tipo:
  Dolce: 7
  Altro: 1
  Primo: 1

📦 Dimensione database: 40.00 KB
```

### Ripristinare da Backup

```powershell
node export-from-db.js
```

Questo comando:
- Legge `recipes.db`
- Genera nuovo `recipes.json` con tutti i dati
- Ordina alfabeticamente per nome
- Mostra statistiche

**Output esempio:**
```
📦 Esportazione ricette dal database SQLite...
✅ Esportate 9 ricette in recipes.json
📊 Dimensione file: 10.82 KB

Ricette per tipo:
  Dolce: 7
  Altro: 1
  Primo: 1
```

## Quando Creare Backup

Consigliato creare backup:
- **Giornalmente** se si modificano molte ricette
- **Prima di modifiche massive** (import/export grandi)
- **Prima di aggiornamenti** dell'app o del server
- **Settimanalmente** per sicurezza generale

## Ripristino d'Emergenza

Se `recipes.json` è corrotto o cancellato:

```powershell
# 1. Verifica che recipes.db esista
Test-Path recipes.db

# 2. Fai backup del JSON corrotto (opzionale)
Copy-Item recipes.json recipes.json.corrupted

# 3. Ripristina dal database
node export-from-db.js

# 4. Verifica il ripristino
node -p "(require('./recipes.json')).length"
```

## Backup File Database

I file `.db.backup-*` vengono creati automaticamente. Per archiviazione a lungo termine:

```powershell
# Copia il database in una posizione sicura
Copy-Item recipes.db "D:\Backup\recipes-$(Get-Date -Format 'yyyy-MM-dd').db"
```

## Vantaggi del Sistema SQLite

✅ **Integrità dei dati**: Foreign keys e vincoli NOT NULL  
✅ **Performance**: Indici su campi chiave (nome, tipo, autore)  
✅ **Backup automatici**: File .backup-* con timestamp  
✅ **Ripristino rapido**: Un solo comando per rigenerare JSON  
✅ **Query SQL**: Possibilità di interrogare i dati con SQL standard  
✅ **Compattezza**: Database più piccolo del JSON equivalente  

## Requisiti

- Node.js (già installato)
- Modulo `better-sqlite3` (già installato via npm)

## Note

- L'export ordina sempre le ricette alfabeticamente
- Il formato JSON esportato è identico all'originale
- I backup automatici includono timestamp nel nome file
- Non rimuovere i file `.db.backup-*` senza verificare prima
