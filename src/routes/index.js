'use strict';

const router = require('express').Router();

router.use('/auth',         require('../modules/auth/auth.routes'));
router.use('/users',        require('../modules/users/user.routes'));
router.use('/categories',   require('../modules/categories/category.routes'));
router.use('/products',     require('../modules/products/product.routes'));
router.use('/inventory',    require('../modules/inventory/inventory.routes'));
router.use('/cart',         require('../modules/cart/cart.routes'));
router.use('/wishlist',     require('../modules/wishlist/wishlist.routes'));
router.use('/orders',       require('../modules/orders/order.routes'));
router.use('/payments',     require('../modules/payments/payment.routes'));
router.use('/',             require('../modules/reviews/review.routes'));   // reviews routes self-prefix
router.use('/coupons',      require('../modules/coupons/coupon.routes'));
router.use('/banners',      require('../modules/banners/banner.routes'));
router.use('/analytics',    require('../modules/analytics/analytics.routes'));
router.use('/admin',        require('../modules/admin/admin.routes'));

router.get('/', (_req, res) => res.json({
  success: true,
  message: 'Saree Showroom API v1',
  modules: [
    'auth', 'users', 'categories', 'products', 'inventory',
    'cart', 'wishlist', 'orders', 'payments', 'reviews',
    'coupons', 'banners', 'analytics', 'admin',
  ],
}));

module.exports = router;
