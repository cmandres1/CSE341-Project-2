const validator = require('../helpers/validate');

// Pet validation
const validatePet = (req, res, next) => {
  const validationRule = {
    name: 'required|string',
    age: 'required|numeric',
    breed: 'required|string',
    ownerName: 'required|string',
    appointmentDate: 'required|date',
    weight: 'required|numeric',
    medicalHistory: 'required|string',
    veterinarianId: 'required|string'
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      return res.status(412).send({
        success: false,
        message: 'Pet validation failed',
        data: err
      });
    }
    next();
  });
};

// Veterinarian validation
const validateVet = (req, res, next) => {
  const validationRule = {
    name: 'required|string',
    specialty: 'required|string',
    contactNumber: 'required|string',
    address: 'required|string'
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      return res.status(412).send({
        success: false,
        message: 'Veterinarian validation failed',
        data: err
      });
    }
    next();
  });
};

module.exports = {
  validatePet,
  validateVet
};