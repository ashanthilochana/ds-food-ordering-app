const { validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment.model');
const axios = require('axios');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

// Create a payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, paymentMethod } = req.body;

    // Get order details from Order Service
    const orderResponse = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${orderId}`, {
      headers: { Authorization: req.header('Authorization') }
    });
    const order = orderResponse.data;

    // Verify order belongs to the current user
    if (order.customer._id.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Create payment record
    const payment = new Payment({
      order: {
        _id: order._id,
        amount: order.totalAmount
      },
      customer: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      restaurant: {
        _id: order.restaurant._id,
        name: order.restaurant.name
      },
      amount: order.totalAmount,
      paymentMethod
    });

    if (paymentMethod === 'card') {
      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          customerId: req.user._id.toString()
        }
      });

      payment.paymentIntentId = paymentIntent.id;
      payment.status = 'processing';

      await payment.save();

      res.json({
        paymentId: payment._id,
        clientSecret: paymentIntent.client_secret
      });
    } else if (paymentMethod === 'cash_on_delivery') {
      payment.status = 'pending';
      await payment.save();

      // Update order payment status
      await axios.patch(
        `${ORDER_SERVICE_URL}/api/orders/${orderId}/payment-status`,
        { status: 'pending' },
        { headers: { Authorization: req.header('Authorization') } }
      );

      res.json({ paymentId: payment._id });
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Confirm card payment
exports.confirmPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentIntentId, orderId } = req.body;

    // Get payment details
    const payment = await Payment.findOne({ paymentIntentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify payment belongs to the current user
    if (payment.customer._id.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to confirm this payment' });
    }

    // Get PaymentIntent status from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      payment.status = 'completed';
      payment.chargeId = paymentIntent.charges.data[0].id;
      await payment.save();

      // Update order payment status
      await axios.patch(
        `${ORDER_SERVICE_URL}/api/orders/${orderId}/payment-status`,
        { status: 'completed' },
        { headers: { Authorization: req.header('Authorization') } }
      );

      // Send notification
      try {
        await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/payment-completed`, {
          orderId,
          customerId: req.user._id,
          restaurantId: payment.restaurant._id,
          type: 'PAYMENT_COMPLETED'
        });
      } catch (error) {
        console.error('Notification error:', error);
      }

      res.json({ status: 'completed', payment });
    } else {
      payment.status = 'failed';
      payment.error = {
        code: 'payment_intent_failed',
        message: 'Payment intent did not succeed'
      };
      await payment.save();

      res.status(400).json({ 
        status: 'failed',
        message: 'Payment intent did not succeed',
        payment 
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify user has access to this payment
    if (
      payment.customer._id.toString() !== req.user._id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payments with filters
exports.getPayments = async (req, res) => {
  try {
    const query = {};
    
    // Filter by customer for regular users
    if (req.user.role === 'customer') {
      query['customer._id'] = req.user._id;
    }
    
    // Filter by restaurant for restaurant owners
    if (req.user.role === 'restaurant_admin') {
      query['restaurant._id'] = req.body.restaurantId;
    }

    // Additional filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 10)
      .skip(parseInt(req.query.skip) || 0);

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refund payment
exports.refundPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Only allow refunds for completed card payments
    if (payment.status !== 'completed' || payment.paymentMethod !== 'card') {
      return res.status(400).json({ 
        message: 'Only completed card payments can be refunded' 
      });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
      reason: 'requested_by_customer'
    });

    // Update payment status
    payment.status = 'refunded';
    payment.refundId = refund.id;
    await payment.save();

    // Update order status
    await axios.patch(
      `${ORDER_SERVICE_URL}/api/orders/${payment.order._id}/payment-status`,
      { status: 'refunded' },
      { headers: { Authorization: req.header('Authorization') } }
    );

    // Send notification
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/payment-refunded`, {
        orderId: payment.order._id,
        customerId: payment.customer._id,
        restaurantId: payment.restaurant._id,
        type: 'PAYMENT_REFUNDED'
      });
    } catch (error) {
      console.error('Notification error:', error);
    }

    res.json({ status: 'refunded', payment });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: error.message });
  }
};
