const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { auth, isCustomer } = require('../middleware/auth.middleware');
const {
  createPaymentIntentValidation,
  confirmPaymentValidation,
  refundPaymentValidation
} = require('../middleware/validation.middleware');

// Create payment intent
router.post(
  '/create-intent',
  auth,
  isCustomer,
  createPaymentIntentValidation,
  paymentController.createPaymentIntent
);

// Confirm payment
router.post(
  '/confirm',
  auth,
  isCustomer,
  confirmPaymentValidation,
  paymentController.confirmPayment
);

// Get payment by ID
router.get(
  '/:id',
  auth,
  paymentController.getPaymentById
);

// Get payments with filters
router.get(
  '/',
  auth,
  paymentController.getPayments
);

// Refund payment
router.post(
  '/refund',
  auth,
  refundPaymentValidation,
  paymentController.refundPayment
);

module.exports = router;
