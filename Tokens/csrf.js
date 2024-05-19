const crypto = require('crypto');
const app = require('../app');

function generateCSRFToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}

// Middleware pour générer et stocker le jeton CSRF dans la session utilisateur
function generateCSRFTokenMiddleware(req, res, next) {
  req.session.csrfToken = generateCSRFToken();
  console.log('CSRF token généré :', req.session.csrfToken);
  next();
}

// Middleware pour vérifier le jeton CSRF
function csrfProtection(req, res, next) {
  const tokenFromRequest =
    req.body.csrfToken || req.query.csrfToken || req.headers['csrf-token'];
  const tokenFromSession = req.session.csrfToken;
  console.log('Token CSRF de la requête :', tokenFromRequest);
  console.log('Token CSRF de la session :', tokenFromSession);

  if (!tokenFromRequest || tokenFromRequest !== tokenFromSession) {
    return res.status(403).json({ error: 'Token CSRF invalide' });
  }

  next();
}

module.exports = {
  generateCSRFToken,
  generateCSRFTokenMiddleware,
  csrfProtection,
};
