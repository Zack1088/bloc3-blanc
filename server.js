const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser')
const csrf = require("csrf");
const tokens = new csrf();
const secretTokenCSRF = 'OEKFNEZKkF78EZFH93';

const app = express();
const port = 3000;
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}
// Middleware

app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'garage_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});
const verifyTokenAndRole = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send('Access Denied: No Token Provided!');
    }
    const roles = req.requiredroles || ["admin", "client"]
    try {
      const decoded = jwt.verify(token, 'OEKFNEZKkF78EZFH93023NOEAF');
      req.user = decoded;
      const sql = 'SELECT role FROM users WHERE id = ?';
      db.query(sql, [req.user.id], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error');
        }

        if (results.length === 0) {
          return res.status(404).send('User not found');
        }

        const userRole = results[0].role;
        if (!roles.includes(userRole)) {
        return res.status(403).send('Access Denied: You do not have the required role!');
      }

      next();
    })
    } catch (error) {
      res.status(400).send('Invalid Token');
    }
  };

const verifyCSRFToken = (req, res, next) => {
  const token = req.body.token;
  // secretTokenCSRF à remplacer par process.env.CSRF_TOKEN si .env
  if (!token || !tokens.verify(secretTokenCSRF, token)) {
    return res.status(403).send("Invalid CSRF Token");
  }
  next();
};

// Routes

app.get("/api/csrf", function (req, res) {
  const token = tokens.create(secretTokenCSRF);
  res.status(200).send({
    status: 200,
    message: "CSRF récupéré",
    token: token,
  });
});

app.post('/api/signup', (req, res) => {
  const { lastname, firstname, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(hashedPassword)
  const sql = 'INSERT INTO users (lastname, firstname, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [lastname, firstname, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('User registered');
  });
});

app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      res.status(401).send('Invalid password');
      return;
    }

    const token = jwt.sign({ id: user.id }, 'OEKFNEZKkF78EZFH93023NOEAF', { expiresIn: 86400 });
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 }); // 86400000 ms = 24 heures

    res.status(200).send({ auth: true, role: user.role});
  });
});

app.get('/api/clients/count', (req,_res, next) => {
  req.requiredroles = ["admin"]
  next()
},  verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM users WHERE role = ?';
  db.query(sql, ['client'], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results[0]);
  });
});


app.get('/api/clients', (req, _res, next) => {
  console.log(req.cookies)
  req.requiredroles = ["admin"];
  console.table({
    request : req.requiredroles,
    token : req.cookies.token
  })
  next();
}, verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT * FROM users WHERE role = ?';
  db.query(sql, ['client'], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).json(results);
  });
});

// ========================================
// ROUTES VEHICULES - API ENDPOINTS
// ========================================

