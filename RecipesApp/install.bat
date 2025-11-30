@echo off
echo ========================================
echo  INSTALLA APK - Ricette
echo ========================================
echo.

REM Imposta ANDROID_HOME
set "ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
if not exist "%ANDROID_HOME%" (
    set "ANDROID_HOME=C:\Android\Sdk"
    if not exist "%ANDROID_HOME%" (
        echo [ERRORE] ANDROID_HOME non trovato!
        echo Verifica che Android SDK sia installato.
        pause
        exit /b 1
    )
)

echo Android SDK: %ANDROID_HOME%
echo.

REM Verifica esistenza APK
if not exist "app\build\outputs\apk\debug\app-debug.apk" (
    if not exist "..\recipes-android.apk" (
        echo [ERRORE] APK non trovato!
        echo Esegui prima build.bat per compilare l'applicazione.
        pause
        exit /b 1
    )
    set "APK_PATH=..\recipes-android.apk"
) else (
    set "APK_PATH=app\build\outputs\apk\debug\app-debug.apk"
)

echo APK: %APK_PATH%
echo.

REM Verifica dispositivi connessi
echo Verifica dispositivi Android connessi...
"%ANDROID_HOME%\platform-tools\adb.exe" devices
echo.

REM Chiedi conferma
echo Vuoi installare l'APK sul dispositivo? (S/N)
choice /C SN /N /M "Premi S per installare, N per annullare: "
if errorlevel 2 goto :end
if errorlevel 1 goto :install

:install
echo.
echo Installazione APK in corso...
"%ANDROID_HOME%\platform-tools\adb.exe" install -r "%APK_PATH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  [OK] App installata con successo!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo  [!] Errore durante l'installazione
    echo ========================================
    echo.
    echo Verifica:
    echo - Dispositivo connesso via USB
    echo - Debug USB attivato sul dispositivo
    echo - Driver ADB installati
    echo - Autorizzazione USB concessa sul dispositivo
)

:end
pause
