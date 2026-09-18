# LIFE CHANNEL — Plateforme Multimédia d'Information (RDC)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-Spring%20Cloud%20Microservices-informational.svg)](https://spring.io/projects/spring-cloud)

> Plateforme multimédia d'actualités en continu, streaming radio 24h/24, diffusion TV en direct et podcasts audio, conçue selon le standard éditorial et de cybersécurité **Africanews**.

---

## 🌍 Fonctionnalités Clés & Spécificités RDC

- **Modèle de Sécurité Africanews (Double Espace Étanche)** :
  - **Côté Public** : Consultation 100% libre et anonyme (aucun formulaire ni bouton de connexion visible, éliminant toute surface d'attaque par force brute).
  - **Côté Rédaction & Administration (`/staff`, `/admin/login`)** : Espace sécurisé réservé aux journalistes, éditeurs et administrateurs accrédités.
- **Dualité des Fuseaux Horaires de RDC (Article 46)** :
  - Prise en compte des deux fuseaux nationaux avec bascule en temps réel : **Ouest (WAT / Kinshasa GMT+1)** et **Est (CAT / Lubumbashi & Goma GMT+2)**.
- **Mode Économie de Données RDC (« Mode Éco »)** :
  - Optimisation de la bande passante et adaptation automatique des flux audio pour les connexions mobiles lentes.
- **Multimédia Continu & Zéro Image Brisée** :
  - Lecteur radio 24/7 persistant (Icecast 2).
  - Diffusion TV directe et grille prévisionnelle des programmes.
  - Podcasts à la demande avec débits allégés.
  - Système de fallback vectoriel SVG local garantissant l'absence de coupure d'images.

---

## 🏛️ Architecture Technique

### Backend (Microservices Spring Cloud)
* **`discovery-server`** : Registre de services Netflix Eureka.
* **`api-gateway`** : Passerelle API Spring Cloud Gateway (Reverse Proxy & filtrage CORS).
* **`user-service`** : Gestion des comptes internes, rôles (RBAC) et authentification JWT.
* **`content-service`** : Moteur rédactionnel des articles, catégories et planification.
* **`podcast-service`** : Gestion des épisodes et émissions audio.
* **`live-service`** : Gestion des flux TV et programmation en direct.
* **`media-service`** : Stockage et distribution des médias.
* **`comment-service`** : Réactions citoyennes et modération.
* **`search-service`** : Indexation et moteur de recherche.
* **`notification-service`** : Alertes urgentes (*Breaking News*) et notifications.
* **`analytics-service`** : Télémétrie et statistiques d'audience.
* **`advertisement-service`** : Régie des bannières publicitaires.

### Infrastructure & Bases de Données
* **PostgreSQL 15** : Base de données relationnelle principale (JPA / Hibernate).
* **MongoDB 6.0** : Base NoSQL pour les journaux d'audit et données flexibles.
* **Redis 7** : Cache en mémoire vive et limitation de débit.
* **RabbitMQ 3** : Broker de messages asynchrones (AMQP).

### Frontend
* **React 19** + **React Router v7** + **Vite 8**
* Design System Glassmorphism sombre, 100% responsive (Mobile, Tablette, PC).
* Contextes React dédiés : `AuthContext`, `AudioPlayerContext`, `TimezoneContext`, `ToastContext`.

---

## 🚀 Démarrage Rapide

### 1. Cloner le projet
```bash
git clone https://github.com/Empreur-N/Project_Media.git
cd Project_Media
```

### 2. Démarrer les bases de données et services d'infrastructure
```bash
docker-compose up -d
```

### 3. Démarrer le Frontend
```bash
cd frontend
npm install
npm run dev
```
Accédez à l'application sur `http://localhost:5173/` (ou `5174`).

---

## 👤 Auteur & Droits
- **Développeur & Propriétaire** : EMPEREUR NGOY ([@Empreur-N](https://github.com/Empreur-N))
- **Email** : `2023024014@upl-univ.ac`
- **Copyright** : © 2026 LIFE CHANNEL RDC. Tous droits réservés.
