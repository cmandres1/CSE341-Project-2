const Validator = require('validatorjs');

const validator = (body, rules, customMessages, callback) => {
  const validation = new Validator(body, rules, customMessages);
  
  // If validation passes, invoke callback with null (no errors) and true
  validation.passes(() => callback(null, true));

  // If validation fails, invoke callback with the error messages
  validation.fails(() => callback(validation.errors, false));
};

module.exports = validator;