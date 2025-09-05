# 🔌 API Documentation - Gestion des Véhicules

## 📋 Vue d'ensemble

Cette API REST permet la gestion complète des véhicules dans le système du garage VroumVroum. Elle fournit des endpoints sécurisés pour les opérations CRUD avec authentification JWT et protection CSRF.

### 🌐 Base URL
```
http://localhost:3000/api
```

### 🔐 Authentification
Toutes les routes protégées nécessitent un token JWT valide envoyé via cookies.

### 🛡️ Protection CSRF
Les opérations de modification (POST, PUT, DELETE) nécessitent un token CSRF.

---

## 🔑 Authentication Endpoints

### POST /api/signin
Authentification d'un utilisateur.

**Body Parameters:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response Success (200):**
```json
{
  "auth": true,
  "role": "admin|client"
}
```

**Response Error (404):**
```json
"User not found"
```

**Response Error (401):**
```json
"Invalid password"
```

### GET /api/csrf
Récupération d'un token CSRF pour les opérations de modification.

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response Success (200):**
```json
{
  "status": 200,
  "message": "CSRF récupéré",
  "token": "csrf_token_string"
}
```

---

## 🚗 Vehicules Endpoints

### GET /api/vehicules
Liste tous les véhicules avec les informations des clients associés.

