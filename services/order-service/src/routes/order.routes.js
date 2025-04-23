const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { auth, isCustomer, isRestaurantOwner } = require('../middleware/auth.middleware');
const {
  createOrderValidation,
  updateOrderStatusValidation,
  getOrdersValidation
} = require('../middleware/validation.middleware');

// Create a new order (customers only)
router.post(
  '/',
  auth,
  isCustomer,
  createOrderValidation,
  orderController.createOrder
);

// Get orders with filters
router.get(
  '/',
  auth,
  getOrdersValidation,
  orderController.getOrders
);

// Get order by ID
router.get(
  '/:id',
  auth,
  orderController.getOrderById
);

// Update order status (restaurant owners only)
router.put(
  '/:id/status',
  auth,
  isRestaurantOwner,
  updateOrderStatusValidation,
  orderController.updateOrderStatus
);

// Cancel order (both customers and restaurant owners)
router.post(
  '/:id/cancel',
  auth,
  orderController.cancelOrder
);

module.exports = router;
