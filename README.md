ECF hospital Studi backEnd, construit avec node.js et angular ainsi que le framework express et l'utilitaire nodemon


Déploiement en local :
- cloner le dépot GitHub localement

- installer les dépendances nécessaires : npm install

- le fichier .env est normalement présent dans le clone GitHub, si non présent le créer et y insérer le code suivant pour communication sécurisée avec la base de donnée
SESSION_SECRET=7ab6cd366cf3e174c4b2d681d2067101a8acfde7be9b7a48791435509f69729d  
ACCESS_TOKEN_SECRET=f764ea2977769663ff6888e2904c7149e2ed40d5ac6a48f8c56410d479cb02d70ef329066328c90d07c157f1478a70c08d26b0cd6f785136f0d77456a7277370

- configurer la base de donnée à partir des fichiers du dépôt GitHub correspondant

- Pour un fonctionnement en mode développement, rentrer la commande suivante dans le terminal : nodemon server

- Déployer l’application, rentrer la commande suivante dans le terminal : npm start
