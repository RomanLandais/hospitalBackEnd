const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateSignUp } = require('../validators/validatorSignUp');
const { validateSignIn } = require('../validators/validatorsSignIn');
const { validateNewStay } = require('../validators/validatorNewStay');
const { generateToken } = require('../Tokens/csrf');
const { verifyToken } = require('../Tokens/csrf');
const { getLastStaysQuery } = require('../sqlQueries/sqlCode');

module.exports = (db) => {
  /* --------------------------------------------------------------------------------------------------------------------------------
  Route pour recevoir les données du formulaire d'inscription
  -------------------------------------------------------------------------------------------------------------------------------- */

  router.post('/signUp', validateSignUp, (req, res) => {
    const { email, password, lastName, firstName, address } = req.body;

    // Hachage mdp
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
        return res
          .status(500)
          .json({ error: 'Erreur lors du hachage du mot de passe' });
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
            return res.status(500).json({
              error: "Erreur lors de l'insertion dans la base de données User",
            });
          }

          // Récupérer l'userId nouvellement créé
          const userId = this.lastID;
          console.log('userId :', userId);

          // Générer un token JWT
          const token = generateToken({ email, userId });

          res.status(200).json({
            token,
            userId,
            message: 'Utilisateur enregistré avec succès',
          });
        }
      );
    });
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Route pour recevoir les données du formulaire de connexion
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.post('/signIn', validateSignIn, (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM Users WHERE mail = ?', [email], (err, user) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
        return res
          .status(500)
          .json({ error: "Erreur lors de la récupération de l'utilisateur" });
      }

      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error(
            'Erreur lors de la comparaison des mots de passe :',
            err
          );
          return res.status(500).json({
            error: 'Erreur lors de la comparaison des mots de passe',
          });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        // Récupérer l'userId de l'utilisateur
        const userId = user.id_user;

        // Générer un token JWT
        const token = generateToken({ email, userId });

        res.status(200).json({
          token,
          userId,
          message: 'Connexion réussie',
        });
      });
    });
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Route pour recevoir les données du formulaire de création de séjour
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.post('/newStay', validateNewStay, verifyToken, (req, res) => {
    const { startDate, endDate, reason, specialty, doctor } = req.body;
    const userId = req.headers['x-user-id'];

    db.run(
      'INSERT INTO Stay (stay_reason, doctor_specialty, start_date, end_date, doctor_name, id_user) VALUES (?, ?, ?, ?, ?, ?)',
      [reason, specialty, startDate, endDate, doctor, userId],
      (insertErr) => {
        if (insertErr) {
          console.error(
            "Erreur lors de l'insertion dans la base de données Stay :",
            insertErr
          );
          return res.status(500).json({
            error: "Erreur lors de l'insertion dans la base de données Stay",
          });
        }

        res.status(200).json({ message: 'Séjour enregistré avec succès' });
      }
    );
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Route pour renvoyer les données des séjours
  -------------------------------------------------------------------------------------------------------------------------------- */

  router.get('/lastStays', verifyToken, (req, res) => {
    const userId = req.headers['x-user-id'];
    console.log('userId received :', userId);

    const query = getLastStaysQuery(userId);

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des séjours :', err);
        return res
          .status(500)
          .json({ error: 'Erreur lors de la récupération des séjours' });
      }

      res.status(200).json({ lastStays: rows });
    });
  });

  return router;
};
