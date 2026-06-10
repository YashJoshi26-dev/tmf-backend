'use strict';

const Joi = require('joi');
const { objectId } = require('../../utils/validators');

exports.create = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  image: Joi.string().uri().allow('').optional(),
  parent: objectId.allow(null).optional(),
  order: Joi.number().integer().min(0).optional(),
});

exports.update = exports.create.fork(['name', 'image', 'parent', 'order'], (s) => s.optional())
  .keys({ isActive: Joi.boolean().optional() });
