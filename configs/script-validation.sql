-- Script de validation de la base de données
-- Gestion des véhicules - Garage

-- ======================================
-- 🗄️ VALIDATION STRUCTURE BASE DE DONNÉES
-- ======================================

USE garage_db;

-- Test 1: Vérifier l'existence de la table vehicules
SELECT 'Test 1: Existence table vehicules' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ PASS: Table vehicules existe'
        ELSE '❌ FAIL: Table vehicules manquante'
    END as result
FROM information_schema.tables 
WHERE table_schema = 'garage_db' AND table_name = 'vehicules';

-- Test 2: Vérifier la structure des colonnes
SELECT 'Test 2: Structure des colonnes' as test_name;
DESCRIBE vehicules;

-- Validation attendue des colonnes
SELECT 
    CASE 
        WHEN COUNT(*) = 7 THEN '✅ PASS: 7 colonnes présentes'
        ELSE CONCAT('❌ FAIL: ', COUNT(*), ' colonnes trouvées (7 attendues)')
    END as result
FROM information_schema.columns 
WHERE table_schema = 'garage_db' AND table_name = 'vehicules';

-- Test 3: Vérifier les contraintes de clé primaire
SELECT 'Test 3: Clé primaire' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) = 1 AND column_name = 'id' THEN '✅ PASS: Clé primaire sur id'
        ELSE '❌ FAIL: Clé primaire manquante ou incorrecte'
    END as result
FROM information_schema.key_column_usage 
WHERE table_schema = 'garage_db' 
AND table_name = 'vehicules' 
AND constraint_name = 'PRIMARY';

-- Test 4: Vérifier la contrainte UNIQUE sur plaque_immatriculation
SELECT 'Test 4: Contrainte UNIQUE plaque' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ PASS: Contrainte UNIQUE sur plaque_immatriculation'
        ELSE '❌ FAIL: Contrainte UNIQUE manquante'
    END as result
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'garage_db' 
AND tc.table_name = 'vehicules'
AND tc.constraint_type = 'UNIQUE'
AND kcu.column_name = 'plaque_immatriculation';

-- Test 5: Vérifier la clé étrangère vers users
SELECT 'Test 5: Clé étrangère vers users' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ PASS: Clé étrangère client_id -> users(id)'
        ELSE '❌ FAIL: Clé étrangère manquante'
    END as result
FROM information_schema.key_column_usage 
WHERE table_schema = 'garage_db' 
AND table_name = 'vehicules' 
AND column_name = 'client_id'
AND referenced_table_name = 'users'
AND referenced_column_name = 'id';

-- Test 6: Vérifier les index
SELECT 'Test 6: Index de performance' as test_name;
SELECT 
    CONCAT('📊 INFO: ', COUNT(*), ' index trouvés') as result
FROM information_schema.statistics 
WHERE table_schema = 'garage_db' AND table_name = 'vehicules';

-- Détail des index
SELECT 
    index_name,
    column_name,
    CASE WHEN non_unique = 0 THEN 'UNIQUE' ELSE 'INDEX' END as index_type
FROM information_schema.statistics 
WHERE table_schema = 'garage_db' AND table_name = 'vehicules'
ORDER BY index_name, seq_in_index;

-- ======================================
-- 📊 VALIDATION DONNÉES DE TEST
-- ======================================

-- Test 7: Nombre de véhicules
SELECT 'Test 7: Données de test' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) >= 7 THEN CONCAT('✅ PASS: ', COUNT(*), ' véhicules présents')
        ELSE CONCAT('❌ FAIL: ', COUNT(*), ' véhicules (7 minimum attendus)')
    END as result
FROM vehicules;

-- Test 8: Véhicules avec clients associés
SELECT 'Test 8: Associations client' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) >= 2 THEN CONCAT('✅ PASS: ', COUNT(*), ' véhicules avec clients')
        ELSE CONCAT('❌ FAIL: ', COUNT(*), ' véhicules avec clients (2 minimum attendus)')
    END as result
