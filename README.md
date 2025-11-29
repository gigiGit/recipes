# Inventario Ricette di Cucina

Applicazione completa per la gestione di ricette di cucina con interfaccia web e app Android nativa.

## 📱 Applicazioni Disponibili

### App Web (Node.js/Express)
Interfaccia web per gestire le ricette con funzionalità complete di CRUD.

**Funzionalità:**
- ✅ Aggiungi, modifica, elimina ricette
- ✅ Ricerca per nome, ingredienti, tipo piatto
- ✅ Suddivisione per portate (Antipasto, Primo, Secondo, Contorno, Dolce)
- ✅ Ordinamento alfabetico automatico
- ✅ Database JSON locale

**Avvio:**
```bash
npm install
npm start
```
Apri http://localhost:3000

### App Android Nativa
Applicazione Android per visualizzare e condividere ricette.

**Funzionalità:**
- ✅ Visualizzazione ricette con tab per portate
- ✅ Ricerca full-text
- ✅ Condivisione ricette
- ✅ Ordinamento alfabetico
- ✅ Material Design UI

**Build APK:**
```batch
build.bat
```
Richiede JDK 17 e Android SDK.

## 🚀 Avvio Rapido

### Applicazione Web
```bash
npm install
npm start
```

### Build App Android
```batch
cd c:\git-repo\recipes
build.bat
```

Lo script:
1. Sincronizza automaticamente `recipes.json` dall'app web
2. Compila l'APK di debug
3. Chiede se installare sul dispositivo USB

## 📁 Struttura del Progetto

```
recipes/
├── recipes.json              # Database ricette (condiviso)
├── server.js                 # Server Express
├── package.json              # Dipendenze Node.js
├── build.bat                 # Build script Android
├── public/                   # Frontend web
│   ├── app.js               # Logica interfaccia web
│   ├── index.html           # UI web
│   └── style.css            # Stili web
└── RecipesApp/              # Progetto Android nativo
    ├── app/
    │   └── src/main/
    │       ├── java/com/recipes/app/
    │       │   ├── MainActivity.java
    │       │   ├── RecipeDetailActivity.java
    │       │   ├── RecipeListFragment.java
    │       │   ├── RecipesPagerAdapter.java
    │       │   ├── RecipeAdapter.java
    │       │   ├── RecipeManager.java
    │       │   └── Recipe.java
    │       ├── res/           # Risorse Android
    │       └── assets/
    │           └── recipes.json  # Copia sincronizzata
    ├── build.gradle
    └── sync-recipes.ps1      # Script sincronizzazione
```

## 🔄 Sincronizzazione Ricette

Il file `recipes.json` è condiviso tra web e Android:
- **Modifica ricette**: usa l'app web
- **Build Android**: `build.bat` sincronizza automaticamente il file aggiornato
- **Sincronizzazione manuale**: `RecipesApp\sync-recipes.ps1`

## ⚙️ Requisiti

### App Web
- Node.js 14+
- npm

### App Android
- JDK 17
- Android SDK
- Gradle 8.4+

## 📝 Formato Ricette

Ogni ricetta nel file `recipes.json` contiene:

```json
{
  "Nome": "Nome ricetta",
  "Ingredienti": ["ingrediente1", "ingrediente2"],
  "Istruzioni": "Procedimento...",
  "DataInserimento": "YYYY-MM-DD",
  "Autore": "Nome autore",
  "Difficolta": "facile|Medio|Difficile|veri esperti",
  "Costo": "economico|medio|costoso",
  "TempoPreparazione": 30,
  "TempoCottura": 45,
  "Quantita": 4,
  "MetodoCottura": "Forno|Fornello|Nessuna|...",
  "TipoPiatto": "Antipasto|Primo|Secondo|Contorno|Dolce|Liquore",
  "VinoPreferibile": ["vino1", "vino2"]
}
```

## 🎯 Uso

### Gestire Ricette (Web)
1. Avvia il server: `npm start`
2. Apri http://localhost:3000
3. Usa i tab per navigare per portata
4. Cerca ricette con la barra di ricerca
5. Aggiungi/modifica/elimina ricette

### Installare App Android
1. Connetti dispositivo Android via USB
2. Abilita Debug USB sul dispositivo
3. Esegui `build.bat`
4. Scegli 'S' quando richiesto per installare

### Aggiornare Ricette su Android
1. Modifica ricette tramite app web
2. Esegui `build.bat` per ricompilare con i dati aggiornati
3. Reinstalla l'APK sul dispositivo

## 📱 Installazione APK

Dopo la build, l'APK si trova in:
- `recipes-android.apk` (nella root del progetto)
- `RecipesApp\app\build\outputs\apk\debug\app-debug.apk`

**Installazione manuale:**
```bash
adb install -r recipes-android.apk
```

## 🛠️ Sviluppo

### Modificare l'App Web
Modifica i file in `public/` e riavvia il server.

### Modificare l'App Android
1. Apri `RecipesApp/` in Android Studio
2. Modifica codice Java o layout XML
3. Build → Build APK

## 📄 Note
- Tutti i dati sono salvati localmente in `recipes.json`
- Le ricette sono ordinate alfabeticamente in entrambe le app
- L'app Android è in modalità debug (non firmata per produzione)
- Nessun database esterno o servizio cloud richiesto
