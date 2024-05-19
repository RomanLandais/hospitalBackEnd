const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { validateForm } = require('../validators/validatorForm');
const {
  generateCSRFTokenMiddleware,
  csrfProtection,
} = require('../Tokens/csrf');

module.exports = (db) => {
  // Route pour recevoir les données du formulaire

  router.post(
    '/signup',
    validateForm,
    generateCSRFTokenMiddleware,
    (req, res) => {
      const { email, password, lastName, firstName, address } = req.body;

      //Hachage mdp
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
            // Envoyer le cookie CSRF sécurisé dans la réponse
            res.json({
              csrfToken: req.session.csrfToken,

              message: 'Utilisateur enregistré avec succès',
            });
          }
        );
      });
    }
  );

  return router;
};
