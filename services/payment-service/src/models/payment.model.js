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
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash_on_delivery', 'paypal', 'google_pay', 'apple_pay'],
    required: true
  },
  paymentIntentId: { type: String },
  chargeId: { type: String },
  refundId: { type: String },
  refundAmount: { type: Number, default: 0 },
  retryCount: { type: Number, default: 0 },
  lastRetryAt: { type: Date },
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  metadata: {
    type: Map,
    of: String
  },
  analytics: {
    processingTime: Number,
    paymentProvider: String,
    deviceInfo: {
      type: String,
      userAgent: String,
      ip: String
    }
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ 'order._id': 1 });
paymentSchema.index({ 'customer._id': 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ paymentIntentId: 1 }, { sparse: true });
paymentSchema.index({ 'analytics.processingTime': 1 });
paymentSchema.index({ retryCount: 1 });

// Add method to check if payment can be retried
paymentSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.retryCount < 3;
};

// Add method to get refund amount
paymentSchema.methods.getRefundableAmount = function() {
  return this.amount - this.refundAmount;
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
