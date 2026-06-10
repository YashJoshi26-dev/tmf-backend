'use strict';

const Joi = require('joi');

/**
 * Per-row schema. Loose by design — we want to import what we CAN
 * and surface row-level errors for the rest, not abort the whole file.
 */
const rowSchema = Joi.object({
  sku:         Joi.string().required(),
  name:        Joi.string().min(2).required(),
  category:    Joi.string().required(),            // category NAME (we resolve to id at import time)
  subcategory: Joi.string().allow('').optional(),
  brand:       Joi.string().allow('').optional(),

  fabric:      Joi.string().allow('').optional(),
  color:       Joi.string().required(),
  occasion:    Joi.string().allow('').optional(),
  work_type:   Joi.string().allow('').optional(),

  price:       Joi.number().min(0).required(),
  mrp:         Joi.number().min(0).optional(),
  discount_pct:Joi.number().min(0).max(100).optional().default(0),
  stock:       Joi.number().integer().min(0).required(),

  size:        Joi.string().allow('').optional().default('Free Size'),

  // Flags
  bridal:      Joi.alternatives(Joi.boolean(), Joi.string().valid('true','false','1','0','yes','no')).optional(),
  trending:    Joi.alternatives(Joi.boolean(), Joi.string().valid('true','false','1','0','yes','no')).optional(),
  new:         Joi.alternatives(Joi.boolean(), Joi.string().valid('true','false','1','0','yes','no')).optional(),
  bestseller:  Joi.alternatives(Joi.boolean(), Joi.string().valid('true','false','1','0','yes','no')).optional(),

  images:      Joi.string().allow('').optional(),
  video_url:   Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional().default(''),

  weight_grams:Joi.number().optional(),
  active:      Joi.alternatives(Joi.boolean(), Joi.string()).optional().default(true),
}).unknown(true);

const toBool = (v) => {
  if (typeof v === 'boolean') return v;
  if (v == null) return false;
  return ['true', '1', 'yes', 'y'].includes(v.toString().toLowerCase().trim());
};

const validateRow = (row) => {
  const { value, error } = rowSchema.validate(row, { abortEarly: false, stripUnknown: false, convert: true });
  if (error) return { ok: false, errors: error.details.map((d) => d.message) };
  value.bridal     = toBool(value.bridal);
  value.trending   = toBool(value.trending);
  value.new        = toBool(value.new);
  value.bestseller = toBool(value.bestseller);
  value.active     = value.active === undefined ? true : toBool(value.active);
  return { ok: true, value };
};

module.exports = { validateRow };
