const jwt = require('jsonwebtoken');

// Middleware pour vérifier le jeton CSRF
function csrfProtection(req, res, next) {
  try {
    // Vérifier si l'en-tête Authorization existe
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      throw new Error('Authorization header missing or invalid');
    }

    // Extraire le token JWT de l'en-tête Authorization
    const token = req.headers.authorization.split(' ')[1];

    // Vérifier et décoder le token JWT
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

    // Récupérer l'identifiant d'utilisateur à partir du token décodé
    const userId = decodedToken.userId;

    // Stocker l'identifiant d'utilisateur dans req.auth pour une utilisation ultérieure dans les routes
    req.auth = {
      userId: userId,
    };

    // Passer à la prochaine étape du middleware
    next();
  } catch (error) {
    // Gérer les erreurs de vérification du token JWT
    console.error('CSRF token verification failed:', error);
    res.status(401).json({ error: 'Invalid CSRF token' });
  }
}

module.exports = {
  csrfProtection,
};
