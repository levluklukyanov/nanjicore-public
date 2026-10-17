# ===============================================================
# NANJICORE: PUBLIC MIRROR SYNC SCRIPT
# Синхронизация в публичный репозиторий nanjicore-public
# ===============================================================

$ErrorActionPreference = "Stop"

$currentBranch = (git branch --show-current).Trim()
if ($currentBranch -ne "main") {
    Write-Host "[!] Переключитесь на ветку main перед синхронизацией. Текущая ветка: $currentBranch" -ForegroundColor Yellow
    exit 1
}

# Проверяем, что рабочая директория чистая
$status = git status --porcelain
if ($status) {
    Write-Host "[!] В рабочей директории есть незакоммиченные изменения. Сначала сделайте commit." -ForegroundColor Red
    exit 1
}

Write-Host "==> 1. Подготовка ветки public-mirror..." -ForegroundColor Cyan
if (git branch --list public-mirror) {
    git branch -D public-mirror
}

# Создаем чистый срез из текущего состояния main
git checkout --orphan public-mirror

Write-Host "==> 2. Маскирование персональных данных..." -ForegroundColor Cyan

$filesToSanitize = @(
    "admin.js",
    "auth.js",
    "profile.js",
    "firestore.rules"
)

foreach ($file in $filesToSanitize) {
    if (Test-Path $file) {
        $content = Get-Content -Path $file -Raw -Encoding UTF8
        $sanitized = $content -replace "leeevlukanov@gmail\.com", "creator@example.com"
        [System.IO.File]::WriteAllText((Resolve-Path $file), $sanitized, [System.Text.Encoding]::UTF8)
        Write-Host "   [OK] Очищен $file" -ForegroundColor Gray
    }
}

Write-Host "==> 3. Создание чистого релизного коммита..." -ForegroundColor Cyan
git add -A
git commit -m "Release: Nanjicore v2.6.3 (Public Open Source Mirror)"

Write-Host "==> 4. Отправка в публичный репозиторий..." -ForegroundColor Cyan
git push public public-mirror:main --force

Write-Host "==> 5. Возврат на основную ветку main..." -ForegroundColor Cyan
git checkout main --force
if (git branch --list public-mirror) {
    git branch -D public-mirror
}

Write-Host "`n[V] Успешно! Публичный репозиторий https://github.com/levluklukyanov/nanjicore-public обновлен." -ForegroundColor Green
