'use strict';

/**
 * Compute the display price for a sub-product/size pair (applies sub-product's discount).
 */
const computePrice = (sizeRow, discountPct = 0) => {
  if (!sizeRow) return 0;
  const mrp = sizeRow.price;
  return Math.round(mrp - (mrp * (discountPct || 0)) / 100);
};

/** First-available display image for a product (used in cart/order snapshots). */
const primaryImage = (product, subProductId, style = 0) => {
  if (!product?.subProducts?.length) return '';
  const sub = (subProductId && product.subProducts.id?.(subProductId)) || product.subProducts[style] || product.subProducts[0];
  return sub?.images?.[0]?.url || '';
};

/** True if there is at least one in-stock size on any variant. */
const isInStock = (product) =>
  product.subProducts?.some((sp) => sp.sizes?.some((s) => s.qty > 0));

module.exports = { computePrice, primaryImage, isInStock };
