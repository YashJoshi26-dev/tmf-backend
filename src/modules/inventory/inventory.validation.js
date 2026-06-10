'use strict';

const Joi = require('joi');

exports.bulkStock = Joi.object({
  updates: Joi.array().items(Joi.object({
    sku: Joi.string().required(),
    qty: Joi.number().integer().min(0).required(),
  })).min(1).required(),
});

exports.upload = Joi.object({
  sync: Joi.alternatives(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
});
