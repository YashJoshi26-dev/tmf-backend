'use strict';

class ApiError extends Error {
  constructor(statusCode, message, { isOperational = true, details = null, code = null } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(m = 'Bad Request', d)   { return new ApiError(400, m, { details: d }); }
  static unauthorized(m = 'Unauthorized')    { return new ApiError(401, m); }
  static forbidden(m = 'Forbidden')          { return new ApiError(403, m); }
  static notFound(m = 'Not Found')           { return new ApiError(404, m); }
  static conflict(m = 'Conflict')            { return new ApiError(409, m); }
  static unprocessable(m = 'Unprocessable', d) { return new ApiError(422, m, { details: d }); }
  static tooMany(m = 'Too Many Requests')    { return new ApiError(429, m); }
  static internal(m = 'Internal Server Error') { return new ApiError(500, m, { isOperational: false }); }
}

module.exports = ApiError;
