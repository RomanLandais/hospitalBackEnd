const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { validateForm } = require('../validators/validatorForm');

module.exports = (db) => {
  // Route pour recevoir les données du formulaire

  router.post('/signup', validateForm, (req, res) => {
    const { email, password, lastName, firstName, address } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
        res
          .status(500)
          .json({ error: 'Erreur lors du hachage du mot de passe' });
        return;
      }

      // Insérer les données et le mot de passe haché dans la base de données
      db.run(
        'INSERT INTO Users (mail, password, last_name, name, postal_adress) VALUES (?, ?, ?, ?, ?)',
        [email, hash, lastName, firstName, address],
        (err) => {
          if (err) {
            console.error(
              "Erreur lors de l'insertion dans la base de données :",
              err
            );
            res.status(500).json({
              error: "Erreur lors de l'insertion dans la base de données",
            });
            return;
          }
          res.json({ message: 'Utilisateur enregistré avec succès' });
        }
      );
    });
  });

  return router;
};
