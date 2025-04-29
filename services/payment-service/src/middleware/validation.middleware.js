const { body } = require('express-validator');

exports.createPaymentIntentValidation = [
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('paymentMethod')
    .isIn(['card', 'cash_on_delivery', 'paypal', 'google_pay', 'apple_pay'])
    .withMessage('Invalid payment method')
];

exports.confirmPaymentValidation = [
  body('paymentIntentId')
    .isString()
    .notEmpty()
    .withMessage('Payment intent ID is required'),
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID')
];

exports.refundPaymentValidation = [
  body('paymentId')
    .isMongoId()
    .withMessage('Invalid payment ID'),
  body('reason')
    .optional()
    .isString()
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be between 3 and 500 characters')
];

exports.partialRefundValidation = [
  body('paymentId')
    .isMongoId()
    .withMessage('Invalid payment ID'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('reason')
    .optional()
    .isString()
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be between 3 and 500 characters')
];
