# Sincronizzazione recipes.json per Android

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SYNC recipes.json" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sourceJson = "..\data\recipes.json"
$targetJson = "app\src\main\assets\recipes.json"

if (-not (Test-Path $sourceJson)) {
    Write-Host "✗ File sorgente non trovato: $sourceJson" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "app\src\main\assets")) {
    Write-Host "Creazione directory assets..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "app\src\main\assets" -Force | Out-Null
}

$sourceDate = (Get-Item $sourceJson).LastWriteTime
$targetExists = Test-Path $targetJson
$targetDate = if ($targetExists) { (Get-Item $targetJson).LastWriteTime } else { [DateTime]::MinValue }

Write-Host "Source: $sourceJson" -ForegroundColor White
Write-Host "  Data modifica: $sourceDate" -ForegroundColor Gray

if ($targetExists) {
    Write-Host "Target: $targetJson" -ForegroundColor White
    Write-Host "  Data modifica: $targetDate" -ForegroundColor Gray
} else {
    Write-Host "Target: $targetJson (non esistente)" -ForegroundColor Yellow
}

Write-Host ""

if (-not $targetExists -or $sourceDate -gt $targetDate) {
    Write-Host "Copia in corso..." -ForegroundColor Cyan
    Copy-Item $sourceJson $targetJson -Force
    
    $sourceSize = (Get-Item $sourceJson).Length
    $recipesCount = (Get-Content $sourceJson | ConvertFrom-Json).Count
    
    Write-Host "✓ Sincronizzazione completata!" -ForegroundColor Green
    Write-Host "  Dimensione: $([math]::Round($sourceSize / 1KB, 2)) KB" -ForegroundColor Gray
    Write-Host "  Ricette: $recipesCount" -ForegroundColor Gray
} else {
    Write-Host "✓ recipes.json già aggiornato (nessuna modifica)" -ForegroundColor Green
}

# Sincronizza immagini
Write-Host " SYNC immagini" -ForegroundColor Cyan
$sourceImages = "..\data\images"
$targetImages = "app\src\main\assets\images"

if (Test-Path $sourceImages) {
    if (!(Test-Path $targetImages)) {
        New-Item -ItemType Directory -Path $targetImages -Force | Out-Null
    }
    
    $imageFiles = Get-ChildItem $sourceImages -File
    if ($imageFiles.Count -gt 0) {
        Copy-Item "$sourceImages\*" $targetImages -Force -Recurse
        Write-Host "✓ Immagini sincronizzate: $($imageFiles.Count) file" -ForegroundColor Green
    } else {
        Write-Host "✓ Nessuna immagine da sincronizzare" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠ Cartella immagini non trovata: $sourceImages" -ForegroundColor Yellow
}

Write-Host ""

