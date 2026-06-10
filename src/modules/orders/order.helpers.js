'use strict';

const FREE_SHIPPING_THRESHOLD = 2999;

const computeShipping = (subtotal) => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99);
const computeTax      = () => 0; // GST is included in price; placeholder for split-out tax

module.exports = { computeShipping, computeTax, FREE_SHIPPING_THRESHOLD };
