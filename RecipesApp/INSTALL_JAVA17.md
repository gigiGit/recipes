# Guida: Compilazione APK Android con Tab per Portate

## Problema: Java 17 Richiesto

L'Android Gradle Plugin 8.x richiede **Java 17** per funzionare.
Attualmente il sistema ha:
- Java 11 in `C:\Program Files\Java\jdk-11`
- Java 24 in `C:\Program Files\Java\jdk-24` (troppo recente)

## Soluzione: Installa JDK 17

### Opzione 1: Download Automatico Eclipse Temurin (Consigliato)

1. Vai su https://adoptium.net/temurin/releases/?version=17
2. Scarica **Windows x64 JDK .msi installer**
3. Esegui l'installer (accetta le opzioni predefinite)
4. Riavvia il terminale PowerShell

### Opzione 2: Download Manuale Oracle JDK

1. Vai su https://www.oracle.com/java/technologies/downloads/#java17
2. Scarica **Windows x64 Installer**
3. Installa in `C:\Program Files\Java\jdk-17`

### Opzione 3: Download ZIP Manuale

1. Scarica: https://download.oracle.com/java/17/archive/jdk-17.0.13_windows-x64_bin.zip
2. Estrai in `C:\Program Files\Java\jdk-17`

## Dopo l'installazione

Esegui nel terminale:

```powershell
cd C:\git-repo\recipes\RecipesApp
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
.\gradlew.bat assembleDebug
```

L'APK sarà disponibile in: `app\build\outputs\apk\debug\app-debug.apk`

## Modifiche Implementate

L'app Android ora include:

- **Tab per tipo di portata** (Tutte, Antipasto, Primo, Secondo, Contorno, Dolce, Liquore)
- **ViewPager2** con swipe tra categorie
- **Fragment** per ogni categoria di ricette
- **Ricerca** che mantiene la suddivisione per portate
- **Material Design** con TabLayout

### File Modificati/Creati

- `RecipeListFragment.java` - Fragment per lista ricette
- `RecipesPagerAdapter.java` - Adapter per gestire i tab
- `MainActivity.java` - Aggiornato con TabLayout + ViewPager2
- `activity_main.xml` - Layout con tab
- `fragment_recipe_list.xml` - Layout del fragment
- `Recipe.java` - Aggiunto `Serializable`
- `app/build.gradle` - Aggiunto ViewPager2 dependency

## Alternative

Se non puoi installare JDK 17, puoi:

1. **Aprire il progetto in Android Studio**
   - File → Open → Seleziona `C:\git-repo\recipes\RecipesApp`
   - Android Studio scaricherà automaticamente la versione corretta di Java
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

2. **Downgrade Android Gradle Plugin** (sconsigliato)
   - Modificare `build.gradle` per usare AGP 7.x che supporta Java 11
   - Perdita di funzionalità moderne
