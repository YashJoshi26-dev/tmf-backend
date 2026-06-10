'use strict';

const slugify = require('slugify');

const generateSlug = (name, suffix = '') => {
  const base = slugify(name || '', { lower: true, strict: true });
  return suffix ? `${base}-${String(suffix).slice(-6)}` : base;
};

module.exports = { generateSlug };
