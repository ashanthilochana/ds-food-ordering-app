const { body } = require('express-validator');

exports.createPaymentIntentValidation = [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('paymentMethod')
    .isIn(['card', 'cash_on_delivery'])
    .withMessage('Payment method must be either card or cash_on_delivery'),
  body('currency')
    .optional()
    .isIn(['usd'])
    .withMessage('Currency must be USD')
];

exports.confirmPaymentValidation = [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required')
];

exports.refundPaymentValidation = [
  body('paymentId').isMongoId().withMessage('Valid payment ID is required'),
  body('reason').notEmpty().withMessage('Refund reason is required')
];
