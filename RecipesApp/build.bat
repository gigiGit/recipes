@echo off
echo ========================================
echo  BUILD APK - Inventario Ricette
echo ========================================
echo.

REM Verifica ANDROID_HOME
if not defined ANDROID_HOME (
    echo ERRORE: ANDROID_HOME non configurato!
    echo Imposta ANDROID_HOME prima di continuare.
    pause
    exit /b 1
)

echo Android SDK: %ANDROID_HOME%
echo.

REM Verifica JAVA_HOME
if not defined JAVA_HOME (
    echo ERRORE: JAVA_HOME non configurato!
    pause
    exit /b 1
)

echo Java: %JAVA_HOME%
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

REM Esegui build
echo.
echo [2/3] Clean...
call gradlew.bat clean

echo.
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
    
    REM Copia APK nella root
    copy /Y app\build\outputs\apk\debug\app-debug.apk ..\recipes-android.apk
    echo Copiato anche in: ..\recipes-android.apk
) else (
    echo.
    echo ========================================
    echo  BUILD FALLITA!
    echo ========================================
)

pause
