const Joi = require('joi');

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  lastName: Joi.string().required(),
  firstName: Joi.string().required(),
  address: Joi.string().required(),
});

// Middleware pour valider les données du formulaire
const validateForm = (req, res, next) => {
  const { error, value } = schema.validate(req.body);

  if (error) {
    console.error('Erreur de validation des données :', error.message);
    return res.status(400).json({ error: error.message });
  }

  next();
};

module.exports = { validateForm };
