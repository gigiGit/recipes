@echo off
REM ========================================
REM Build APK - Inventario Ricette
REM ========================================

echo ========================================
echo  BUILD APK - Inventario Ricette
echo ========================================
echo.

REM Vai alla directory RecipesApp dalla posizione corrente del batch
cd /d "%~dp0RecipesApp"

if not exist "gradlew.bat" (
    echo [ERRORE] Directory RecipesApp non trovata o gradlew.bat mancante!
    echo Esegui questo batch da c:\git-repo\recipes\
    pause
    exit /b 1
)

REM Imposta JAVA_HOME a JDK 17
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
if not exist "%JAVA_HOME%" (
    echo [!] JDK 17 non trovato in %JAVA_HOME%
    echo     Provo con altre versioni...
    if exist "C:\Program Files\Java\jdk-11" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-11"
        echo     Uso JDK 11
    ) else (
        echo [ERRORE] Nessun JDK compatibile trovato!
        pause
        exit /b 1
    )
)

echo Java: %JAVA_HOME%

REM Imposta ANDROID_HOME
set "ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
if not exist "%ANDROID_HOME%" (
    set "ANDROID_HOME=C:\Android\Sdk"
)

echo Android SDK: %ANDROID_HOME%
echo.

REM [1/3] Sincronizzazione recipes.json
echo [1/3] Sincronizzazione recipes.json...
if exist "..\recipes.json" (
    echo   Copia recipes.json da app web...
    copy /Y "..\recipes.json" "app\src\main\assets\recipes.json" >nul
    if %ERRORLEVEL% EQU 0 (
        echo   [OK] recipes.json aggiornato
    ) else (
        echo   [!] Errore copia recipes.json
    )
) else (
    echo   [!] recipes.json non trovato nella directory parent
)

echo.

REM [2/3] Clean
echo [2/3] Clean...
call gradlew.bat clean

echo.

REM [3/3] Build APK
echo [3/3] Assemblaggio APK...
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  BUILD COMPLETATA!
    echo ========================================
    echo.
    echo APK creato in:
    echo app\build\outputs\apk\debug\app-debug.apk
    echo.
    
    REM Copia APK nella root recipes
    if exist "app\build\outputs\apk\debug\app-debug.apk" (
        copy /Y "app\build\outputs\apk\debug\app-debug.apk" "recipes-android.apk" >nul
        echo Copiato anche in: recipes-android.apk
        
        REM Mostra dimensione
        for %%A in ("recipes-android.apk") do (
            set size=%%~zA
            set /a sizeMB=%%~zA/1048576
        )
        echo Dimensione: !sizeMB! MB
        echo.
    )
    
    echo.
    echo Vuoi installare l'APK sul dispositivo connesso? (S/N)
    choice /C SN /N /M "Premi S per installare, N per saltare: "
    if errorlevel 2 goto :end
    if errorlevel 1 goto :install
    
    :install
    echo.
    echo Verifica dispositivi connessi...
    "%ANDROID_HOME%\platform-tools\adb.exe" devices
    echo.
    echo Installazione APK su dispositivo Android...
    "%ANDROID_HOME%\platform-tools\adb.exe" install -r "recipes-android.apk"
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo  [OK] App installata con successo!
        echo ========================================
    ) else (
        echo.
        echo ========================================
        echo  [!] Errore installazione
        echo ========================================
        echo.
        echo Verifica:
        echo - Dispositivo connesso via USB
        echo - Debug USB attivato sul dispositivo
        echo - Driver ADB installati
    )
    
    :end
    echo.
) else (
    echo.
    echo ========================================
    echo  BUILD FALLITA!
    echo ========================================
    echo.
    echo Verifica:
    echo - JAVA_HOME punta a JDK 17
    echo - ANDROID_HOME configurato correttamente
    echo - Gradle wrapper presente
    echo.
)

pause
