'use strict';

/** Decrement stock for a (product, variant, size). Returns false if insufficient. */
const tryReserve = (product, { subProductId, style = 0, size, qty }) => {
  const sub = (subProductId && product.subProducts.id(subProductId)) || product.subProducts[style];
  if (!sub) return { ok: false, reason: 'variant_missing' };
  const sizeRow = sub.sizes.find((s) => s.size === size);
  if (!sizeRow) return { ok: false, reason: 'size_missing' };
  if (sizeRow.qty < qty) return { ok: false, reason: 'insufficient', available: sizeRow.qty };
  sizeRow.qty -= qty;
  sub.sold += qty;
  return { ok: true };
};

/** Inverse of tryReserve — used on order cancellation. */
const release = (product, { subProductId, style = 0, size, qty }) => {
  const sub = (subProductId && product.subProducts.id(subProductId)) || product.subProducts[style];
  if (!sub) return;
  const sizeRow = sub.sizes.find((s) => s.size === size);
  if (!sizeRow) return;
  sizeRow.qty += qty;
  sub.sold = Math.max(0, sub.sold - qty);
};

module.exports = { tryReserve, release };
