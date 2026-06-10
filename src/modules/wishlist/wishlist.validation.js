'use strict';

const Joi = require('joi');
const { objectId } = require('../../utils/validators');

exports.toggle = Joi.object({
  style: Joi.number().integer().min(0).optional(),
});

exports.productIdParam = Joi.object({ productId: objectId.required() });
