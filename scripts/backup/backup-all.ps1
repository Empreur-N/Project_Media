# ==============================================================================
# LIFE CHANNEL - Plan de Continuité d'Activité (PRA)
# Script PowerShell de sauvegarde automatisée (PostgreSQL, MongoDB, Médias)
# Rétention glissante : 30 jours (Chapitre 45.1)
# ==============================================================================

$BackupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$BaseDir = "d:\Project_Media"
$BackupDir = Join-Path $BaseDir "backups"
$RetentionDays = 30

$PgDir = Join-Path $BackupDir "postgres"
$MongoDir = Join-Path $BackupDir "mongodb"
$MediaDir = Join-Path $BackupDir "uploads"

New-Item -ItemType Directory -Force -Path $PgDir | Out-Null
New-Item -ItemType Directory -Force -Path $MongoDir | Out-Null
New-Item -ItemType Directory -Force -Path $MediaDir | Out-Null

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " [PRA] Démarrage de la sauvegarde automatique : $BackupDate" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Sauvegarde PostgreSQL
Write-Host "--> [1/3] Sauvegarde PostgreSQL..." -ForegroundColor Yellow
$PgOutFile = Join-Path $PgDir "pg_all_$BackupDate.sql"
try {
    docker exec -t postgres-media pg_dumpall -U postgres > $PgOutFile
    Write-Host "    ✓ PostgreSQL exporté : $PgOutFile" -ForegroundColor Green
} catch {
    Write-Warning "Conteneur postgres-media non joignable: $_"
}

# 2. Sauvegarde MongoDB
Write-Host "--> [2/3] Sauvegarde MongoDB..." -ForegroundColor Yellow
$MongoOutFile = Join-Path $MongoDir "mongo_all_$BackupDate.archive.gz"
try {
    docker exec -t mongodb-media mongodump --archive --gzip > $MongoOutFile
    Write-Host "    ✓ MongoDB archivé : $MongoOutFile" -ForegroundColor Green
} catch {
    Write-Warning "Conteneur mongodb-media non joignable: $_"
}

# 3. Sauvegarde des Médias
Write-Host "--> [3/3] Sauvegarde des fichiers médias téléversés..." -ForegroundColor Yellow
$UploadsDir = Join-Path $BaseDir "uploads"
if (Test-Path $UploadsDir) {
    $MediaZip = Join-Path $MediaDir "uploads_$BackupDate.zip"
    Compress-Archive -Path "$UploadsDir\*" -DestinationPath $MediaZip -Force
    Write-Host "    ✓ Médias archivés : $MediaZip" -ForegroundColor Green
}

# 4. Rétention glissante (30 jours)
Write-Host "--> Nettoyage des sauvegardes antérieures à $RetentionDays jours..." -ForegroundColor Yellow
$LimitDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Recurse -File | Where-Object { $_.LastWriteTime -lt $LimitDate } | Remove-Item -Force
Write-Host "    ✓ Rétention de $RetentionDays jours appliquée." -ForegroundColor Green

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " [PRA] Sauvegarde terminée avec succès !" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan