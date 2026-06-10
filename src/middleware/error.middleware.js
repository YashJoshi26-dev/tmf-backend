'use strict';

const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

const notFoundHandler = (req, _res, next) =>
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = err;

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((e) => ({ field: e.path, message: e.message }));
    error = ApiError.unprocessable('Validation failed', details);
  } else if (error instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    error = ApiError.conflict(`Duplicate value for ${field}`);
  } else if (error.name === 'JsonWebTokenError')  error = ApiError.unauthorized('Invalid token');
    else if (error.name === 'TokenExpiredError')  error = ApiError.unauthorized('Token expired');
    else if (error.name === 'MulterError')        error = ApiError.badRequest(`Upload error: ${error.message}`);

  if (!(error instanceof ApiError)) {
    error = new ApiError(error.statusCode || 500, error.message || 'Internal Server Error', { isOperational: false });
  }

  const meta = { method: req.method, url: req.originalUrl, statusCode: error.statusCode, userId: req.user?._id?.toString(), ip: req.ip };
  if (error.statusCode >= 500 || !error.isOperational) logger.error(error.message, { ...meta, stack: error.stack });
  else logger.warn(error.message, meta);

  const body = {
    success: false,
    message: error.statusCode >= 500 && env.isProd ? 'Internal Server Error' : error.message,
  };
  if (error.details) body.details = error.details;
  if (error.code)    body.code = error.code;
  if (!env.isProd && error.statusCode >= 500) body.stack = error.stack;

  res.status(error.statusCode).json(body);
};

module.exports = { errorHandler, notFoundHandler };
