const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  quantity: { type: Number, required: true, min: 1 },
  specialInstructions: { type: String }
});

const orderSchema = new mongoose.Schema({
  customer: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  restaurant: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true }
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash_on_delivery'],
    required: true
  },
  deliveryInstructions: { type: String },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  cancellationReason: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Add index for common queries
orderSchema.index({ 'customer._id': 1, createdAt: -1 });
orderSchema.index({ 'restaurant._id': 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
