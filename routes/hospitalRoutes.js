const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Injection de dépendances
  // Exemple de route pour récupérer des données depuis la base de données
  router.get('/', (req, res) => {
    db.all('SELECT * FROM hospital', (err, rows) => {
      if (err) {
        console.error(
          "Erreur lors de l'exécution de la requête :",
          err.message
        );
        res
          .status(500)
          .json({ error: "Erreur lors de l'exécution de la requête" });
        return;
      }
      res.json(rows);
    });
  });

  return router;
};
