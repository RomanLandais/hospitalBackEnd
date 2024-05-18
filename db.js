const sqlite3 = require('sqlite3').verbose();

const dbPath = '../BDD/BDD_hopital_ECF.4';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(
      'Erreur lors de la connexion à la base de données :',
      err.message
    );
  } else {
    console.log('Connexion à la base de données SQLite réussie');
  }
});

module.exports = db;
