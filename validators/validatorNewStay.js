const Joi = require('joi');

const schema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  reason: Joi.string().required(),
  specialty: Joi.string().required(),
  doctor: Joi.string().required(),
});

// Middleware pour valider les données du formulaire
const validateNewStay = (req, res, next) => {
  const { error, value } = schema.validate(req.body);

  if (error) {
    console.error('Erreur de validation des données :', error.message);
    return res.status(400).json({ error: error.message });
  }

  next();
};

module.exports = { validateNewStay };
