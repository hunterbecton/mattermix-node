const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Protected routes below
router.use(authController.protect);

// Admin routes
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(purchaseController.getAllPurchases)
  .post(purchaseController.createPurchase);

module.exports = router;
