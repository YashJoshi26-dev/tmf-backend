'use strict';

const Joi = require('joi');
const { objectId } = require('../../utils/validators');

exports.verifyRazorpay = Joi.object({
  orderId: objectId.required(),
  razorpay_order_id:   Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature:  Joi.string().required(),
});
