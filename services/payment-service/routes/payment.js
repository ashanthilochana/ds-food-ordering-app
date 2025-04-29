const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { processPayment, getPaymentHistory } = require('../controllers/paymentController');

// Apply auth middleware to all payment routes
router.use(verifyToken);

// Payment routes
router.post('/process', processPayment);
router.get('/history', getPaymentHistory);

module.exports = router; 