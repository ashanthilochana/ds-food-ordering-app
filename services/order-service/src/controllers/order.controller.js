const Order = require('../models/order.model');
const { validationResult } = require('express-validator');
const axios = require('axios');

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3001';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify restaurant and menu items with Restaurant Service
    try {
      const restaurantResponse = await axios.get(
        `${RESTAURANT_SERVICE_URL}/api/restaurants/${req.body.restaurant._id}`,
        { headers: { Authorization: req.header('Authorization') } }
      );
      
      // Add restaurant details to order
      req.body.restaurant.name = restaurantResponse.data.name;
    } catch (error) {
      return res.status(404).json({ message: 'Restaurant not found or not accessible' });
    }

    // Add customer details from authenticated user
    req.body.customer = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email
    };

    // Calculate total amount
    const totalAmount = req.body.items.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);

    const order = new Order({
      ...req.body,
      totalAmount
    });
    await order.save();

    // Notify restaurant about new order
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/new-order`, {
        orderId: order._id,
        restaurantId: order.restaurant._id,
        type: 'NEW_ORDER'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't fail the order creation if notification fails
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders with filters
exports.getOrders = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query = {};
    
    // Filter by user role
    if (req.user.role === 'customer') {
      query['customer._id'] = req.user._id;
    } else if (req.user.role === 'restaurant_admin') {
      query['restaurant._id'] = req.body.restaurantId;
    }

    // Apply status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Apply date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    if (req.user.role === 'restaurant_admin' && order.restaurant._id.toString() !== req.body.restaurantId) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'restaurant_admin' && order.restaurant._id.toString() !== req.body.restaurantId) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready_for_pickup'],
      ready_for_pickup: ['out_for_delivery'],
      out_for_delivery: ['delivered', 'cancelled']
    };

    if (!validTransitions[order.status]?.includes(req.body.status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${order.status} to ${req.body.status}` 
      });
    }

    // Update order
    order.status = req.body.status;
    if (req.body.status === 'cancelled') {
      order.cancellationReason = req.body.cancellationReason;
    }
    if (req.body.status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // Send notification
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/order-update`, {
        orderId: order._id,
        customerId: order.customer._id,
        restaurantId: order.restaurant._id,
        status: order.status,
        type: 'ORDER_STATUS_UPDATE'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancellation of pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Cannot cancel order in current status' 
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (req.user.role === 'restaurant_admin' && order.restaurant._id.toString() !== req.body.restaurantId) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by ' + req.user.role;
    await order.save();

    // Send notification
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/order-cancelled`, {
        orderId: order._id,
        customerId: order.customer._id,
        restaurantId: order.restaurant._id,
        reason: order.cancellationReason,
        type: 'ORDER_CANCELLED'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
