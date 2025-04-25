const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  pickupLocation: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  deliveryLocation: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  notes: {
    type: String
  },
  tracking: [{
    status: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Delivery', deliverySchema);
