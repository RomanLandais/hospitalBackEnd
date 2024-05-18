const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');

app.use(cors()); // Pour permettre les requêtes Cross-Origin
app.use(express.json()); // Gestion requête JSON

const hospitalRoutes = require('./routes/hospitalRoutes')(db); // Injection de dépendances

app.use('/api/hospital', hospitalRoutes);

module.exports = app;
