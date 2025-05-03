const { validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment.model');
const axios = require('axios');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

// Get Stripe publishable key
exports.getPublishableKey = async (req, res) => {
  try {
    res.json({ 
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY 
    });
  } catch (error) {
    logger.error('Error getting publishable key', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: error.message });
  }
};

// Helper function to handle payment provider selection
const getPaymentProvider = (paymentMethod) => {
  switch (paymentMethod) {
    case 'card':
    case 'google_pay':
    case 'apple_pay':
      return 'stripe';
    case 'paypal':
      return 'paypal';
    case 'cash_on_delivery':
      return 'cash';
    default:
      throw new Error('Unsupported payment method');
  }
};

// Create a payment intent
exports.createPaymentIntent = async (req, res) => {
  const startTime = Date.now();
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
      paymentMethod,
      analytics: {
        deviceInfo: {
          userAgent: req.headers['user-agent'],
          ip: req.ip
        }
      }
    });

    // Save payment record
    await payment.save();

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        orderId: order._id,
        paymentId: payment._id.toString(),
        customerId: req.user._id
      }
    });

    // Update payment with payment intent ID
    payment.paymentIntentId = paymentIntent.id;
    payment.status = 'processing';
    await payment.save();

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    payment.analytics.processingTime = processingTime;
    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    logger.error('Error creating payment intent', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: error.message });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentIntentId, orderId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find payment record
    const payment = await Payment.findOne({ paymentIntentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify payment belongs to the current user
    if (payment.customer._id.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to confirm this payment' });
    }

    // Update payment status based on Stripe payment intent status
    if (paymentIntent.status === 'succeeded') {
      payment.status = 'completed';
      payment.chargeId = paymentIntent.latest_charge;
      
      // Update order status in Order Service
      await axios.patch(
        `${ORDER_SERVICE_URL}/api/orders/${orderId}/status`,
        { status: 'paid' },
        { headers: { Authorization: req.header('Authorization') } }
      );
      
      // Send notification
      await axios.post(
        `${NOTIFICATION_SERVICE_URL}/api/notifications`,
        {
          userId: req.user._id,
          type: 'payment_success',
          title: 'Payment Successful',
          message: `Your payment of $${payment.amount} has been processed successfully.`
        },
        { headers: { Authorization: req.header('Authorization') } }
      );
    } else if (paymentIntent.status === 'requires_payment_method') {
      payment.status = 'failed';
      payment.error = {
        code: 'payment_failed',
        message: 'Payment failed. Please try again with a different payment method.'
      };
    } else {
      payment.status = 'failed';
      payment.error = {
        code: paymentIntent.last_payment_error?.code || 'unknown',
        message: paymentIntent.last_payment_error?.message || 'Payment failed'
      };
    }

    await payment.save();

    res.json({
      status: payment.status,
      paymentId: payment._id
    });
  } catch (error) {
    logger.error('Error confirming payment', {
      error: error.message,
      stack: error.stack
    });
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
    if (payment.customer._id.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json(payment);
  } catch (error) {
    logger.error('Error getting payment by ID', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: error.message });
  }
};

// Get payments with filters
exports.getPayments = async (req, res) => {
  try {
    const { status, startDate, endDate, limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by customer ID if user is a customer
    if (req.user.role === 'customer') {
      query['customer._id'] = req.user._id;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Payment.countDocuments(query);
    
    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting payments', {
      error: error.message,
      stack: error.stack
    });
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

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment can be refunded
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Payment cannot be refunded' });
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
      reason: reason || 'requested_by_customer'
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = payment.amount;
    await payment.save();

    // Update order status in Order Service
    await axios.patch(
      `${ORDER_SERVICE_URL}/api/orders/${payment.order._id}/status`,
      { status: 'refunded' },
      { headers: { Authorization: req.header('Authorization') } }
    );

    // Send notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications`,
      {
        userId: payment.customer._id,
        type: 'payment_refunded',
        title: 'Payment Refunded',
        message: `Your payment of $${payment.amount} has been refunded.`
      },
      { headers: { Authorization: req.header('Authorization') } }
    );

    res.json({
      message: 'Payment refunded successfully',
      refundId: refund.id
    });
  } catch (error) {
    logger.error('Error refunding payment', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: error.message });
  }
};

