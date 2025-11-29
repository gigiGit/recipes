# Compilare con Android Studio

## 1. Apri il progetto

1. Avvia **Android Studio**
2. Clicca su **File → Open**
3. Naviga in `C:\git-repo\recipes\RecipesApp`
4. Seleziona la cartella `RecipesApp` e clicca **OK**

## 2. Sincronizzazione Gradle

Quando apri il progetto, Android Studio:
- Rileverà automaticamente i file Gradle
- Mostrerà un banner "Gradle files have changed"
- Clicca su **Sync Now** per sincronizzare

La sincronizzazione scaricherà tutte le dipendenze necessarie (può richiedere qualche minuto la prima volta).

## 3. Configurazione SDK

Se Android Studio segnala problemi con l'SDK:

1. Vai su **File → Project Structure** (Ctrl+Alt+Shift+S)
2. In **SDK Location**, verifica che sia impostato:
   - **Android SDK location**: `C:\Android\Sdk` (o il tuo percorso)
   - **JDK location**: percorso del tuo JDK 17+

3. In **Modules → app**:
   - **Compile SDK Version**: 33
   - **Build Tools Version**: 33.0.0
   - **Min SDK Version**: 24
   - **Target SDK Version**: 33

## 4. Compila l'APK

### Opzione A: Build → Build Bundle(s) / APK(s)
1. Clicca su **Build** nel menu superiore
2. Seleziona **Build Bundle(s) / APK(s) → Build APK(s)**
3. Attendi il completamento
4. Clicca su **locate** nel popup per trovare l'APK

### Opzione B: Gradle Tasks
1. Apri il pannello **Gradle** (a destra)
2. Espandi **RecipesApp → app → Tasks → build**
3. Doppio click su **assembleDebug**

### Opzione C: Terminal integrato
1. Apri il **Terminal** in basso
2. Esegui:
   ```bash
   gradlew assembleDebug
   ```

## 5. Esegui su Emulatore o Dispositivo

1. Crea un emulatore Android (se non ne hai):
   - **Tools → Device Manager**
   - **Create Device**
   - Scegli un dispositivo (es. Pixel 6)
   - Scegli system image (es. API 33)

2. Clicca sul pulsante **Run** (▶️) o premi **Shift+F10**

3. Seleziona il dispositivo/emulatore target

## 6. Trova l'APK generato

L'APK debug si trova in:
```
RecipesApp\app\build\outputs\apk\debug\app-debug.apk
```

## Troubleshooting

### Errore "SDK not found"
- Vai su **File → Settings → Appearance & Behavior → System Settings → Android SDK**
- Verifica che siano installati:
  - ✓ Android SDK Platform 33
  - ✓ Android SDK Platform 24
  - ✓ Android SDK Build-Tools 33.0.0
  - ✓ Android SDK Platform-Tools

### Errore "JDK not found"
- Vai su **File → Project Structure → SDK Location**
- Imposta il percorso del JDK 17 o superiore

### Gradle sync fallito
- Clicca su **File → Invalidate Caches / Restart**
- Riprova la sincronizzazione

### Dipendenze non scaricate
- Verifica la connessione internet
- Vai su **File → Settings → Build → Build Tools → Gradle**
- Verifica che "Gradle JVM" sia impostato correttamente
