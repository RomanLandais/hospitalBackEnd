const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { validateSignUp } = require('../validators/validatorSignUp');
const { validateSignIn } = require('../validators/validatorsSignIn');
const { validateNewStay } = require('../validators/validatorNewStay');
const {
  generateCSRFTokenMiddleware,
  csrfProtection,
} = require('../Tokens/csrf');
const jwt = require('jsonwebtoken');

module.exports = (db) => {
  // Route pour recevoir les données du formulaire d'inscription
  router.post('/signup', validateSignUp, (req, res) => {
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
              "Erreur lors de l'insertion dans la base de données User :",
              err
            );
            res.status(500).json({
              error: "Erreur lors de l'insertion dans la base de données User",
            });
            return;
          }
          // Envoyer le cookie CSRF sécurisé dans la réponse
          res.status(200).json({
            token: jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', {
              expiresIn: '24h',
            }),
            message: 'Utilisateur enregistré avec succès',
          });
        }
      );
    });
  });

  // Route pour recevoir les données du formulaire de connexion
  router.post('/signIn', validateSignIn, (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM Users WHERE mail = ?', [email], (err, user) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
        res
          .status(500)
          .json({ error: "Erreur lors de la récupération de l'utilisateur" });
        return;
      }

      if (!user) {
        res.status(401).json({ error: 'Utilisateur non trouvé' });
        return;
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error(
            'Erreur lors de la comparaison des mots de passe :',
            err
          );
          res.status(500).json({
            error: 'Erreur lors de la comparaison des mots de passe',
          });
          return;
        }

        if (!isMatch) {
          res.status(401).json({ error: 'Mot de passe incorrect' });
          return;
        }

        res.status(200).json({
          token: jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', {
            expiresIn: '24h',
          }),
          message: 'Connexion réussie',
        });
      });
    });
  });

  // Route pour recevoir les données du formulaire création séjour
  router.post('/newStay', validateNewStay, csrfProtection, (req, res) => {
    const { startDate, endDate, reason, specialty, doctor } = req.body;

    db.run(
      'INSERT INTO Stay (stay_reason, doctor_specialty, start_date, end_date, doctor) VALUES (?, ?, ?, ?, ?)',
      [reason, specialty, startDate, endDate, doctor],
      (err) => {
        if (err) {
          console.error(
            "Erreur lors de l'insertion dans la base de données Stay :",
            err
          );
          res.status(500).json({
            error: "Erreur lors de l'insertion dans la base de données Stay",
          });
          return;
        }
        res.json({
          message: 'Séjour enregistré avec succès',
        });
      }
    );
  });

  return router;
};
