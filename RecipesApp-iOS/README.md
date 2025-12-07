# RecipesApp iOS

Applicazione iOS per la gestione e consultazione di ricette, con supporto per importazione runtime di file JSON.

## Funzionalità

- 📋 **Visualizza ricette** per tipo piatto o per autore
- 🔍 **Ricerca full-text** su nome, ingredienti, istruzioni e autore
- 📥 **Importa ricette** caricando file JSON in runtime
- 🔖 **Dettagli ricetta** completi con ingredienti e istruzioni
- 📤 **Condividi ricetta** via mail, iMessage, ecc.
- 📄 **Stampa in PDF** le ricette
- 🏠 **Interfaccia tabbed** per navigazione veloce

## Requisiti

- Xcode 14.0 o successivo
- iOS 15.0 o successivo
- Swift 5.7+

## Installazione

1. Aprire il progetto in Xcode
2. Selezionare il target "RecipesApp"
3. Selezionare un dispositivo iOS o simulatore (iOS 15+)
4. Premere `Cmd+R` per compilare ed eseguire

## Struttura del Progetto

```
RecipesApp-iOS/
├── RecipesApp.swift              # Entry point app
├── Models/
│   ├── Recipe.swift              # Modello dati ricetta con Codable
│   └── RecipeManager.swift       # Manager per caricamento e gestione ricette
├── Views/
│   ├── ContentView.swift         # Vista principale con TabView
│   ├── RecipesByTypeView.swift   # Lista ricette per tipo piatto
│   ├── RecipesByAuthorView.swift # Lista ricette per autore
│   ├── RecipeDetailView.swift    # Dettagli ricetta con menu
│   ├── SearchBar.swift           # Component search bar
│   └── PrintView.swift           # Vista stampa PDF
└── README.md
```

## Utilizzo

### Visualizzazione ricette

1. **Per tipo piatto** (default): Le ricette sono organizzate per categoria (Antipasto, Primo, Secondo, ecc.)
2. **Per autore**: Menu in alto a sinistra → "Visualizza per" → "Autore"

### Ricerca

Usare la barra di ricerca per filtrare ricette per:
- Nome ricetta
- Ingredienti
- Istruzioni
- Autore

### Importare ricette

1. Tap il bottone "Importa" in alto a destra
2. Selezionare un file JSON dal dispositivo
3. Le ricette verranno caricate e salvate localmente

### Condividere e stampare

1. Aprire una ricetta dal dettaglio
2. Tap il menu (•••) in alto a destra
3. Selezionare "Condividi" o "Stampa PDF"

## File JSON

Il file `recipes.json` deve avere il seguente formato:

```json
[
  {
    "Nome": "Carbonara",
    "Ingredienti": ["Pasta", "Guanciale", "Uova"],
    "Istruzioni": "Cuocere la pasta...",
    "DataInserimento": "2025-01-01",
    "Autore": "Internet",
    "Difficolta": "Facile",
    "Costo": "Basso",
    "TempoPreparazione": 15,
    "TempoCottura": 10,
    "Quantita": 4,
    "MetodoCottura": "Fornello",
    "TipoPiatto": "Primo",
    "VinoPreferibile": ["Pinot Grigio"]
  }
]
```

## Note di sviluppo

- Le ricette importate vengono salvate in Documents/recipes_imported.json
- La ricerca è case-insensitive
- Le ricette sono automaticamente ordinate alfabeticamente per nome
- Gli autori sono ordinati alfabeticamente nella vista "Autore"

## Licenza

MIT
