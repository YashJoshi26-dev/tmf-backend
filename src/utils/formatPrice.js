'use strict';

/** Format a number in Indian rupee notation. Pure server-side helper for email templates etc. */
const formatPrice = (n) => {
  if (n == null || isNaN(n)) return '\u20B90';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);
};

module.exports = { formatPrice };
