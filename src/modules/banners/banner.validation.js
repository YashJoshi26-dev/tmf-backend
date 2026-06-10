'use strict';

const Joi = require('joi');

exports.create = Joi.object({
  position: Joi.string().valid('hero', 'mid', 'category', 'footer').default('hero'),
  title:    Joi.string().allow('').optional(),
  subtitle: Joi.string().allow('').optional(),
  eyebrow:  Joi.string().allow('').optional(),
  cta:      Joi.string().allow('').optional(),
  link:     Joi.string().allow('').optional(),
  image:    Joi.string().uri().required(),
  mobileImage: Joi.string().uri().allow('').optional(),
  order: Joi.number().integer().optional(),
  startsAt: Joi.date().optional(),
  endsAt:   Joi.date().optional(),
  isActive: Joi.boolean().optional(),
});

exports.update = exports.create.fork(
  ['position', 'title', 'subtitle', 'eyebrow', 'cta', 'link', 'image', 'mobileImage', 'order', 'startsAt', 'endsAt', 'isActive'],
  (s) => s.optional()
);
