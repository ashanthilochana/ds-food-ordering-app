const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { auth, isCustomer, isAdmin } = require('../middleware/auth.middleware');
const {
  createPaymentIntentValidation,
  confirmPaymentValidation,
  refundPaymentValidation,
  partialRefundValidation
} = require('../middleware/validation.middleware');

// Get Stripe publishable key
router.get(
  '/config',
  paymentController.getPublishableKey
);

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

// Full refund payment
router.post(
  '/refund',
  auth,
  isAdmin,
  refundPaymentValidation,
  paymentController.refundPayment
);

// Partial refund payment
router.post(
  '/partial-refund',
  auth,
  isAdmin,
  partialRefundValidation,
  paymentController.partialRefund
);

// Retry failed payment
router.post(
  '/:paymentId/retry',
  auth,
  isCustomer,
  paymentController.retryPayment
);

// Stripe webhook endpoint
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// Create checkout session
router.post(
  '/create-checkout-session',
  auth,
  isCustomer,
  paymentController.createCheckoutSession
);

// Get payment by session ID
router.get(
  '/session/:sessionId',
  paymentController.getPaymentBySessionId
);

module.exports = router;
