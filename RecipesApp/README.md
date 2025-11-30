# Ricette - App Android

Applicazione Android nativa per visualizzare, cercare e condividere ricette.

## Caratteristiche

- 📱 Interfaccia nativa Android con Material Design
- 🔍 Ricerca in tempo reale per nome, ingredienti e tipo di piatto
- 📖 Visualizzazione dettagliata di ogni ricetta
- 📤 Condivisione ricette tramite qualsiasi app
- 💾 Caricamento ricette da file JSON locale

## Build

```bash
cd RecipesApp
gradlew assembleDebug
```

L'APK verrà creato in: `app/build/outputs/apk/debug/app-debug.apk`

## Struttura

- **MainActivity**: Lista ricette con ricerca
- **RecipeDetailActivity**: Dettaglio ricetta completo
- **RecipeManager**: Gestione caricamento e ricerca ricette
- **RecipeAdapter**: Adapter per RecyclerView

## Requisiti

- Android SDK 24+
- Java 17+
- Gradle 8.0+
