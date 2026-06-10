'use strict';

const Joi = require('joi');

exports.create = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title:  Joi.string().max(120).optional(),
  text:   Joi.string().min(2).max(2000).required(),
  images: Joi.array().items(Joi.object({ public_id: Joi.string(), url: Joi.string().required() })).optional(),
});

exports.update = exports.create.fork(['rating', 'title', 'text', 'images'], (s) => s.optional());
