'use strict';

const Joi = require('joi');
const { objectId } = require('../../utils/validators');

const subProduct = Joi.object({
  sku: Joi.string().required(),
  images: Joi.array().items(Joi.object({ public_id: Joi.string(), url: Joi.string().required() })).min(1).required(),
  description_images: Joi.array().items(Joi.object({ public_id: Joi.string(), url: Joi.string() })).optional(),
  color: Joi.object({ color: Joi.string().required(), image: Joi.string().allow('').optional() }).required(),
  sizes: Joi.array().items(Joi.object({
    size: Joi.string().required(),
    qty:  Joi.number().min(0).required(),
    price:Joi.number().min(0).required(),
  })).min(1).required(),
  discount: Joi.number().min(0).max(100).default(0),
});

exports.create = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(5000).required(),
  brand: Joi.string().allow('').optional(),
  category: objectId.required(),
  subCategories: Joi.array().items(objectId).optional(),
  fabric: Joi.string().optional(),
  occasions: Joi.array().items(Joi.string()).optional(),
  workType: Joi.string().optional(),
  gender: Joi.string().valid('women', 'men', 'unisex', 'kids').default('women'),
  details: Joi.array().items(Joi.object({ name: Joi.string(), value: Joi.string() })).optional(),
  shipping: Joi.number().min(0).default(0),
  refundPolicy: Joi.string().optional(),
  subProducts: Joi.array().items(subProduct).min(1).required(),
  isBridal: Joi.boolean().optional(),
  isTrending: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
  isBestseller: Joi.boolean().optional(),
});

exports.update = exports.create.fork(
  Object.keys(exports.create.describe().keys),
  (s) => s.optional()
);
