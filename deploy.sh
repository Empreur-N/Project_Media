#!/bin/bash
# ==============================================================================
# SCRIPT DE DÉPLOIEMENT EN PRODUCTION - LIFE CHANNEL
# ==============================================================================
set -e

echo "🚀 Début du déploiement de LIFE CHANNEL..."

# 1. Vérification de Docker et Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Erreur : Docker n'est pas installé sur cette machine."
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Erreur : Docker Compose n'est pas installé sur cette machine."
    exit 1
fi

# 2. Création du fichier .env si absent
if [ ! -f .env ]; then
    echo "⚙️ Génération du fichier .env à partir de .env.example..."
    cp .env.example .env
fi

# 3. Arrêt des anciens conteneurs si présents
echo "🧹 Nettoyage des anciens conteneurs..."
docker compose -f docker-compose.prod.yml down --remove-orphans || true

# 4. Construction et démarrage des conteneurs
echo "🔨 Construction et démarrage des 17 conteneurs (Microservices + BDD + Frontend)..."
docker compose -f docker-compose.prod.yml up -d --build

# 5. Attente de la montée des services
echo "⏳ Initialisation des services (Eureka, BDD, Gateway)..."
sleep 15

# 6. État des services
echo "📊 État des conteneurs en cours d'exécution :"
docker compose -f docker-compose.prod.yml ps

echo "=============================================================================="
echo "✅ DÉPLOIEMENT RÉUSSI !"
echo "🌐 Portail Web (Frontend)    : http://$(hostname -I | awk '{print $1}')"
echo "🌐 Passerelle API Gateway     : http://$(hostname -I | awk '{print $1}'):8080"
echo "🌐 Tableau de bord Eureka     : http://$(hostname -I | awk '{print $1}'):8761"
echo "=============================================================================="
