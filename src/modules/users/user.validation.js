'use strict';

const Joi = require('joi');

const address = Joi.object({
  fullName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  zipCode: Joi.string().required(),
  address1: Joi.string().required(),
  address2: Joi.string().allow('').optional(),
  country: Joi.string().default('India'),
  isDefault: Joi.boolean().optional(),
});

const updateAddress = address.fork(
  ['fullName', 'phoneNumber', 'state', 'city', 'zipCode', 'address1', 'country'],
  (s) => s.optional()
);

const updateProfile = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  image: Joi.string().uri().allow('').optional(),
});

module.exports = { address, updateAddress, updateProfile };
