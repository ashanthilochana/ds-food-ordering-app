const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['order_status', 'delivery_status', 'payment_status', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms'],
    default: ['in_app']
  }],
  sentVia: [{
    channel: String,
    status: String,
    timestamp: Date
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from now
  }
}, {
  timestamps: true
});

// Index for querying user's notifications and expiry
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
