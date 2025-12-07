# Come aprire e compilare l'app iOS

## Su Mac

### 1. Aprire il progetto Xcode

```bash
cd /path/to/recipes/RecipesApp-iOS
open RecipesApp-iOS.xcodeproj
```

Oppure fare double-click su `RecipesApp-iOS.xcodeproj` da Finder.

### 2. Selezionare destinazione

In Xcode:
- Schermo superiore, selezionare il device o simulatore (es. "iPhone 14 Pro")
- iOS 15.0 o successivo

### 3. Compilare ed eseguire

Premere `Cmd+R` oppure Product → Run

## Su Windows

Se hai un Mac remoto o virtuale:

1. **Copia i file sul Mac** via SSH o condivisione file
2. **Segui le istruzioni sopra**

## Su Windows (Non è possibile compilare direttamente)

Puoi visualizzare e modificare il codice in VS Code, ma per compilare devi usare un Mac con Xcode.

## Simulatori disponibili

```bash
# Elencare simulatori iOS
xcrun simctl list devices
```

## Build da linea di comando (Mac)

```bash
cd RecipesApp-iOS
xcodebuild -scheme RecipesApp-iOS -destination 'platform=iOS Simulator,name=iPhone 14 Pro'
```

## Installare su device fisico

1. Connetti l'iPhone via USB
2. In Xcode, seleziona il device dall'elenco
3. Premi `Cmd+R`

**Nota**: Potrebbe chiederti di fidarti del certificato di sviluppo sul device (Settings → General → VPN & Device Management)

## Troubleshooting

### Errore: "Team ID is required"
- In Xcode: Signing & Capabilities
- Seleziona un team di sviluppo valido

### Simulatore non parte
```bash
xcrun simctl erase all
xcrun simctl boot "iPhone 14 Pro"
```

### Errore su recipes.json non trovato
- Il file deve essere in `RecipesApp-iOS/recipes.json`
- Verifica in Xcode: Target → Build Phases → Copy Bundle Resources
