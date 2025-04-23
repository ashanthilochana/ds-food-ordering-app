const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true }
  },
  customer: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  restaurant: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true }
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash_on_delivery'],
    required: true
  },
  paymentIntentId: { type: String },
  chargeId: { type: String },
  refundId: { type: String },
  error: {
    code: String,
    message: String
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ 'order._id': 1 });
paymentSchema.index({ 'customer._id': 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ paymentIntentId: 1 }, { sparse: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
