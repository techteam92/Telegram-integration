const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../response/error');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key',escapeHtml : true }, abortEarly: true,
 })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message.replace(/['"]/g, '')).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, { msg: errorMessage }));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