// 1. GET /api/vehicules - Lister tous les véhicules (Admin seulement)
app.get('/api/vehicules', (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const sql = `
    SELECT 
      v.id,
      v.plaque_immatriculation,
      v.marque,
      v.modele,
      v.annee,
      v.client_id,
      CONCAT(u.firstname, ' ', u.lastname) AS client_nom,
      u.email AS client_email,
      v.created_at,
      v.updated_at
    FROM vehicules v
    LEFT JOIN users u ON v.client_id = u.id
    ORDER BY v.id DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).json(results);
  });
});

// 2. GET /api/vehicules/count - Compter le nombre de véhicules (Admin seulement)
app.get('/api/vehicules/count', (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM vehicules';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).json(results[0]);
  });
});

// 3. GET /api/vehicules/:id - Obtenir un véhicule spécifique
app.get('/api/vehicules/:id', (req, _res, next) => {
  req.requiredroles = ["admin", "client"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const vehiculeId = req.params.id;
  
  const sql = `
    SELECT 
      v.id,
      v.plaque_immatriculation,
      v.marque,
      v.modele,
      v.annee,
      v.client_id,
      CONCAT(u.firstname, ' ', u.lastname) AS client_nom,
      u.email AS client_email,
      v.created_at,
      v.updated_at
    FROM vehicules v
    LEFT JOIN users u ON v.client_id = u.id
    WHERE v.id = ?
  `;
  
  db.query(sql, [vehiculeId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    
    if (results.length === 0) {
      res.status(404).send('Véhicule non trouvé');
      return;
    }
    
    res.status(200).json(results[0]);
  });
});

// 4. GET /api/vehicules/client/:clientId - Obtenir les véhicules d'un client spécifique
app.get('/api/vehicules/client/:clientId', (req, _res, next) => {
  req.requiredroles = ["admin", "client"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const clientId = req.params.clientId;
  
  const sql = `
    SELECT 
      v.id,
      v.plaque_immatriculation,
      v.marque,
      v.modele,
      v.annee,
      v.client_id,
      v.created_at,
      v.updated_at
    FROM vehicules v
    WHERE v.client_id = ?
    ORDER BY v.id DESC
  `;
  
  db.query(sql, [clientId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).json(results);
  });
});

// 5. POST /api/vehicules - Ajouter un nouveau véhicule (Admin seulement + CSRF)
app.post('/api/vehicules', verifyCSRFToken, (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const { plaque_immatriculation, marque, modele, annee, client_id } = req.body;
  
  // Validation des données
  if (!plaque_immatriculation || !marque || !modele) {
    res.status(400).send('Plaque d\'immatriculation, marque et modèle sont obligatoires');
    return;
  }
  
  // Vérifier si la plaque existe déjà
  const checkSql = 'SELECT id FROM vehicules WHERE plaque_immatriculation = ?';
  db.query(checkSql, [plaque_immatriculation], (err, existing) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    
    if (existing.length > 0) {
      res.status(409).send('Cette plaque d\'immatriculation existe déjà');
      return;
    }
    
    // Si client_id est fourni, vérifier qu'il existe
    if (client_id) {
      const clientCheckSql = 'SELECT id FROM users WHERE id = ? AND role = "client"';
      db.query(clientCheckSql, [client_id], (err, clientExists) => {
        if (err) {
          console.error(err);
          res.status(500).send('Server error');
          return;
        }
        
        if (clientExists.length === 0) {
          res.status(404).send('Client non trouvé');
          return;
        }
        
        // Insérer le véhicule
        insertVehicule();
      });
    } else {
      // Insérer le véhicule sans client
      insertVehicule();
    }
    
    function insertVehicule() {
      const sql = 'INSERT INTO vehicules (plaque_immatriculation, marque, modele, annee, client_id) VALUES (?, ?, ?, ?, ?)';
      const values = [plaque_immatriculation, marque, modele, annee || null, client_id || null];
      
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('Server error');
          return;
        }
        res.status(201).json({
          message: 'Véhicule ajouté avec succès',
          vehiculeId: result.insertId
        });
      });
    }
  });
});

// 6. PUT /api/vehicules/:id - Modifier un véhicule existant (Admin seulement + CSRF)
app.put('/api/vehicules/:id', verifyCSRFToken, (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const vehiculeId = req.params.id;
  const { plaque_immatriculation, marque, modele, annee, client_id } = req.body;
  
  // Validation des données
  if (!plaque_immatriculation || !marque || !modele) {
    res.status(400).send('Plaque d\'immatriculation, marque et modèle sont obligatoires');
    return;
  }
  
  // Vérifier si le véhicule existe
  const vehiculeCheckSql = 'SELECT id FROM vehicules WHERE id = ?';
  db.query(vehiculeCheckSql, [vehiculeId], (err, vehiculeExists) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    
    if (vehiculeExists.length === 0) {
      res.status(404).send('Véhicule non trouvé');
      return;
    }
    
    // Vérifier si la plaque existe déjà pour un autre véhicule
    const checkSql = 'SELECT id FROM vehicules WHERE plaque_immatriculation = ? AND id != ?';
    db.query(checkSql, [plaque_immatriculation, vehiculeId], (err, existing) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }
      
      if (existing.length > 0) {
        res.status(409).send('Cette plaque d\'immatriculation existe déjà');
        return;
      }
      
      // Si client_id est fourni, vérifier qu'il existe
      if (client_id) {
        const clientCheckSql = 'SELECT id FROM users WHERE id = ? AND role = "client"';
        db.query(clientCheckSql, [client_id], (err, clientExists) => {
          if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
          }
          
          if (clientExists.length === 0) {
            res.status(404).send('Client non trouvé');
            return;
          }
          
          // Mettre à jour le véhicule
          updateVehicule();
        });
      } else {
        // Mettre à jour le véhicule sans client
        updateVehicule();
      }
      
      function updateVehicule() {
        const sql = 'UPDATE vehicules SET plaque_immatriculation = ?, marque = ?, modele = ?, annee = ?, client_id = ? WHERE id = ?';
        const values = [plaque_immatriculation, marque, modele, annee || null, client_id || null, vehiculeId];
        
        db.query(sql, values, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
          }
          res.status(200).json({
            message: 'Véhicule modifié avec succès'
          });
        });
      }
    });
  });
});

// 7. DELETE /api/vehicules/:id - Supprimer un véhicule (Admin seulement + CSRF)
app.delete('/api/vehicules/:id', verifyCSRFToken, (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const vehiculeId = req.params.id;
  
  // Vérifier si le véhicule existe
  const checkSql = 'SELECT id FROM vehicules WHERE id = ?';
  db.query(checkSql, [vehiculeId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    
    if (results.length === 0) {
      res.status(404).send('Véhicule non trouvé');
      return;
    }
    
    // Supprimer le véhicule
    const deleteSql = 'DELETE FROM vehicules WHERE id = ?';
    db.query(deleteSql, [vehiculeId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }
      res.status(200).json({
        message: 'Véhicule supprimé avec succès'
      });
    });
  });
});

app.use(express.static(path.join(__dirname, "./client/dist")))
app.get("*", (_, res) => {
    res.sendFile(
      path.join(__dirname, "./client/dist/index.html")
    )
})
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = app;