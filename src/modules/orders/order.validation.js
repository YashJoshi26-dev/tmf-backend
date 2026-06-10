'use strict';

const Joi = require('joi');

exports.create = Joi.object({
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    zipCode: Joi.string().required(),
    address1: Joi.string().required(),
    address2: Joi.string().allow('').optional(),
    country: Joi.string().required(),
  }).required(),
  paymentMethod: Joi.string().valid('razorpay', 'cod', 'stripe').required(),
  couponCode: Joi.string().optional(),
  taxPrice: Joi.number().min(0).default(0),
});

exports.updateStatus = Joi.object({
  status: Joi.string().valid('Not Processed', 'Processing', 'Dispatched', 'Cancelled', 'Completed').required(),
  note: Joi.string().allow('').optional(),
});
