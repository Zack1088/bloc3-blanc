CREATE DATABASE IF NOT EXISTS  garage_db;

USE garage_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lastname VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'client') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (lastname, firstname, email, password, role) VALUES ('VroumVroum', 'Garagiste', 'garagiste@vroumvroum.fr', '$2a$08$K1WDAEAfMUsXmYGQJffEXuA47ZBqAQdxglvZW2MPFvpY/zbAvwqZO', 'admin');
INSERT INTO users (lastname, firstname, email, password, role) VALUES ('Elric', 'Edward', 'edward.elric@alchem.fma', '$2a$08$K1WDAEAfMUsXmYGQJffEXuA47ZBqAQdxglvZW2MPFvpY/zbAvwqZO', 'client'); 

-- Création de la table vehicules
CREATE TABLE IF NOT EXISTS vehicules (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    plaque_immatriculation VARCHAR(20) NOT NULL UNIQUE,
    marque VARCHAR(50) NOT NULL,
    modele VARCHAR(50) NOT NULL,
    annee INT(11),
    client_id INT(11) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Clé étrangère vers la table users
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Index pour optimiser les recherches
    INDEX idx_client_id (client_id),
    INDEX idx_plaque (plaque_immatriculation),
    INDEX idx_marque_modele (marque, modele)
);

-- Insertion de données de test
INSERT INTO vehicules (plaque_immatriculation, marque, modele, annee, client_id) VALUES 
-- Véhicules associés au client Edward Elric (id = 2)
('AB-123-CD', 'Peugeot', '308', 2019, 2),
('EF-456-GH', 'Renault', 'Clio', 2020, 2),

-- Véhicules non associés à un client (véhicules du garage)
('IJ-789-KL', 'Toyota', 'Corolla', 2018, NULL),
('MN-012-OP', 'BMW', 'Serie 3', 2021, NULL),
('QR-345-ST', 'Mercedes', 'Classe A', 2022, NULL),
('UV-678-WX', 'Volkswagen', 'Golf', 2019, NULL),
('YZ-901-AB', 'Ford', 'Focus', 2020, NULL);

-- Vérification des données insérées
SELECT 
    v.id,
    v.plaque_immatriculation,
    v.marque,
    v.modele,
    v.annee,
    CONCAT(u.firstname, ' ', u.lastname) AS client_nom,
    v.created_at
FROM vehicules v
LEFT JOIN users u ON v.client_id = u.id
ORDER BY v.id;