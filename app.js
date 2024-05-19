const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./db');
const app = express();
require('dotenv').config();

app.use(cors()); // Pour permettre les requêtes Cross-Origin
app.use(express.json()); // Gestion requête JSON

// Configuration de la session pour stocker jeton CSRF sur cookie sécurisé
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
    },
  })
);

const hospitalRoutes = require('./routes/hospitalRoutes')(db); // Injection de dépendances

app.use('/api/hospital', hospitalRoutes);

module.exports = app;
