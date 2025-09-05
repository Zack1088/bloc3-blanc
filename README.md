# 🚗 Système de Gestion des Véhicules - Garage VroumVroum

> **Fonctionnalité de gestion des véhicules pour le dashboard administrateur du garage**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg)](https://expressjs.com/)

## 📋 Table des matières

- [🎯 Aperçu du projet](#-aperçu-du-projet)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [⚙️ Installation](#️-installation)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [📊 Base de données](#-base-de-données)
- [🔌 API Endpoints](#-api-endpoints)
- [🎨 Interface utilisateur](#-interface-utilisateur)
- [🧪 Tests](#-tests)
- [🔒 Sécurité](#-sécurité)
- [📱 Responsive Design](#-responsive-design)
- [🚀 Déploiement](#-déploiement)
- [🤝 Contribution](#-contribution)

## 🎯 Aperçu du projet

Ce projet ajoute une **fonctionnalité complète de gestion des véhicules** au dashboard existant du garage VroumVroum. Il permet aux administrateurs de gérer l'inventaire des véhicules avec une interface moderne et intuitive.

### 🎭 Contexte
Le garage VroumVroum avait besoin d'un système pour :
- Centraliser la gestion de leurs véhicules
- Associer les véhicules aux clients
- Suivre l'inventaire en temps réel
- Faciliter les opérations quotidiennes

### 🏆 Résultats
- ✅ Interface d'administration complète
- ✅ Opérations CRUD sécurisées
- ✅ Association véhicule-client
- ✅ Design responsive modern
- ✅ Architecture extensible

## ✨ Fonctionnalités

### 📊 **Dashboard administrateur**
- Compteur de véhicules en temps réel
- Vue d'ensemble des statistiques
- Navigation intuitive

### 🚗 **Gestion des véhicules**
- **Listing** : Affichage de tous les véhicules avec informations détaillées
- **Ajout** : Formulaire complet avec validation
- **Modification** : Édition des informations existantes  
- **Suppression** : Suppression sécurisée avec confirmation

### 👥 **Association clients**
- Liaison véhicule-client optionnelle
- Affichage des informations client
- Gestion des véhicules non attribués

### 🔐 **Sécurité**
- Authentification JWT obligatoire
- Protection CSRF sur toutes les modifications
- Validation côté serveur et client
- Autorisation admin uniquement

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React.js      │◄──►│   Express.js    │◄──►│    MySQL        │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • JWT Auth      │    │ • users         │
│ • CRUD Interface│    │ • CSRFProtection│    │ • vehicules     │
│ • Responsive UI │    │ • API Routes    │    │ • Relations FK  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🛠️ **Stack technique**
- **Frontend** : React 18, React Router, CSS3
- **Backend** : Node.js, Express.js, JWT, bcrypt
- **Base de données** : MySQL 8.0
- **Sécurité** : CSRF tokens, Input validation
- **Outils** : Vite, npm

## ⚙️ Installation

### 📋 **Prérequis**
- Node.js 18+ ([Télécharger](https://nodejs.org/))
- MySQL 8.0+ ([Télécharger](https://mysql.com/downloads/))
- npm ou yarn

### 📥 **Cloner le projet**
```bash
git clone https://github.com/votre-username/garage-vehicules.git
cd garage-vehicules
```

### 📦 **Installation des dépendances**
```bash
# Backend
npm install

# Frontend (si séparé)
cd client
npm install
cd ..
```

### 🗄️ **Configuration de la base de données**
1. Créez une base de données MySQL :
```sql
CREATE DATABASE garage_db;
```

2. Exécutez les scripts SQL :
```bash
mysql -u root -p garage_db < database/garage.sql
mysql -u root -p garage_db < database/vehicules_setup.sql
```

### 🔧 **Variables d'environnement**
Créez un fichier `.env` :
```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=garage_db

# JWT
JWT_SECRET=OEKFNEZKkF78EZFH93023NOEAF

# CSRF
CSRF_SECRET=OEKFNEZKkF78EZFH93

# Serveur
PORT=3000
NODE_ENV=development

# Frontend
VITE_API_BASE_URL=http://localhost:3000/
```

## 🚀 Démarrage rapide

### 🖥️ **Développement**
```bash
# Terminal 1 - Backend
npm run dev
# ou
node server.js

# Terminal 2 - Frontend (si séparé)
cd client
npm run dev
```

### 🌐 **Accès à l'application**
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000

### 👤 **Connexion admin**
```
Email    : garagiste@vroumvroum.fr
Password : [voir base de données]
```

## 📊 Base de données

### 🏗️ **Structure**

#### Table `vehicules`
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | INT(11) | PK, AUTO_INCREMENT | Identifiant unique |
| `plaque_immatriculation` | VARCHAR(20) | UNIQUE, NOT NULL | Plaque d'immatriculation |
| `marque` | VARCHAR(50) | NOT NULL | Marque du véhicule |
| `modele` | VARCHAR(50) | NOT NULL | Modèle du véhicule |
| `annee` | INT(11) | NULL | Année de fabrication |
| `client_id` | INT(11) | FK, NULL | Référence vers users.id |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Date de modification |

#### Relations
- `vehicules.client_id` → `users.id` (ON DELETE SET NULL)

### 📈 **Diagramme ERD**
```
┌─────────────────┐         ┌─────────────────┐
│     users       │         │    vehicules    │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────┤ id (PK)         │
│ lastname        │   1:n   │ plaque (UNIQUE) │
│ firstname       │         │ marque          │
│ email           │         │ modele          │
│ password        │         │ annee           │
│ role            │         │ client_id (FK)  │
│ created_at      │         │ created_at      │
└─────────────────┘         │ updated_at      │
                            └─────────────────┘
```

## 🔌 API Endpoints

### 📋 **Véhicules**

| Méthode | Endpoint | Auth | CSRF | Description |
|---------|----------|------|------|-------------|
| `GET` | `/api/vehicules` | ✅ Admin | ❌ | Liste tous les véhicules |
| `GET` | `/api/vehicules/count` | ✅ Admin | ❌ | Compte les véhicules |
| `GET` | `/api/vehicules/:id` | ✅ User | ❌ | Détails d'un véhicule |
| `GET` | `/api/vehicules/client/:clientId` | ✅ User | ❌ | Véhicules d'un client |
| `POST` | `/api/vehicules` | ✅ Admin | ✅ | Ajouter un véhicule |
| `PUT` | `/api/vehicules/:id` | ✅ Admin | ✅ | Modifier un véhicule |
| `DELETE` | `/api/vehicules/:id` | ✅ Admin | ✅ | Supprimer un véhicule |

### 📝 **Exemples d'utilisation**

#### Lister les véhicules
```javascript
const response = await fetch('/api/vehicules', {
  method: 'GET',
  credentials: 'include'
});
const vehicules = await response.json();
```

#### Ajouter un véhicule
```javascript
const csrfToken = await getCSRFToken();
const response = await fetch('/api/vehicules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    plaque_immatriculation: 'AB-123-CD',
    marque: 'Peugeot',
    modele: '308',
    annee: 2020,
    client_id: 2,
    token: csrfToken
  })
});
```

### 🔐 **Authentification**
Toutes les routes protégées nécessitent un token JWT valide envoyé via cookies.

### 🛡️ **Protection CSRF**
Les opérations de modification (POST, PUT, DELETE) nécessitent un token CSRF obtenu via `/api/csrf`.

## 🎨 Interface utilisateur

### 📊 **Dashboard principal**
- Carte avec compteur de véhicules
- Bouton d'accès à la gestion
- Interface cohérente avec le design existant

### 🚗 **Page de gestion des véhicules**
- **Header** : Titre, boutons d'action, navigation
- **Liste** : Tableau responsive avec toutes les informations
- **Actions** : Boutons d'édition et suppression sur chaque ligne
- **Modal** : Formulaire d'ajout/modification en overlay

### 🎯 **Fonctionnalités UX**
- Messages de succès/erreur
- Confirmations de suppression
- Validation en temps réel
- Indicateurs de chargement
- Navigation intuitive

## 🧪 Tests

### 🤖 **Tests automatisés**
```bash
# Tests API backend
chmod +x tests/test_vehicules_api.sh
./tests/test_vehicules_api.sh
```

### 🗄️ **Tests base de données**
```bash
mysql -u root -p garage_db < tests/database_validation.sql
```

### ✋ **Tests manuels**
Suivez la checklist dans `tests/manual_test_checklist.md` (26 tests)

### 📊 **Couverture de tests**
- ✅ 7 endpoints API
- ✅ Authentification et autorisations
- ✅ Protection CSRF
- ✅ Validation des données
- ✅ Interface utilisateur complète
- ✅ Responsive design

## 🔒 Sécurité

### 🛡️ **Mesures implémentées**
- **Authentification JWT** : Token obligatoire pour toutes les opérations
- **Autorisations** : Accès admin uniquement pour la gestion
- **Protection CSRF** : Tokens sur toutes les modifications
- **Validation** : Côté client et serveur
- **Sanitisation** : Échappement des entrées utilisateur
- **HTTPS Ready** : Compatible pour le déploiement sécurisé

### 🔐 **Bonnes pratiques**
- Mots de passe hashés (bcrypt)
- Cookies httpOnly pour les tokens
- Validation stricte des données
- Messages d'erreur génériques
- Logs de sécurité

## 📱 Responsive Design

### 📏 **Breakpoints**
- **Mobile** : < 768px
- **Tablette** : 768px - 1024px  
- **Desktop** : > 1024px

### 🎨 **Adaptations**
- Interface mobile-first
- Navigation adaptative
- Tableaux scrollables
- Modals responsives
- Touch-friendly sur mobile

## 🚀 Déploiement

### 🐳 **Docker (Recommandé)**
```bash
# Build et lancement
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### 🌐 **Déploiement manuel**

#### **Frontend (Netlify/Vercel)**
```bash
# Build production
cd client
npm run build

# Deploy sur Netlify
npx netlify deploy --prod --dir=dist
```

#### **Backend (Heroku/Railway)**
```bash
# Préparer pour production
npm run build

# Deploy sur Heroku
git push heroku main
```

#### **Base de données (PlanetScale/Railway)**
- Exporter le schéma local
- Importer sur le service cloud
- Mettre à jour les variables d'environnement

### 🔧 **Variables d'environnement production**
```env
NODE_ENV=production
DB_HOST=votre-db-host
DB_USER=votre-db-user
DB_PASSWORD=votre-db-password
JWT_SECRET=votre-jwt-secret-securise
CSRF_SECRET=votre-csrf-secret-securise
```

## 📚 Documentation supplémentaire

### 📋 **Livrables du projet**
- ✅ **Site déployé** : [URL de démonstration]
- ✅ **Code source** : Ce repository GitHub
- ✅ **Présentation** : `docs/presentation.md`
- ✅ **Diagramme BDD** : `docs/database_diagram.png`

### 📖 **Guides**
- [Guide d'installation détaillé](docs/installation.md)
- [Documentation API complète](docs/api.md)
- [Guide de contribution](docs/contributing.md)
- [Changelog](CHANGELOG.md)

## 🤝 Contribution

### 🛠️ **Développement**
1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### 🐛 **Signaler un bug**
Utilisez les [GitHub Issues](../../issues) avec le template bug report.

### 💡 **Proposer une amélioration**
Utilisez les [GitHub Issues](../../issues) avec le template feature request.

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Équipe du garage VroumVroum pour les spécifications
- Communauté React et Express.js
- Contributeurs du projet

---

## 📞 Contact

**Développeur** : Zack  
**Email** : zack@safebyte.fr  
**Project Link** : https://github.com/Zack1088/bloc3-blanc

---

<div align="center">

**🚗 Fait avec ❤️ pour le garage VroumVroum 🚗**

![Footer](https://img.shields.io/badge/Made%20with-React%20%2B%20Express-blue?style=for-the-badge)

</div>