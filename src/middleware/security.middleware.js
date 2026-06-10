'use strict';

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

/** Apply all security hardening in one go. Order matters; install before body parsers (except helmet/cors). */
const applySecurity = (app) => {
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(xssClean());
  app.use(hpp({ whitelist: ['sort', 'brand', 'color', 'size', 'category'] }));
};

module.exports = { applySecurity };
