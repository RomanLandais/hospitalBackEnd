const Joi = require('joi');

const schema = Joi.object({
  date: Joi.date().required(),
  description: Joi.string().required(),
  idDoctor: Joi.number().required(),
  idUser: Joi.number().required(),
  idStay: Joi.number().required(),
  titre: Joi.string().required(),
});

// Middleware pour valider les données du formulaire
const validateAvis = (req, res, next) => {
  const { error, value } = schema.validate(req.body);

  if (error) {
    console.error('Erreur de validation des données :', error.message);
    return res.status(400).json({ error: error.message });
  }

  next();
};

module.exports = { validateAvis };
