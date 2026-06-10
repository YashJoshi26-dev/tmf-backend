'use strict';

const Category = require('../../categories/category.model');
const { parseImageList } = require('./imageMapper.service');
const { generateSlug } = require('../helpers/generateSlug');

/**
 * Convert a flat row (one SKU = one variant/size combo) into a Product upsert op.
 *
 * Strategy: each CSV row represents one (product, variant, size).
 * - We match by SKU on the variant; one product can have many SKUs.
 * - For simplicity here we treat ONE row = ONE product with ONE variant + ONE size.
 *   Real-world: group by `name`+`brand`+`color` to merge sizes — see comment below.
 *
 * Returns an upsert op for Product.
 */
const buildProductOpFromRow = async (row, { categoryCache }) => {
  // Resolve category (case-insensitive name lookup with cache)
  let category = categoryCache.get(row.category?.toLowerCase());
  if (!category) {
    category = await Category.findOne({ name: new RegExp(`^${row.category}$`, 'i') });
    if (!category) category = await Category.create({ name: row.category, parent: null });
    categoryCache.set(row.category.toLowerCase(), category);
  }

  let subCategoryIds = [];
  if (row.subcategory) {
    const subKey = `${row.category}::${row.subcategory}`.toLowerCase();
    let sub = categoryCache.get(subKey);
    if (!sub) {
      sub = await Category.findOne({ name: new RegExp(`^${row.subcategory}$`, 'i'), parent: category._id });
      if (!sub) sub = await Category.create({ name: row.subcategory, parent: category._id });
      categoryCache.set(subKey, sub);
    }
    subCategoryIds.push(sub._id);
  }

  const sizeRow = { size: row.size || 'Free Size', qty: row.stock, price: row.mrp || row.price };
  const discountPct = row.discount_pct || (row.mrp && row.mrp > row.price
    ? Math.round(((row.mrp - row.price) / row.mrp) * 100)
    : 0);

  const subProduct = {
    sku: row.sku,
    color: { color: row.color },
    images: parseImageList(row.images),
    sizes: [sizeRow],
    discount: discountPct,
  };

  const occasions = row.occasion ? row.occasion.split(/[|;,]/).map((o) => o.trim()).filter(Boolean) : [];

  // Upsert by SKU on a sub-product. If a product with this SKU exists, we update sizes/stock.
  // Else create a new product with this one sub-product.
  const updateOp = {
    $set: {
      name: row.name,
      description: row.description || row.name,
      brand: row.brand || '',
      category: category._id,
      ...(subCategoryIds.length && { subCategories: subCategoryIds }),
      fabric: row.fabric || '',
      occasions,
      workType: row.work_type || '',
      isBridal: !!row.bridal,
      isTrending: !!row.trending,
      isNewArrival: !!row.new,
      isBestseller: !!row.bestseller,
      isActive: row.active !== false,
      source: 'csv',
      lastSyncedAt: new Date(),
    },
  };

  return {
    sku: row.sku,
    updateOp,
    subProduct,
    slug: generateSlug(row.name),
  };
};

module.exports = { buildProductOpFromRow };
