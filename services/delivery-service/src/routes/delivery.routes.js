const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { auth, isDeliveryPerson } = require('../middleware/auth.middleware');

// Create a new delivery
router.post('/',
  auth,
  [
    body('orderId').notEmpty(),
    body('pickupLocation').isObject(),
    body('deliveryLocation').isObject()
  ],
  deliveryController.createDelivery
);

// Get all deliveries for a delivery person
router.get('/my-deliveries',
  auth,
  isDeliveryPerson,
  deliveryController.getDeliveryPersonDeliveries
);

// Get available deliveries
router.get('/available',
  auth,
  isDeliveryPerson,
  deliveryController.getAvailableDeliveries
);

// Accept a delivery
router.post('/:id/accept',
  auth,
  isDeliveryPerson,
  [
    body('location').isObject()
  ],
  deliveryController.acceptDelivery
);

// Update delivery status
router.patch('/:id/status',
  auth,
  isDeliveryPerson,
  [
    body('status').isIn(['picked_up', 'in_transit', 'delivered', 'cancelled']),
    body('location').isObject()
  ],
  deliveryController.updateDeliveryStatus
);

// Get delivery by ID
router.get('/:id',
  auth,
  deliveryController.getDeliveryById
);

module.exports = router;