FROM vehicules 
WHERE client_id IS NOT NULL;

-- Test 9: Véhicules sans clients
SELECT 'Test 9: Véhicules du garage' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) >= 5 THEN CONCAT('✅ PASS: ', COUNT(*), ' véhicules sans client associé')
        ELSE CONCAT('❌ FAIL: ', COUNT(*), ' véhicules sans client (5 minimum attendus)')
    END as result
FROM vehicules 
WHERE client_id IS NULL;

-- Test 10: Intégrité référentielle
SELECT 'Test 10: Intégrité référentielle' as test_name;
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS: Toutes les références client sont valides'
        ELSE CONCAT('❌ FAIL: ', COUNT(*), ' références client invalides')
    END as result
FROM vehicules v
LEFT JOIN users u ON v.client_id = u.id
WHERE v.client_id IS NOT NULL AND u.id IS NULL;

-- ======================================
-- 📋 RÉSUMÉ DES DONNÉES
-- ======================================

SELECT 'RÉSUMÉ DES DONNÉES' as section;

-- Statistiques générales
SELECT 
    COUNT(*) as total_vehicules,
    COUNT(client_id) as vehicules_avec_client,
    COUNT(*) - COUNT(client_id) as vehicules_sans_client
FROM vehicules;

-- Répartition par marque
SELECT 
    marque,
    COUNT(*) as nombre_vehicules
FROM vehicules 
GROUP BY marque 
ORDER BY nombre_vehicules DESC;

-- Véhicules par client
SELECT 
    CONCAT(u.firstname, ' ', u.lastname) as client,
    u.email,
    COUNT(v.id) as nombre_vehicules
FROM users u
LEFT JOIN vehicules v ON u.id = v.client_id
WHERE u.role = 'client'
GROUP BY u.id, u.firstname, u.lastname, u.email
ORDER BY nombre_vehicules DESC;

-- Véhicules les plus récents (par date d'ajout)
SELECT 
    plaque_immatriculation,
    marque,
    modele,
    annee,
    CASE 
        WHEN client_id IS NOT NULL THEN 'Associé'
        ELSE 'Non associé'
    END as statut_client,
    created_at
FROM vehicules 
ORDER BY created_at DESC 
LIMIT 5;

-- ======================================
-- 🔍 TESTS DE CONTRAINTES
-- ======================================

SELECT 'TESTS DE CONTRAINTES' as section;

-- Test de contrainte unique (doit échouer)
SELECT 'Test contrainte UNIQUE (doit échouer)' as test_constraint;
-- Uncomment pour tester:
-- INSERT INTO vehicules (plaque_immatriculation, marque, modele) 
-- VALUES ('AB-123-CD', 'Test', 'Test');

-- Test de contrainte FK (doit échouer avec client inexistant)
SELECT 'Test contrainte FK (doit échouer)' as test_constraint;
-- Uncomment pour tester:
-- INSERT INTO vehicules (plaque_immatriculation, marque, modele, client_id) 
-- VALUES ('TEST-FK', 'Test', 'Test', 999);

-- ======================================
-- ✅ VALIDATION FINALE
-- ======================================

SELECT 'VALIDATION FINALE' as section;

SELECT 
    CASE 
        WHEN (
            (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'garage_db' AND table_name = 'vehicules') = 1
            AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'garage_db' AND table_name = 'vehicules') = 7
            AND (SELECT COUNT(*) FROM vehicules) >= 7
            AND (SELECT COUNT(*) FROM vehicules WHERE client_id IS NOT NULL) >= 2
        ) THEN '🎉 ✅ TOUTES LES VALIDATIONS RÉUSSIES - Base de données prête !'
        ELSE '⚠️ ❌ CERTAINES VALIDATIONS ONT ÉCHOUÉ - Vérifiez les résultats ci-dessus'
    END as validation_finale;