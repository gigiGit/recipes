# Ricette di Cucina

Applicazione completa per la gestione di ricette di cucina con interfaccia web e app nativa Android.

📋 **[Specifiche App Web](WEB_APP_SPECIFICATIONS.md)** - Documento dettagliato delle funzionalità web e confronto con Android

## 📱 Applicazioni Disponibili

### App Web (Node.js/Express)
Interfaccia web per gestire le ricette con funzionalità complete di CRUD.

**Funzionalità:**
- ✅ Aggiungi, modifica, elimina ricette
- ✅ Ricerca per nome, ingredienti, tipo piatto
- ✅ Suddivisione per portate (Antipasto, Primo, Secondo, Contorno, Dolce)
- ✅ Suddivisione per autore
- ✅ Ordinamento alfabetico automatico
- ✅ Database JSON in `data/recipes.json`
- ✅ Database SQLite in `data/recipes.db`
- ✅ Immagini ricette in `data/images/`

**Avvio:**
```bash
npm install
npm start
```
Apri http://localhost:3000

### App Android Nativa
Applicazione Android per visualizzare e condividere ricette.

**Funzionalità:**
- ✅ Visualizzazione ricette con tab per portate (Antipasto, Primo, Secondo, Contorno, Dolce)
- ✅ Visualizzazione ricette per autore
- ✅ Ricerca full-text su nome e ingredienti
- ✅ Condivisione ricette tramite ShareSheet
- ✅ Stampa ricette su PDF
- ✅ Importazione runtime di nuovi file recipes.json
- ✅ **Stampa libro ricette completo per autore** (PDF ordinato per tipo di piatto)
- ✅ Ordinamento alfabetico automatico
- ✅ Material Design 3 UI
- ✅ Android API 33+, JDK 17

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
├── data/                     # Dati condivisi
│   ├── recipes.json         # Database ricette JSON
│   ├── recipes.db           # Database SQLite
│   └── images/              # Immagini ricette
├── server.js                 # Server Express
├── package.json              # Dipendenze Node.js
├── build.bat                 # Build script Android
├── public/                   # Frontend web
│   ├── app.js               # Logica interfaccia web
│   ├── index.html           # UI web
│   └── style.css            # Stili web
├── RecipesApp/              # Progetto Android nativo
│   ├── app/
│   │   └── src/main/
│   │       ├── java/com/recipes/app/
│   │       │   ├── MainActivity.java
│   │       │   ├── RecipeDetailActivity.java
│   │       │   ├── RecipeListFragment.java
│   │       │   ├── RecipesPagerAdapter.java
│   │       │   ├── RecipeAdapter.java
│   │       │   ├── RecipeManager.java
│   │       │   └── Recipe.java
│   │       ├── res/           # Risorse Android
│   │       └── assets/
│   │           └── recipes.json  # Copia sincronizzata
│   ├── build.gradle
│   ├── sync-recipes.ps1      # Script sincronizzazione
│   └── gradle/wrapper/
│       └── gradle-wrapper.jar
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
- Android SDK API 33+
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

### Stampare Libro Ricette (Android)
Quando visualizzi le ricette per autore, appare l'opzione **"Stampa Libro Ricette"** nel menu:

1. Passa alla visualizzazione per autore dal menu "Visualizza per" → "Autore"
2. Seleziona il tab di un autore specifico
3. Tocca il menu (⋮) → "Stampa Libro Ricette"
4. Verrà generato un PDF professionale con:
   - Tutte le ricette dell'autore ordinate per tipo di piatto
   - Layout libro con titoli, ingredienti, istruzioni
   - Formattazione ottimizzata per stampa
   - Una ricetta per pagina con interruzioni appropriate

## 📥 Download dei Compilati

### Dall'App Android tramite GitHub Actions

Ogni push su `main` avvia automaticamente la compilazione Android. I compilati sono disponibili in:

**Passi per il download:**

1. **Accedi a GitHub**: https://github.com/gigiGit/recipes
2. **Vai alla sezione "Actions"**: Clicca sulla tab "Actions" nel menu principale
3. **Seleziona il workflow**: Clicca su "Build Android App"
4. **Scegli l'esecuzione**: Seleziona l'esecuzione più recente della lista
5. **Scarica l'artefatto**:
   - Scorri in basso fino a "Artifacts"
   - Clicca su "android-apk" per scaricare il file ZIP
   - Estrai il file: contiene `app-debug.apk`
6. **Installa su dispositivo**:
   ```bash
   adb install -r app-debug.apk
   ```
   Oppure trasferisci il file sul dispositivo e tocca per installare

### Release Ufficiali

Quando è pronto un rilascio ufficiale, viene creato un tag (es. `v1.0.0`):

```bash
git tag v1.0.0
git push origin v1.0.0
```

Questo attiva il workflow "Release" che:
- Compila APK Release (Android)
- Crea una GitHub Release con i file scaricabili

Le release sono disponibili in: https://github.com/gigiGit/recipes/releases

## 📱 Installazione APK

Dopo la build, l'APK si trova in:
- `recipes-android.apk` (nella root del progetto)
- `RecipesApp\app\build\outputs\apk\debug\app-debug.apk`

**Installazione manuale:**
```bash
adb install -r recipes-android.apk
```

## 🔄 Sincronizzazione Ricette

Il file `recipes.json` è condiviso tra web e Android:
- **Modifica ricette**: usa l'app web
- **Build Android**: `build.bat` sincronizza automaticamente il file aggiornato
- **Sincronizzazione manuale**: copia `recipes.json` in `RecipesApp/app/src/main/assets/` (Android)

## 🛠️ Sviluppo

### Modificare l'App Web
Modifica i file in `public/` e riavvia il server.

### Modificare l'App Android
1. Apri `RecipesApp/` in Android Studio
2. Modifica codice Java o layout XML
3. Build → Build APK

## 📄 Note
- Tutti i dati sono salvati localmente in `recipes.json`
- Le ricette sono ordinate alfabeticamente in tutte le app
- L'app Android è in modalità debug (non firmata per produzione)
- Nessun database esterno o servizio cloud richiesto
