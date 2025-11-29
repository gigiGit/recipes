# Script PowerShell per build APK

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " BUILD APK - Inventario Ricette" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica ANDROID_HOME
if (-not $env:ANDROID_HOME) {
    Write-Host "ERRORE: ANDROID_HOME non configurato!" -ForegroundColor Red
    Write-Host "Provo con path standard..." -ForegroundColor Yellow
    $env:ANDROID_HOME = "C:\Users\giuliano\AppData\Local\Android\Sdk"
}

Write-Host "Android SDK: $env:ANDROID_HOME" -ForegroundColor Green

# Verifica JAVA_HOME
if (-not $env:JAVA_HOME) {
    Write-Host "ERRORE: JAVA_HOME non configurato!" -ForegroundColor Red
    Write-Host "Provo con path standard..." -ForegroundColor Yellow
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
}

Write-Host "Java: $env:JAVA_HOME" -ForegroundColor Green
Write-Host ""

# Verifica se gradlew esiste
if (-not (Test-Path "gradlew.bat")) {
    Write-Host "Gradle Wrapper non trovato!" -ForegroundColor Red
    Write-Host "Creazione wrapper..." -ForegroundColor Yellow
    
    # Crea file batch gradlew minimale
    @"
@echo off
java -jar gradle\wrapper\gradle-wrapper.jar %*
"@ | Out-File -FilePath "gradlew.bat" -Encoding ASCII
}

# Sincronizza recipes.json dall'app web
Write-Host "[1/3] Sincronizzazione recipes.json..." -ForegroundColor Cyan
$sourceJson = "..\recipes.json"
$targetJson = "app\src\main\assets\recipes.json"

if (Test-Path $sourceJson) {
    $sourceDate = (Get-Item $sourceJson).LastWriteTime
    $targetDate = if (Test-Path $targetJson) { (Get-Item $targetJson).LastWriteTime } else { [DateTime]::MinValue }
    
    if ($sourceDate -gt $targetDate) {
        Write-Host "  Aggiornamento recipes.json rilevato..." -ForegroundColor Yellow
        Copy-Item $sourceJson $targetJson -Force
        Write-Host "  ✓ recipes.json aggiornato" -ForegroundColor Green
    } else {
        Write-Host "  ✓ recipes.json già aggiornato" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠ File recipes.json non trovato nella root" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[2/3] Clean..." -ForegroundColor Cyan
.\gradlew.bat clean

Write-Host ""
Write-Host "[3/3] Assemblaggio APK..." -ForegroundColor Cyan
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " BUILD COMPLETATA!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK creato in:" -ForegroundColor Yellow
    Write-Host "app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
    Write-Host ""
    
    # Copia APK
    if (Test-Path "app\build\outputs\apk\debug\app-debug.apk") {
        Copy-Item "app\build\outputs\apk\debug\app-debug.apk" "..\recipes-android.apk" -Force
        Write-Host "Copiato anche in: ..\recipes-android.apk" -ForegroundColor Cyan
        
        $size = (Get-Item "..\recipes-android.apk").Length / 1MB
        Write-Host "Dimensione: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host " BUILD FALLITA!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host ""
