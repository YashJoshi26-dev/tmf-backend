'use strict';

const crypto = require('crypto');

/** Deterministic SKU when not given: BRAND-CAT-COLOR-SHORTHASH. */
const generateSKU = ({ brand = 'SR', category = 'CAT', color = 'X', name = '' }) => {
  const hash = crypto.createHash('md5').update(`${brand}|${category}|${color}|${name}`).digest('hex').slice(0, 6).toUpperCase();
  const cleanPart = (s) => (s || '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'X';
  return `${cleanPart(brand)}-${cleanPart(category)}-${cleanPart(color)}-${hash}`;
};

module.exports = { generateSKU };
