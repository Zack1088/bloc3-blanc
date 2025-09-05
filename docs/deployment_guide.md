# 🚀 Guide de Déploiement - Gestion des Véhicules

## 📋 Vue d'ensemble

Ce guide vous accompagne dans le déploiement du système de gestion des véhicules en production. Plusieurs options sont disponibles selon vos besoins et contraintes.

### 🎯 Architectures supportées
- **Monolithe** : Backend + Frontend sur le même serveur
- **Séparée** : Frontend et Backend déployés indépendamment  
- **Microservices** : APIs distribuées (évolution future)

---

## 🐳 Déploiement Docker (Recommandé)

### 📦 **Option 1 : Docker Compose (Développement)**

#### Dockerfile Backend
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production

# Démarrer l'application
CMD ["node", "server.js"]
```

#### Dockerfile Frontend
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Build du frontend
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serveur de production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: garage_db
      MYSQL_USER: garage_user
      MYSQL_PASSWORD: garage_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build: 
      context: .
      dockerfile: backend/Dockerfile
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_USER=garage_user
      - DB_PASSWORD=garage_password
      - DB_NAME=garage_db
      - JWT_SECRET=your-super-secret-jwt-key-here
      - CSRF_SECRET=your-super-secret-csrf-key-here
    ports:
      - "3000:3000"
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - VITE_API_BASE_URL=http://localhost:3000/
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mysql_data:
```

#### Commandes de déploiement
```bash
# Construction et démarrage
docker-compose up --build -d

# Vérification des logs
docker-compose logs -f

# Arrêt
docker-compose down

# Avec suppression des volumes (ATTENTION : perte de données)
docker-compose down -v
```

### 🏭 **Option 2 : Docker Production**

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/mysql_root_password
      MYSQL_DATABASE: garage_db
      MYSQL_USER: garage_user
      MYSQL_PASSWORD_FILE: /run/secrets/mysql_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database:/docker-entrypoint-initdb.d
    secrets:
      - mysql_root_password
      - mysql_password
    restart: always
    networks:
      - garage_network

  backend:
    build: 
      context: .
      dockerfile: backend/Dockerfile
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_USER=garage_user
      - DB_PASSWORD_FILE=/run/secrets/mysql_password
      - DB_NAME=garage_db
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - CSRF_SECRET_FILE=/run/secrets/csrf_secret
    secrets:
      - mysql_password
      - jwt_secret
      - csrf_secret
    depends_on:
      - mysql
    restart: always
    networks:
      - garage_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    depends_on:
      - backend
    restart: always
    networks:
      - garage_network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: always
    networks:
      - garage_network

secrets:
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
  mysql_password:
    file: ./secrets/mysql_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  csrf_secret:
    file: ./secrets/csrf_secret.txt

volumes:
  mysql_data:

networks:
  garage_network:
    driver: bridge
```

---

## ☁️ Déploiement Cloud

### 🚀 **Heroku (Backend)**

#### Préparation
```bash
# Installation Heroku CLI
npm install -g heroku

# Connexion
heroku login

# Création de l'app
heroku create garage-vehicules-api
```

#### Configuration
```bash
# Variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key
heroku config:set CSRF_SECRET=your-super-secret-csrf-key

# Base de données (ClearDB ou JawsDB)
heroku addons:create cleardb:ignite
heroku config:get CLEARDB_DATABASE_URL

# Parsage de l'URL pour les variables séparées
heroku config:set DB_HOST=your-host
heroku config:set DB_USER=your-user
heroku config:set DB_PASSWORD=your-password
heroku config:set DB_NAME=your-database
```

#### Procfile
```
web: node server.js
```

#### Déploiement
```bash
# Ajout du remote Heroku
git remote add heroku https://git.heroku.com/garage-vehicules-api.git

# Déploiement
git push heroku main

# Vérification
heroku logs --tail
heroku open
```

### 🌐 **Netlify/Vercel (Frontend)**

#### Netlify
```bash
# Installation Netlify CLI
npm install -g netlify-cli

# Build local
npm run build

# Déploiement
netlify deploy --prod --dir=dist

# Configuration des variables d'environnement dans l'interface Netlify
VITE_API_BASE_URL=https://garage-vehicules-api.herokuapp.com/
```

#### Vercel
```bash
# Installation Vercel CLI
npm install -g vercel

# Déploiement
vercel --prod

# Variables d'environnement
vercel env add VITE_API_BASE_URL production
```

### 🗄️ **PlanetScale (Base de données)**

#### Setup
```bash
# Installation PlanetScale CLI
brew install planetscale/tap/pscale

# Connexion
pscale auth login

# Création de la base
pscale database create garage-db --region us-east

# Création d'une branche de développement
pscale branch create garage-db dev

# Connexion locale pour migration
pscale connect garage-db dev --port 3309

# Exécution des migrations
mysql -h 127.0.0.1 -P 3309 -u root < database/garage.sql
mysql -h 127.0.0.1 -P 3309 -u root < database/vehicules_setup.sql
```

#### Promotion en production
```bash
# Demande de promotion
pscale deploy-request create garage-db dev

# Approbation et déploiement
pscale deploy-request deploy garage-db dev