**Authorization:** Admin seulement

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "plaque_immatriculation": "AB-123-CD",
    "marque": "Peugeot",
    "modele": "308",
    "annee": 2019,
    "client_id": 2,
    "client_nom": "Edward Elric",
    "client_email": "edward.elric@alchem.fma",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "plaque_immatriculation": "IJ-789-KL",
    "marque": "Toyota",
    "modele": "Corolla",
    "annee": 2018,
    "client_id": null,
    "client_nom": null,
    "client_email": null,
    "created_at": "2024-01-15T10:31:00.000Z",
    "updated_at": "2024-01-15T10:31:00.000Z"
  }
]
```

**Response Error (401):**
```json
"Access Denied: No Token Provided!"
```

**Response Error (403):**
```json
"Access Denied: You do not have the required role!"
```

### GET /api/vehicules/count
Retourne le nombre total de véhicules.

**Authorization:** Admin seulement

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response Success (200):**
```json
{
  "count": 7
}
```

### GET /api/vehicules/:id
Récupère les détails d'un véhicule spécifique.

**Authorization:** Admin ou Client

**Parameters:**
- `id` (integer, required): ID du véhicule

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response Success (200):**
```json
{
  "id": 1,
  "plaque_immatriculation": "AB-123-CD",
  "marque": "Peugeot",
  "modele": "308",
  "annee": 2019,
  "client_id": 2,
  "client_nom": "Edward Elric",
  "client_email": "edward.elric@alchem.fma",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Response Error (404):**
```json
"Véhicule non trouvé"
```

### GET /api/vehicules/client/:clientId
Récupère tous les véhicules d'un client spécifique.

**Authorization:** Admin ou Client

**Parameters:**
- `clientId` (integer, required): ID du client

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "plaque_immatriculation": "AB-123-CD",
    "marque": "Peugeot",
    "modele": "308",
    "annee": 2019,
    "client_id": 2,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### POST /api/vehicules
Ajoute un nouveau véhicule.

**Authorization:** Admin seulement
**CSRF Protection:** Required

**Headers:**
```
Content-Type: application/json
Cookie: token=<jwt_token>
```

**Body Parameters:**
```json
{
  "plaque_immatriculation": "string (required, unique)",
  "marque": "string (required)",
  "modele": "string (required)",
  "annee": "integer (optional)",
  "client_id": "integer (optional, must exist in users table)",
  "token": "string (required, CSRF token)"
}
```

**Example Request:**
```json
{
  "plaque_immatriculation": "XY-456-ZW",
  "marque": "Renault",
  "modele": "Clio",
  "annee": 2022,
  "client_id": 2,
  "token": "csrf_token_here"
}
```

**Response Success (201):**
```json
{
  "message": "Véhicule ajouté avec succès",
  "vehiculeId": 8
}
```

**Response Error (400):**
```json
"Plaque d'immatriculation, marque et modèle sont obligatoires"
```

**Response Error (409):**
```json
"Cette plaque d'immatriculation existe déjà"
```

**Response Error (404):**
```json
"Client non trouvé"
```

**Response Error (403):**
```json
"Invalid CSRF Token"
```

### PUT /api/vehicules/:id
Modifie un véhicule existant.

**Authorization:** Admin seulement
**CSRF Protection:** Required

**Parameters:**
- `id` (integer, required): ID du véhicule à modifier

**Headers:**
```
Content-Type: application/json
Cookie: token=<jwt_token>
```

**Body Parameters:**
```json
{
  "plaque_immatriculation": "string (required, unique)",
  "marque": "string (required)",
  "modele": "string (required)",
  "annee": "integer (optional)",
  "client_id": "integer (optional, must exist in users table)",
  "token": "string (required, CSRF token)"
}
```

**Example Request:**
```json
{
  "plaque_immatriculation": "AB-123-CD-MODIFIED",
  "marque": "Peugeot",
  "modele": "308 GTI",
  "annee": 2020,
  "client_id": null,
  "token": "csrf_token_here"
}
```

**Response Success (200):**
```json
{
  "message": "Véhicule modifié avec succès"
}
```

**Response Error (404):**
```json
"Véhicule non trouvé"
```

**Response Error (409):**
```json
"Cette plaque d'immatriculation existe déjà"
```

### DELETE /api/vehicules/:id
Supprime un véhicule.

**Authorization:** Admin seulement
**CSRF Protection:** Required

**Parameters:**
- `id` (integer, required): ID du véhicule à supprimer

**Headers:**
```
Content-Type: application/json
Cookie: token=<jwt_token>
```

**Body Parameters:**
```json
{
  "token": "string (required, CSRF token)"
}
```

**Response Success (200):**
```json
{
  "message": "Véhicule supprimé avec succès"
}
```

**Response Error (404):**
```json
"Véhicule non trouvé"
```

---

## 👥 Users Endpoints (Existants)

### GET /api/clients
Liste tous les clients.

**Authorization:** Admin seulement

### GET /api/clients/count
Retourne le nombre de clients.

**Authorization:** Admin seulement

---

## 🚨 Codes d'erreur

| Code | Description |
|------|-------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Données invalides |
| `401` | Non authentifié |
| `403` | Accès refusé / CSRF invalide |
| `404` | Ressource non trouvée |
| `409` | Conflit (ex: plaque déjà existante) |
| `500` | Erreur serveur |

---

## 📝 Exemples d'utilisation

### JavaScript/Fetch

#### Récupérer le token CSRF
```javascript
async function getCSRFToken() {
  const response = await fetch('/api/csrf', {
    credentials: 'include'
  });
  const data = await response.json();
  return data.token;
}
```

#### Lister les véhicules
```javascript
async function getVehicules() {
  try {
    const response = await fetch('/api/vehicules', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const vehicules = await response.json();
    return vehicules;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}
```

#### Ajouter un véhicule
```javascript
async function addVehicule(vehiculeData) {
  try {
    const csrfToken = await getCSRFToken();
    
    const response = await fetch('/api/vehicules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        ...vehiculeData,
        token: csrfToken
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Utilisation
const nouveauVehicule = {
  plaque_immatriculation: 'NEW-123',
  marque: 'BMW',
  modele: 'Serie 1',
  annee: 2023,
  client_id: 2
};

addVehicule(nouveauVehicule)
  .then(result => console.log('Véhicule ajouté:', result))
  .catch(error => console.error('Erreur:', error));
```

### cURL

#### Connexion
```bash
curl -X POST "http://localhost:3000/api/signin" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "garagiste@vroumvroum.fr",
    "password": "votre_mot_de_passe"
  }'
```

#### Récupérer token CSRF
```bash
curl -X GET "http://localhost:3000/api/csrf" \
  -b cookies.txt
```

#### Ajouter un véhicule
```bash
curl -X POST "http://localhost:3000/api/vehicules" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "plaque_immatriculation": "TEST-789",
    "marque": "Ford",
    "modele": "Focus",
    "annee": 2021,
    "client_id": null,
    "token": "your_csrf_token_here"
  }'
```

---

## 🔒 Sécurité

### Authentification JWT
- Les tokens sont stockés dans des cookies httpOnly
- Expiration automatique après 24 heures
- Vérification du rôle utilisateur sur chaque requête

### Protection CSRF
- Token unique par session
- Validation côté serveur obligatoire
- Renouvellement automatique après chaque opération

### Validation des données
- Validation côté serveur sur tous les endpoints
- Échappement des caractères spéciaux
- Vérification de l'intégrité référentielle

### Autorisations
- Rôles utilisateur strictement vérifiés
- Accès admin uniquement pour les modifications
- Logs de sécurité sur les tentatives d'accès

---

## 📊 Limites et contraintes

### Contraintes de données
- Plaque d'immatriculation : 20 caractères max, unique
- Marque/Modèle : 50 caractères max
- Année : entier valide
- Client : doit exister dans la table users avec role='client'

### Limites de performance
- Pas de pagination sur `/api/vehicules` (à implémenter si >1000 véhicules)
- Pas de cache sur les requêtes fréquentes
- Transactions simples sans optimisation bulk

### Recommandations d'usage
- Renouveler le token CSRF après chaque opération de modification
- Gérer les erreurs réseau côté client
- Implémenter des timeouts appropriés
- Utiliser HTTPS en production

---

## 🔄 Changelog API

### Version 1.0.0 (Actuelle)
- ✅ Endpoints CRUD complets pour véhicules
- ✅ Authentification JWT
- ✅ Protection CSRF
- ✅ Association véhicule-client
- ✅ Validation des données

### Améliorations futures
- 🔄 Pagination sur les listes
- 🔄 Filtres et recherche
- 🔄 Upload d'images de véhicules
- 🔄 API versioning
- 🔄 Rate limiting
- 🔄 Cache Redis

---

**📚 Cette documentation est maintenue à jour avec chaque release. Pour signaler des erreurs ou proposer des améliorations, créez une issue sur GitHub.**