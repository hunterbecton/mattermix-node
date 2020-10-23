const express = require('express');
const stripeController = require('../controllers/stripeController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.post(
  '/checkout-session',
  authController.protect,
  stripeController.getCheckoutSession
);

router.post(
  '/portal-session/:customer',
  authController.protect,
  stripeController.getCustomerPortal
);

router.get(
  '/customer',
  authController.protect,
  stripeController.getNewCustomerId
);

module.exports = router;
