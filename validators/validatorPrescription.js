const Joi = require('joi');

const schema = Joi.object({
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().required(),
  idDoctor: Joi.number().required(),
  idUser: Joi.number().required(),
  idStay: Joi.number().required(),
  medicament: Joi.string().required(),
  posologie: Joi.string().required(),
  soigne: Joi.boolean().required(),
});

// Middleware pour valider les données du formulaire
const validatePrescription = (req, res, next) => {
  console.log('req.body', req.body);
  const { error, value } = schema.validate(req.body);

  if (error) {
    console.error('Erreur de validation des données :', error.message);
    return res.status(400).json({ error: error.message });
  }

  next();
};

module.exports = { validatePrescription };
