'use strict';

const Joi = require('joi');

exports.create = Joi.object({
  coupon:   Joi.string().min(4).max(20).required(),
  discount: Joi.number().min(1).max(100).required(),
  startDate:Joi.date().required(),
  endDate:  Joi.date().greater(Joi.ref('startDate')).required(),
  usageLimit: Joi.number().min(1).allow(null).optional(),
  minOrderValue: Joi.number().min(0).optional(),
});

exports.update = exports.create
  .fork(['coupon', 'discount', 'startDate', 'endDate', 'usageLimit', 'minOrderValue'], (s) => s.optional())
  .keys({ isActive: Joi.boolean().optional() });

exports.apply = Joi.object({ coupon: Joi.string().required() });
