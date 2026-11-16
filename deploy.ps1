# ==============================================================================
# SCRIPT DE DÉPLOIEMENT EN PRODUCTION (WINDOWS) - LIFE CHANNEL
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "🚀 Début du déploiement de LIFE CHANNEL..." -ForegroundColor Cyan

# 1. Vérification du fichier .env
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Génération du fichier .env à partir de .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# 2. Construction et démarrage
Write-Host "🔨 Construction et démarrage des conteneurs..." -ForegroundColor Green
docker compose -f docker-compose.prod.yml up -d --build

# 3. État des conteneurs
Start-Sleep -Seconds 10
Write-Host "📊 État des conteneurs :" -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml ps

Write-Host "✅ Déploiement terminé avec succès !" -ForegroundColor Green
