'use strict';

const Joi = require('joi');
const { objectId } = require('../../utils/validators');

exports.save = Joi.object({
  products: Joi.array().items(Joi.object({
    product: objectId.required(),
    size: Joi.string().required(),
    qty: Joi.number().integer().min(1).required(),
    style: Joi.number().min(0).optional(),
    productSubId: Joi.string().optional(),
  })).min(1).required(),
});
