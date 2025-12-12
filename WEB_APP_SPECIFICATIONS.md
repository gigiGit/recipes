# Specifiche Applicazione Web Ricette

## Introduzione

L'applicazione "Ricette di Cucina" è disponibile in due versioni: Web e Android. Questa specifica documenta l'applicazione web, evidenziando le differenze con la versione Android.

## Architettura Generale

- **Database:** JSON (`data/recipes.json`) e SQLite (`data/recipes.db`)
- **Immagini:** Archiviate in `data/images/`, servite via endpoint `/images/`
- **Server:** Node.js/Express su porta 3000
- **Frontend:** HTML/CSS/JavaScript puro

## Funzionalità App Web

### 🏠 Dashboard Principale
- **Layout a due colonne:** Sidebar sinistra per navigazione, contenuto destra per lista/ricetta
- **Ricerca globale:** Campo di testo per filtrare ricette per nome/ingredienti
- **Pulsante "Aggiungi Ricetta":** Apre form modale per nuova ricetta

### 📋 Gestione Ricette (CRUD)
- **Visualizzazione Lista:** Ricette in formato lista con info base
- **Dettaglio Ricetta:** Vista espansa con ingredienti, istruzioni, immagini
- **Modifica:** Form inline per editare qualsiasi campo
- **Eliminazione:** Conferma prima della cancellazione
- **Aggiunta:** Form completo con validazione

### 🏷️ Organizzazione Ricette
- **Gruppi per Tipo Piatto:** Tab per Antipasto, Primo, Secondo, Contorno, Dolce, Liquore
- **Gruppi per Autore:** Tab aggiuntivi per ogni autore presente
- **Ordinamento:** Alfabetico per nome ricetta entro ogni gruppo
- **Navigazione:** Clic su ricetta mostra dettaglio, reset filtri

### 🖼️ Gestione Immagini
- **Upload:** Input file per selezionare immagini (auto-upload)
- **Visualizzazione:** Fino a 3 immagini per ricetta (autore, piatto, passaggio)
- **Archiviazione:** File system locale, URL relativi nel JSON

### 🔍 Ricerca e Filtri
- **Ricerca Testuale:** Filtra per nome ricetta e ingredienti
- **Navigazione per Gruppi:** Filtra implicitamente per tipo/autore
- **Reset Filtri:** Automatico quando si cambia gruppo

### 📱 Interfaccia Utente
- **Responsive:** Adattabile a diverse dimensioni schermo
- **Material Design:** Stile moderno con colori e tipografia
- **Feedback Utente:** Alert per success/error, conferma per azioni distruttive

## Confronto con App Android

| Funzionalità | Web | Android | Note |
|-------------|-----|---------|------|
| **Database** | JSON + SQLite | JSON locale | Android usa solo JSON da assets |
| **Immagini** | Upload + visualizzazione | Solo visualizzazione | Android carica da assets locali |
| **CRUD Ricette** | ✅ Completo | ❌ Solo lettura | Android è read-only |
| **Ricerca** | Nome + ingredienti | Full-text avanzato | Android ha ricerca più potente |
| **Gruppi** | Tipo + Autore | Tipo + Autore | Stessa organizzazione |
| **Condivisione** | ❌ Non disponibile | ✅ ShareSheet | Android nativo |
| **Stampa** | ❌ Non disponibile | ✅ PDF singolo + libro | Android integrato |
| **Offline** | ❌ Richiede server | ✅ Completo | Android standalone |
| **UI/UX** | Web responsive | Material Design 3 | Android più nativo |
| **Aggiornamenti** | Manuali via web | Sync script | Android richiede rebuild |

### Differenze Chiave Android vs Web
- **Modalità Operativa:** Web è CRUD completo, Android è visualizzazione
- **Connettività:** Web richiede server attivo, Android offline
- **Aggiornamenti:** Web immediati, Android richiede sync e rebuild
- **Funzionalità Avanzate:** Android ha condivisione e stampa PDF

## Conclusioni

### Ruolo dell'App Web
- **Centro di Controllo:** Punto unico per gestire tutte le ricette
- **Upload Contenuti:** Immagini e dati caricati qui
- **Sincronizzazione:** Fonte di verità per Android

### Complementarietà
- **Web:** Gestione contenuti, aggiornamenti real-time
- **Android:** Consumo offline, funzionalità native (stampa, condivisione)
- **Workflow:** Crea/modifica su web, consuma su mobile

### Prossimi Sviluppi Possibili
- **PWA:** Trasformare web app in Progressive Web App per offline
- **Sync Bidirezionale:** Aggiornamenti da mobile a web
- **Collaborazione:** Multi-user con autenticazione
- **API REST:** Esporre API per integrazioni esterne</content>
<parameter name="filePath">c:\git-repo\recipes\WEB_APP_SPECIFICATIONS.md