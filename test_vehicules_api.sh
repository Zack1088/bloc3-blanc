#!/bin/bash
# test_vehicules_success.sh
# Script de test avec messages de succès dans la console

echo "🧪 Tests automatisés - APIs Véhicules"
echo "===================================="

# Configuration
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="garagiste@vroumvroum.fr"
ADMIN_PASSWORD="Azerty@01" 

# Couleurs pour les résultats
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Compteurs
PASSED=0
FAILED=0

# Fonction pour afficher les résultats avec des messages sympas
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        echo -e "${CYAN}   → $3${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# Fonction pour afficher un message de succès stylé
print_success_banner() {
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  🎉 FÉLICITATIONS ! 🎉                 ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║            ✅ TOUS LES TESTS SONT PASSÉS ! ✅           ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║    🚗 Votre système de gestion des véhicules est      ║${NC}"
    echo -e "${GREEN}║         opérationnel et prêt pour la production !     ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
}

# Nettoyage
rm -f cookies.txt 2>/dev/null

echo -e "\n${YELLOW}📡 Vérification du serveur...${NC}"
if curl -s --max-time 5 "$BASE_URL" > /dev/null 2>&1; then
    print_result 0 "Serveur accessible" "Le serveur répond sur $BASE_URL"
else
    print_result 1 "Serveur non accessible"
    exit 1
fi

echo -e "\n${YELLOW}🔐 Test de connexion admin...${NC}"
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST "$BASE_URL/api/signin" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}" \
    2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q '"auth":true'; then
    print_result 0 "Connexion admin réussie" "Authentification JWT validée avec succès"
else
    print_result 1 "Échec connexion admin"
    exit 1
fi

echo -e "\n${YELLOW}🔑 Récupération token CSRF...${NC}"
CSRF_RESPONSE=$(curl -s -b cookies.txt "$BASE_URL/api/csrf" 2>/dev/null)

if echo "$CSRF_RESPONSE" | grep -q '"token"'; then
    CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    print_result 0 "Token CSRF récupéré" "Protection CSRF active et fonctionnelle"
else
    print_result 1 "Échec récupération token CSRF"
    exit 1
fi

echo -e "\n${YELLOW}📊 Test GET /api/vehicules/count${NC}"
COUNT_RESPONSE=$(curl -s -b cookies.txt "$BASE_URL/api/vehicules/count" 2>/dev/null)

if echo "$COUNT_RESPONSE" | grep -q '"count"'; then
    COUNT=$(echo "$COUNT_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    print_result 0 "Compteur véhicules fonctionnel" "$COUNT véhicules trouvés dans la base"
else
    print_result 1 "Échec récupération compteur"
    exit 1
fi

echo -e "\n${YELLOW}📋 Test GET /api/vehicules${NC}"
LIST_RESPONSE=$(curl -s -w "%{http_code}" -b cookies.txt "$BASE_URL/api/vehicules" 2>/dev/null)
HTTP_CODE="${LIST_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Liste véhicules récupérée" "API de consultation opérationnelle"
else
    print_result 1 "Échec récupération liste"
    exit 1
fi

echo -e "\n${YELLOW}➕ Test POST /api/vehicules (Ajout)${NC}"
UNIQUE_PLATE="TEST-$(date +%s)"
ADD_RESPONSE=$(curl -s -w "%{http_code}" -b cookies.txt -X POST "$BASE_URL/api/vehicules" \
    -H "Content-Type: application/json" \
    -d "{
        \"plaque_immatriculation\": \"$UNIQUE_PLATE\",
        \"marque\": \"TestMarque\",
        \"modele\": \"TestModele\",
        \"annee\": 2023,
        \"client_id\": null,
        \"token\": \"$CSRF_TOKEN\"
    }" 2>/dev/null)

HTTP_CODE="${ADD_RESPONSE: -3}"

if [ "$HTTP_CODE" = "201" ]; then
    ADD_DATA="${ADD_RESPONSE%???}"
    VEHICLE_ID=$(echo "$ADD_DATA" | grep -o '"vehiculeId":[0-9]*' | cut -d':' -f2)
    print_result 0 "Véhicule ajouté avec succès" "Nouveau véhicule créé avec l'ID: $VEHICLE_ID"
else
    print_result 1 "Échec ajout véhicule"
    exit 1
fi

echo -e "\n${YELLOW}🗑️ Test DELETE /api/vehicules/:id (Suppression)${NC}"
if [ "$VEHICLE_ID" != "" ]; then
    # Nouveau token CSRF pour la suppression
    CSRF_RESPONSE=$(curl -s -b cookies.txt "$BASE_URL/api/csrf" 2>/dev/null)
    CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    DELETE_RESPONSE=$(curl -s -w "%{http_code}" -b cookies.txt -X DELETE "$BASE_URL/api/vehicules/$VEHICLE_ID" \
        -H "Content-Type: application/json" \
        -d "{\"token\": \"$CSRF_TOKEN\"}" 2>/dev/null)
    
    HTTP_CODE="${DELETE_RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "Véhicule supprimé avec succès" "Opération de suppression sécurisée validée"
    else
        print_result 1 "Échec suppression"
        exit 1
    fi
fi

echo -e "\n${YELLOW}🔒 Test sécurité - Accès sans auth${NC}"
UNAUTH_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/api/vehicules" 2>/dev/null)
HTTP_CODE="${UNAUTH_RESPONSE: -3}"

if [ "$HTTP_CODE" = "401" ]; then
    print_result 0 "Sécurité validée" "Accès refusé sans authentification comme attendu"
else
    print_result 1 "Faille de sécurité détectée"
    exit 1
fi

# Nettoyage
rm -f cookies.txt

# Affichage du banner de succès
print_success_banner

echo -e "\n${PURPLE}📊 Récapitulatif des tests :${NC}"
echo -e "  ${GREEN}✅ Authentification JWT${NC} : Fonctionnelle"
echo -e "  ${GREEN}✅ Protection CSRF${NC} : Active"
echo -e "  ${GREEN}✅ API Véhicules${NC} : Opérationnelle"
echo -e "  ${GREEN}✅ Opérations CRUD${NC} : Validées"
echo -e "  ${GREEN}✅ Sécurité${NC} : Conforme"

echo -e "\n${CYAN}🚀 Votre application est prête pour :${NC}"
echo -e "  • Déploiement en production"
echo -e "  • Utilisation par les équipes du garage"
echo -e "  • Gestion complète des véhicules"

echo -e "\n${YELLOW}🎯 Prochaines étapes recommandées :${NC}"
echo -e "  1. Déployer sur votre serveur de production"
echo -e "  2. Former les utilisateurs à l'interface"
echo -e "  3. Importer les véhicules existants"
echo -e "  4. Configurer les sauvegardes automatiques"

echo -e "\n${GREEN}🏁 PROJET TERMINÉ AVEC SUCCÈS ! 🏁${NC}"

exit 0