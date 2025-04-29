const Order = require('../models/order.model');
const { validationResult } = require('express-validator');
const axios = require('axios');
const mongoose = require('mongoose'); 

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3001';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is authenticated and has customer role
    if (!req.user || req.user.role !== 'customer') {
      console.error('Role check failed in createOrder:', {
        userId: req.user?._id,
        role: req.user?.role,
        expectedRole: 'customer'
      });
      return res.status(403).json({ 
        message: 'Access denied. Only customers can place orders.',
        details: {
          expectedRole: 'customer',
          currentRole: req.user?.role
        }
      });
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
      console.error('Restaurant verification failed:', error.message);
      return res.status(404).json({ 
        message: 'Restaurant not found or not accessible',
        details: error.response?.data || error.message
      });
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
      totalAmount,
      status: 'pending',
      createdAt: new Date()
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

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        _id: order._id,
        status: order.status,
        totalAmount: order.totalAmount,
        restaurant: order.restaurant,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Error creating order',
      details: error.message
    });
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
    console.error('Error getting orders:', error);
    res.status(500).json({ 
      message: 'Error getting orders',
      details: error.message
    });
  }
};


exports.getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid Restaurant ID' });
    }

    // ✅ Authorization Check: Ensure restaurantId matches logged-in user's restaurantId
    if (req.user.role !== 'restaurant_admin' || req.user.restaurantId !== restaurantId) {
      return res.status(403).json({ 
        message: 'Access denied. You are not authorized for this restaurant.',
        details: {
          userRestaurantId: req.user.restaurantId,
          requestedRestaurantId: restaurantId
        }
      });
    }

    const orders = await Order.find({
      'restaurant._id': new mongoose.Types.ObjectId(restaurantId)
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    console.error('Error fetching restaurant orders:', {
      restaurantId,
      error: error.message
    });
    res.status(500).json({ 
      message: 'Failed to fetch restaurant orders',
      details: error.message
    });
  }
};



// At top, if not already

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Add this check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    if (req.user.role === 'restaurant_admin' && order.restaurant._id.toString() !== req.user.restaurantId) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ 
      message: 'Error getting order',
      details: error.message
    });
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
    if (req.user.role === 'restaurant_admin' && order.restaurant._id.toString() !== req.user.restaurantId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this order',
        details: {
          restaurantId: req.user.restaurantId,
          orderRestaurantId: order.restaurant._id
        }
      });
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
        message: `Invalid status transition from ${order.status} to ${req.body.status}`,
        details: {
          currentStatus: order.status,
          attemptedStatus: req.body.status,
          validTransitions: validTransitions[order.status]
        }
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

    res.json({
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      message: 'Error updating order status',
      details: error.message
    });
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
        message: 'Cannot cancel order in current status',
        details: {
          currentStatus: order.status,
          allowedStatuses: ['pending', 'confirmed']
        }
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id) {
      return res.status(403).json({ 
        message: 'Not authorized to cancel this order',
        details: {
          userId: req.user._id,
          orderCustomerId: order.customer._id
        }
      });
    }

    if (req.user.role === 'restaurant_admin' && order.restaurant._id.toString() !== req.user.restaurantId) {
      return res.status(403).json({ 
        message: 'Not authorized to cancel this order',
        details: {
          restaurantId: req.user.restaurantId,
          orderRestaurantId: order.restaurant._id
        }
      });
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

    res.json({
      message: 'Order cancelled successfully',
      order: {
        _id: order._id,
        status: order.status,
        cancellationReason: order.cancellationReason
      }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      message: 'Error cancelling order',
      details: error.message
    });
  }
};
