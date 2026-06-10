'use strict';

const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[source], {
    abortEarly: false, stripUnknown: true, convert: true,
  });
  if (error) {
    const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
    return next(ApiError.unprocessable('Validation failed', details));
  }
  req[source] = value;
  next();
};

module.exports = validate;
