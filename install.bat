@echo off
REM ========================================
REM Install APK - Ricette
REM ========================================
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

REM Verifica esistenza APK
set "APK_PATH=RecipesApp\app\build\outputs\apk\debug\app-debug.apk"
if exist "%APK_PATH%" (
    echo APK trovato: %APK_PATH%
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
    "%ANDROID_HOME%\platform-tools\adb.exe" install -r "%APK_PATH%"
    
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
    
    goto :end
) else (
    echo.
    echo ========================================
    echo  APK NON TROVATO!
    echo ========================================
    echo.
    echo Esegui prima _build.bat in RecipesApp per creare l'APK.
    echo L'APK dovrebbe essere in recipes-android.apk
)

:end