# Récupération de la chaîne de connexion
pscale password create garage-db main pscale_pw_name
```

---

## 🖥️ Déploiement VPS

### 🐧 **Ubuntu/Debian Server**

#### Préparation du serveur
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des dépendances
sudo apt install -y curl git nginx mysql-server

# Installation de Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installation de PM2
sudo npm install -g pm2
```

#### Configuration MySQL
```bash
# Sécurisation de MySQL
sudo mysql_secure_installation

# Création de la base de données
sudo mysql -u root -p
```

```sql
CREATE DATABASE garage_db;
CREATE USER 'garage_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON garage_db.* TO 'garage_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Déploiement de l'application
```bash
# Clonage du repository
git clone https://github.com/votre-username/garage-vehicules.git
cd garage-vehicules

# Installation des dépendances
npm install --production

# Configuration
cp .env.example .env
nano .env  # Éditer les variables
```

#### Configuration PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'garage-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

```bash
# Démarrage avec PM2
pm2 start ecosystem.config.js --env production

# Sauvegarde de la configuration PM2
pm2 save
pm2 startup
```

#### Configuration Nginx
```nginx
# /etc/nginx/sites-available/garage-vehicules
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend (fichiers statiques)
    location / {
        root /var/www/garage-vehicules/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activation du site
sudo ln -s /etc/nginx/sites-available/garage-vehicules /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL avec Let's Encrypt
```bash
# Installation Certbot
sudo apt install -y certbot python3-certbot-nginx

# Génération du certificat
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoring et Maintenance

### 📈 **Monitoring avec PM2**
```bash
# Monitoring en temps réel
pm2 monit

# Logs
pm2 logs garage-api

# Redémarrage
pm2 restart garage-api

# Métriques
pm2 show garage-api
```

### 🔍 **Health Checks**
```javascript
// health-check.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/vehicules/count',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Health check: ${res.statusCode}`);
  process.exit(res.statusCode === 200 ? 0 : 1);
});

req.on('error', (err) => {
  console.error('Health check failed:', err);
  process.exit(1);
});

req.end();
```

### 📋 **Script de sauvegarde**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/garage-db"
DB_NAME="garage_db"

# Création du répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u garage_user -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/garage_db_$DATE.sql

# Compression
gzip $BACKUP_DIR/garage_db_$DATE.sql

# Nettoyage (garder 7 jours)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: garage_db_$DATE.sql.gz"
```

### 🔄 **Script de déploiement automatique**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement en cours..."

# Arrêt de l'application
pm2 stop garage-api

# Mise à jour du code
git pull origin main

# Installation des nouvelles dépendances
npm install --production

# Migrations de base de données (si nécessaires)
# mysql -u garage_user -p garage_db < migrations/latest.sql

# Redémarrage de l'application
pm2 start garage-api

# Vérification
sleep 5
pm2 status garage-api

echo "✅ Déploiement terminé!"
```

---

## 🔒 Sécurité Production

### 🛡️ **Configuration sécurisée**
```javascript
// security.js - Middleware de sécurité supplémentaire
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Helmet pour les headers de sécurité
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP'
});

app.use('/api/', limiter);

// Logs de sécurité
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.ip} - ${req.method} ${req.path}`);
  next();
});
```

### 🔐 **Variables d'environnement sécurisées**
```bash
# Production .env - JAMAIS commité dans Git
NODE_ENV=production
DB_HOST=localhost
DB_USER=garage_user
DB_PASSWORD=super_strong_password_here
DB_NAME=garage_db
JWT_SECRET=ultra_secure_jwt_secret_minimum_32_chars
CSRF_SECRET=ultra_secure_csrf_secret_minimum_32_chars
ALLOWED_ORIGINS=https://votre-domaine.com
```

---

## ✅ Checklist de déploiement

### 🔧 **Avant le déploiement**
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Tests passés en local
- [ ] Build de production testé
- [ ] Certificats SSL configurés (si applicable)
- [ ] Monitoring configuré
- [ ] Sauvegardes automatiques configurées

### 🚀 **Déploiement**
- [ ] Code pushé sur la branche main
- [ ] Application déployée sur l'environnement de production
- [ ] Base de données migrée
- [ ] Variables d'environnement mises à jour
- [ ] Services redémarrés

### 🧪 **Post-déploiement**
- [ ] Health checks passés
- [ ] Fonctionnalités critiques testées
- [ ] Logs vérifiés
- [ ] Performance validée
- [ ] Équipe notifiée

---

## 🆘 Dépannage

### ❌ **Problèmes courants**

#### Erreur de connexion base de données
```bash
# Vérifier la connexion
mysql -h localhost -u garage_user -p garage_db

# Vérifier les logs
pm2 logs garage-api
```

#### Application ne démarre pas
```bash
# Vérifier les ports
sudo netstat -tlnp | grep :3000

# Vérifier PM2
pm2 status
pm2 restart garage-api
```

#### Erreurs CORS
```javascript
// Vérifier la configuration CORS
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
    credentials: true
};
```

---

**🎉 Votre application est maintenant prête pour la production ! 🚀**

**⚠️ N'oubliez pas de :**
- Surveiller les logs régulièrement
- Effectuer des sauvegardes
- Maintenir les dépendances à jour
- Surveiller les performances