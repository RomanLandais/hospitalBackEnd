const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateSignUp } = require('../validators/validatorSignUp');
const { validateSignIn } = require('../validators/validatorsSignIn');
const { validateNewStay } = require('../validators/validatorNewStay');
const { generateToken } = require('../Tokens/csrf');
const { verifyToken } = require('../Tokens/csrf');
const {
  getLastStaysQuery,
  getCurrentStaysQuery,
  getComingStaysQuery,
  getDoctorsQuery,
  getUsersQuery,
  getStayQuery,
  getEntryQuery,
  getExitQuery,
  getUserInfoQuery,
} = require('../sqlQueries/sqlCode');
const { validateNewDoctor } = require('../validators/validatorNewDoctor');
const { validateNewSchedule } = require('../validators/validatorNewSchedule');
const { validateAvis } = require('../validators/validatorAvis');
const { validatePrescription } = require('../validators/validatorPrescription');
const {
  upgradeScheduleQuery,
  upgradeStayQuery,
  updadeConsultationQuery,
  upgradeStayIdDoctorQuery,
} = require('../sqlQueries/sqlUpdateBDD');

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
  Route pour recevoir les données du formulaire de connexion Web
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

        // Récupérer l'userId de l'utilisateur, s'il est Admin ou secrétaire
        const userId = user.id_user;
        const isAdmin = user.admin;
        const isSecretary = user.secretary;

        // Générer un token JWT
        const token = generateToken({ email, userId });

        res.status(200).json({
          token,
          userId,
          isAdmin,
          isSecretary,
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
      'INSERT INTO Stay (stay_reason, doctor_specialty, start_date, end_date, id_doctor, id_user) VALUES (?, ?, ?, ?, ?, ?)',
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

    // Lancer la mise à jour de la table Stay en arrière-plan
    db.run(upgradeStayQuery(), (err) => {
      if (err) {
        console.error(
          'Erreur lors de la mise à jour dans la base de données Stay :',
          err
        );
      } else {
        console.log('Séjour mis à jour avec succès');
      }
    });
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Route pour renvoyer les données des séjours
  -------------------------------------------------------------------------------------------------------------------------------- */
  //Séjours précédents
  router.get('/lastStays', verifyToken, (req, res) => {
    const userId = req.headers['x-user-id'];

    const query = getLastStaysQuery(userId);

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(
          'Erreur lors de la récupération des séjours lastStay :',
          err
        );
        return res
          .status(500)
          .json({ error: 'Erreur lors de la récupération des séjours' });
      }

      res.status(200).json({ lastStays: rows });
    });
  });

  //Séjours actuels
  router.get('/currentStays', verifyToken, (req, res) => {
    const userId = req.headers['x-user-id'];

    const query = getCurrentStaysQuery(userId);

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(
          'Erreur lors de la récupération des séjours CurrentStays :',
          err
        );
        return res
          .status(500)
          .json({ error: 'Erreur lors de la récupération des séjours' });
      }

      res.status(200).json({ currentStays: rows });
    });
  });

  //séjour à venir
  router.get('/comingStays', verifyToken, (req, res) => {
    const userId = req.headers['x-user-id'];

    const query = getComingStaysQuery(userId);

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(
          'Erreur lors de la récupération des séjours ComingStays :',
          err
        );
        return res
          .status(500)
          .json({ error: 'Erreur lors de la récupération des séjours' });
      }
      res.status(200).json({ comingStays: rows });
    });
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Route pour charger les données doctors
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.get('/loadDoctors', verifyToken, (req, res) => {
    const query = getDoctorsQuery();

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(
          'Erreur lors de la récupération des données docteur :',
          err
        );
        return res
          .status(500)
          .json({ error: 'Erreur lors de la récupération données docteur' });
      }

      res.status(200).json({ doctors: rows });
    });
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Route pour charger les données users (id, nom et prénom)
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.get('/loadUsers', verifyToken, (req, res) => {
    const query = getUsersQuery();

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des données user :', err);
        return res
          .status(500)
          .json({ error: 'Erreur lors de la récupération données user' });
      }

      res.status(200).json({ users: rows });
    });
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Route pour charger les données stay (id, date)
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.get('/loadStay', verifyToken, (req, res) => {
    const query = getStayQuery();

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des données stay :', err);
        return res
          .status(500)
          .json({ error: 'Erreur lors de la récupération données stay' });
      }

      res.status(200).json({ users: rows });
    });
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Route pour recevoir les données nouveau médecin
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.post('/newDoctor', validateNewDoctor, verifyToken, (req, res) => {
    const { firstName, lastName, specialty } = req.body;

    db.run(
      'INSERT INTO Doctors (last_name, name, specialty) VALUES (?, ?, ?)',
      [lastName, firstName, specialty],
      (insertErr) => {
        if (insertErr) {
          console.error(
            "Erreur lors de l'insertion dans la base de données Doctors :",
            insertErr
          );
          return res.status(500).json({
            error: "Erreur lors de l'insertion dans la base de données Doctors",
          });
        }

        res.status(200).json({ message: 'Docteur enregistré avec succès' });
      }
    );
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
    Route pour recevoir les données création plannning médecin
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.post('/newSchedule', validateNewSchedule, verifyToken, (req, res) => {
    const {
      consultDate,
      doctor,
      patient1,
      patient2,
      patient3,
      patient4,
      patient5,
    } = req.body;

    // Insérer le nouvel emploi du temps
    db.run(
      'INSERT INTO Schedule (date, id_doctor, id_patient1, id_patient2, id_patient3, id_patient4, id_patient5) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [consultDate, doctor, patient1, patient2, patient3, patient4, patient5],
      (insertErr) => {
        if (insertErr) {
          console.error(
            "Erreur lors de l'insertion dans la base de données Schedule :",
            insertErr
          );
          return res.status(500).json({
            error:
              "Erreur lors de l'insertion dans la base de données Schedule",
          });
        }

        // Répondre immédiatement à l'utilisateur
        res
          .status(200)
          .json({ message: 'Emploi du temps enregistré avec succès' });

        // Lancer la mise à jour de la table Schedule en arrière-plan
        db.run(upgradeScheduleQuery(), (err) => {
          if (err) {
            console.error(
              'Erreur lors de la mise à jour dans la base de données Schedule :',
              err
            );
          } else {
            console.log('Emploi du temps mis à jour avec succès');
          }
        });
      }
    );
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Mobil :
  Route pour recevoir les données du formulaire de connexion 
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.post('/signInMobil', validateSignIn, (req, res) => {
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

      if (!user.doctor) {
        return res.status(401).json({
          error: 'Accès refusé. Seuls les médecins peuvent se connecter.',
        });
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
 Mobil :
 Route pour recevoir les données du formulaire Avis 
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.post('/Avis', validateAvis, verifyToken, (req, res) => {
    const { date, description, idDoctor, idUser, idStay, titre } = req.body;

    db.run(
      'INSERT INTO Consultations (date, description, id_doctor, id_user, id_stay, title) VALUES (?, ?, ?, ?, ?, ?)',
      [date, description, idDoctor, idUser, idStay, titre],
      (insertErr) => {
        if (insertErr) {
          console.error(
            "Erreur lors de l'insertion dans la base de données Consultations :",
            insertErr
          );
          return res.status(500).json({
            error:
              "Erreur lors de l'insertion dans la base de données Consultations",
          });
        }

        res
          .status(200)
          .json({ message: 'Consultations enregistré avec succès' });
      }
    );

    // Lancer la mise à jour de la table Consultation en arrière-plan
    db.run(updadeConsultationQuery(), (err) => {
      if (err) {
        console.error(
          'Erreur lors de la mise à jour dans la base de données Consultation :',
          err
        );
      } else {
        console.log('Consultation mis à jour avec succès');
      }
    });

    // Lancer la mise à jour des ID la table Stay en arrière-plan
    db.run(upgradeStayIdDoctorQuery(), (err) => {
      if (err) {
        console.error(
          'Erreur lors de la mise à jour dans la base de données Stay :',
          err
        );
      } else {
        console.log('Stay mis à jour avec succès');
      }
    });

    // Lancer la mise à jour de la table Stay en arrière-plan
    db.run(upgradeStayQuery(), (err) => {
      if (err) {
        console.error(
          'Erreur lors de la mise à jour dans la base de données Stay :',
          err
        );
      } else {
        console.log('Stay mis à jour avec succès');
      }
    });
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
 Mobil :
 Route pour recevoir les données du formulaire Prescription 
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.post(
    '/Prescription',
    validatePrescription,
    verifyToken,
    (req, res) => {
      const {
        dateDebut,
        dateFin,
        idDoctor,
        idUser,
        idStay,
        medicament,
        posologie,
        soigne,
      } = req.body;

      db.run(
        'INSERT INTO Prescription (start_date, end_date, id_doctor, id_user, id_stay, medicament_name, posology, cured) VALUES (?, ?, ?, ?, ?, ?, ? , ?)',
        [
          dateDebut,
          dateFin,
          idDoctor,
          idUser,
          idStay,
          medicament,
          posologie,
          soigne,
        ],
        (insertErr) => {
          if (insertErr) {
            console.error(
              "Erreur lors de l'insertion dans la base de données Prescription :",
              insertErr
            );
            return res.status(500).json({
              error:
                "Erreur lors de l'insertion dans la base de données Prescription",
            });
          }

          res
            .status(200)
            .json({ message: 'Consultations enregistré avec succès' });
        }
      );
    }
  );

  /* --------------------------------------------------------------------------------------------------------------------------------
  Desktop :
  Route pour recevoir les données du formulaire de connexion 
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.post('/signInDesktop', validateSignIn, (req, res) => {
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

      if (!user.secretary) {
        return res.status(401).json({
          error: 'Accès refusé. Seuls les secrétaires peuvent se connecter.',
        });
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
  Desktop :
  Routes pour afficher les entrées et sorties du jour
  -------------------------------------------------------------------------------------------------------------------------------- */
  //personne entrante ce jour
  router.get('/entryStay', verifyToken, (req, res) => {
    const query = getEntryQuery();

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(
          'Erreur lors de la récupération des séjours entryStay :',
          err
        );
        return res.status(500).json({
          error: 'Erreur lors de la récupération des séjours entryStay',
        });
      }
      res.status(200).json({ entryStay: rows });
    });
  });

  //personne sortante ce jour
  router.get('/exitStay', verifyToken, (req, res) => {
    const query = getExitQuery();

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(
          'Erreur lors de la récupération des séjours exitStay :',
          err
        );
        return res.status(500).json({
          error: 'Erreur lors de la récupération des séjours exitStay',
        });
      }
      res.status(200).json({ exitStay: rows });
    });
  });

  /* --------------------------------------------------------------------------------------------------------------------------------
  Desktop :
  Routes pour afficher les infos utilisateurs
  -------------------------------------------------------------------------------------------------------------------------------- */
  router.get('/infoUser', verifyToken, (req, res) => {
    const userId = req.query.userId;
    const stayId = req.query.stayId;

    const query = getUserInfoQuery(userId, stayId);

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(
          'Erreur lors de la récupération des infos infoUser :',
          err
        );
        return res.status(500).json({
          error: 'Erreur lors de la récupération des infos infoUser',
        });
      }
      res.status(200).json({ infoUser: rows });
    });
  });

  return router;
};
