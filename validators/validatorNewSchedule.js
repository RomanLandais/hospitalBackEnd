const Joi = require('joi');

const schema = Joi.object({
  consultDate: Joi.date().required(),
  doctor: Joi.number().required(),
  patient1: Joi.number().required(),
  patient2: Joi.number().empty('').default(null),
  patient3: Joi.number().empty('').default(null),
  patient4: Joi.number().empty('').default(null),
  patient5: Joi.number().empty('').default(null),
});

// Middleware pour valider les données du formulaire
const validateNewSchedule = (req, res, next) => {
  const { error, value } = schema.validate(req.body);

  if (error) {
    console.error('Erreur de validation des données :', error.message);
    return res.status(400).json({ error: error.message });
  }

  next();
};

module.exports = { validateNewSchedule };
