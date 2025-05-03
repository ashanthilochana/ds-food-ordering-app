const Delivery = require('../models/delivery.model');
const { validationResult } = require('express-validator');
const axios = require('axios'); 

// Create a new delivery
exports.createDelivery = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const delivery = new Delivery({
      ...req.body,
      status: 'pending',
      deliveryPersonId: null
    });

    await delivery.save();
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all deliveries for a delivery person


exports.getDeliveryPersonDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryPersonId: req.user._id }).sort({ createdAt: -1 });

    const enrichedDeliveries = await Promise.all(
      deliveries.map(async (delivery) => {
        try {
          const orderRes = await axios.get(`http://localhost:3003/api/orders/${delivery.orderId}`, {
            headers: {
              Authorization: req.headers.authorization // forward token if order service is protected
            }
          });
          return {
            ...delivery.toObject(),
            order: orderRes.data
          };
        } catch (err) {
          console.error(`Failed to fetch order ${delivery.orderId}: ${err.message}`);
          return {
            ...delivery.toObject(),
            order: null
          };
        }
      })
    );

    res.json(enrichedDeliveries);
  } catch (error) {
    console.error('Error fetching delivery person deliveries:', error.message);
    res.status(500).json({ message: 'Failed to load deliveries' });
  }
};



// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, location } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Skip authorization check since we're still implementing the full flow

    delivery.status = status;
    delivery.tracking.push({
      status,
      location,
      timestamp: new Date()
    });

    if (status === 'delivered') {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get delivery by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available deliveries
exports.getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ 
      status: 'pending',
      deliveryPersonId: null 
    }).sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept delivery
exports.acceptDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.deliveryPersonId) {
      return res.status(400).json({ message: 'Delivery already assigned' });
    }

    delivery.deliveryPersonId = req.user._id;
    delivery.status = 'picked_up';
    delivery.tracking.push({
      status: 'picked_up',
      location: req.body.location,
      timestamp: new Date()
    });

    await delivery.save();
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
