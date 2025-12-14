@echo off
cd /d "%~dp0"
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

REM Prepara dati con leggi.js
echo [1/3] Preparazione dati con leggi.js...
cd ..\data\
node leggi.js
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Dati preparati
) else (
    echo   [!] Errore in leggi.js
)
cd ..\RecipesApp\

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
) else (
    echo.
    echo ========================================
    echo  BUILD FALLITA!
    echo ========================================
)

:end

