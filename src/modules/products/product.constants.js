'use strict';

module.exports = {
  FABRICS:   ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Banarasi Silk', 'Kanjivaram Silk', 'Linen', 'Crepe', 'Net', 'Velvet', 'Organza'],
  OCCASIONS: ['Bridal', 'Festive', 'Party', 'Casual', 'Office', 'Reception', 'Sangeet'],
  WORK_TYPES:['Zari', 'Embroidery', 'Sequin', 'Stone', 'Mirror', 'Block Print', 'Hand Painted', 'Plain'],
  SORT_OPTIONS: ['newest', 'price-asc', 'price-desc', 'rating', 'popular'],

  CACHE_TTL: {
    PRODUCT_DETAIL: 5 * 60,   // 5 minutes
    LIST:           60,       // 1 minute
    CATEGORY_TREE:  10 * 60,
  },
};