// Partial refund payment
exports.partialRefund = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId, amount, reason } = req.body;

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment can be partially refunded
    if (payment.status !== 'completed' && payment.status !== 'partially_refunded') {
      return res.status(400).json({ message: 'Payment cannot be partially refunded' });
    }

    // Check if refund amount is valid
    const refundableAmount = payment.getRefundableAmount();
    if (amount > refundableAmount) {
      return res.status(400).json({ 
        message: `Cannot refund more than the refundable amount (${refundableAmount})` 
      });
    }

    // Process partial refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
      reason: reason || 'requested_by_customer'
    });

    // Update payment record
    payment.refundAmount += amount;
    payment.status = payment.refundAmount === payment.amount ? 'refunded' : 'partially_refunded';
    await payment.save();

    // Send notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications`,
      {
        userId: payment.customer._id,
        type: 'payment_partially_refunded',
        title: 'Payment Partially Refunded',
        message: `Your payment has been partially refunded by $${amount}.`
      },
      { headers: { Authorization: req.header('Authorization') } }
    );

    res.json({
      message: 'Payment partially refunded successfully',
      refundId: refund.id,
      refundedAmount: amount,
      remainingAmount: payment.getRefundableAmount()
    });
  } catch (error) {
    logger.error('Error partially refunding payment', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: error.message });
  }
};

// Retry failed payment
exports.retryPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify payment belongs to the current user
    if (payment.customer._id.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to retry this payment' });
    }

    // Check if payment can be retried
    if (!payment.canRetry()) {
      return res.status(400).json({ 
        message: 'Payment cannot be retried. Maximum retry attempts reached or payment is not in failed state.' 
      });
    }

    // Increment retry count
    payment.retryCount += 1;
    payment.lastRetryAt = new Date();
    payment.status = 'processing';
    await payment.save();

    // Create new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payment.amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        orderId: payment.order._id.toString(),
        paymentId: payment._id.toString(),
        customerId: req.user._id,
        isRetry: true,
        originalPaymentIntentId: payment.paymentIntentId
      }
    });

    // Update payment with new payment intent ID
    payment.paymentIntentId = paymentIntent.id;
    await payment.save();

    res.json({
      message: 'Payment retry initiated',
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    logger.error('Error retrying payment', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: error.message });
  }
};

// Handle Stripe webhook
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed', {
      error: err.message
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// Helper function to handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    // Find payment record
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (!payment) {
      logger.error('Payment not found for successful payment intent', {
        paymentIntentId: paymentIntent.id
      });
      return;
    }

    // Update payment status
    payment.status = 'completed';
    payment.chargeId = paymentIntent.latest_charge;
    await payment.save();

    // Update order status in Order Service
    await axios.patch(
      `${ORDER_SERVICE_URL}/api/orders/${payment.order._id}/status`,
      { status: 'paid' },
      { headers: { Authorization: `Bearer ${process.env.SERVICE_TOKEN}` } }
    );

    // Send notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications`,
      {
        userId: payment.customer._id,
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your payment of $${payment.amount} has been processed successfully.`
      },
      { headers: { Authorization: `Bearer ${process.env.SERVICE_TOKEN}` } }
    );
  } catch (error) {
    logger.error('Error handling payment success', {
      error: error.message,
      stack: error.stack,
      paymentIntentId: paymentIntent.id
    });
  }
}

// Helper function to handle failed payment
async function handlePaymentFailure(paymentIntent) {
  try {
    // Find payment record
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (!payment) {
      logger.error('Payment not found for failed payment intent', {
        paymentIntentId: paymentIntent.id
      });
      return;
    }

    // Update payment status
    payment.status = 'failed';
    payment.error = {
      code: paymentIntent.last_payment_error?.code || 'unknown',
      message: paymentIntent.last_payment_error?.message || 'Payment failed'
    };
    await payment.save();

    // Send notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications`,
      {
        userId: payment.customer._id,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: `Your payment of $${payment.amount} has failed. Please try again.`
      },
      { headers: { Authorization: `Bearer ${process.env.SERVICE_TOKEN}` } }
    );
  } catch (error) {
    logger.error('Error handling payment failure', {
      error: error.message,
      stack: error.stack,
      paymentIntentId: paymentIntent.id
    });
  }
}

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, success_url, cancel_url } = req.body;
    // You may want to validate and fetch order details here

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.menuItem.name,
          },
          unit_amount: Math.round(item.menuItem.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url,
      cancel_url,
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment by Stripe session ID
exports.getPaymentBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    // Find payment by sessionId (you need to store sessionId in your Payment model when creating the session)
    const payment = await Payment.findOne({ sessionId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
