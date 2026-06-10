'use strict';

class ApiResponse {
  constructor(statusCode, data = null, message = 'Success', meta = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta && { meta: this.meta }),
    });
  }
  static ok(res, data, msg = 'Success', meta) { return new ApiResponse(200, data, msg, meta).send(res); }
  static created(res, data, msg = 'Created')  { return new ApiResponse(201, data, msg).send(res); }
  static noContent(res)                       { return res.status(204).send(); }
}

module.exports = ApiResponse;
