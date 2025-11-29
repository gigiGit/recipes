@echo off
REM Build script con auto-download del JDK corretto

echo ========================================
echo Build APK con auto-provisioning JDK
echo ========================================

REM Usa il toolchain di Gradle per scaricare automaticamente Java 17
gradlew.bat assembleDebug --warning-mode all

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build completata con successo!
    echo ========================================
    echo APK disponibile in: app\build\outputs\apk\debug\app-debug.apk
) else (
    echo.
    echo ========================================
    echo Build fallita
    echo ========================================
    echo.
    echo Soluzione alternativa:
    echo 1. Scarica JDK 17: https://adoptium.net/temurin/releases/?version=17
    echo 2. Installa JDK 17
    echo 3. Riavvia questo script
)

pause
