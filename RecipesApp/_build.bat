@echo off
echo ========================================
echo  BUILD APK - Ricette
echo ========================================
echo.

REM Imposta JAVA_HOME a JDK 17
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
if not exist "%JAVA_HOME%" (
    echo [ERRORE] JDK 17 non trovato in %JAVA_HOME%
    echo Installa JDK 17 prima di procedere.
    pause
    exit /b 1
)

echo Java: %JAVA_HOME%
echo.

REM Imposta ANDROID_HOME
set "ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
if not exist "%ANDROID_HOME%" (
    set "ANDROID_HOME=C:\Android\Sdk"
    if not exist "%ANDROID_HOME%" (
        echo ERRORE: ANDROID_HOME non trovato!
        echo Verifica che Android SDK sia installato.
        pause
        exit /b 1
    )
)

echo Android SDK: %ANDROID_HOME%
echo.

REM Sincronizza recipes.json
echo [1/3] Sincronizzazione recipes.json...
if exist "..\recipes.json" (
    echo   Copia recipes.json da app web...
    copy /Y "..\recipes.json" "app\src\main\assets\recipes.json" >nul
    echo   [OK] recipes.json aggiornato
) else (
    echo   [!] recipes.json non trovato nella root
)

REM Clean build
echo.
echo [2/3] Clean...
call gradlew.bat clean

REM Build con JDK 17
echo.
echo [3/3] Build APK con JDK 17...
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
    
    REM Copia APK nella root
    if exist "app\build\outputs\apk\debug\app-debug.apk" (
        copy /Y app\build\outputs\apk\debug\app-debug.apk ..\recipes-android.apk >nul
        echo Copiato anche in: ..\recipes-android.apk
        echo.
        
        REM Chiedi se installare
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
        "%ANDROID_HOME%\platform-tools\adb.exe" install -r "..\recipes-android.apk"
        
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo [OK] App installata con successo!
        ) else (
            echo.
            echo [!] Errore installazione
            echo Verifica che il dispositivo sia connesso via USB con Debug USB attivato.
        )
    )
) else (
    echo.
    echo ========================================
    echo  BUILD FALLITA!
    echo ========================================
)

:end
pause
