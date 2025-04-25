const Notification = require('../models/notification.model');
const { sendEmail } = require('../services/email.service');
const { sendSMS } = require('../services/sms.service');
const { sendNotification: sendSocketNotification } = require('../services/socket.service');

exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    // Send through different channels
    const sentVia = [];

    // Socket.IO (in-app notification)
    if (notification.channels.includes('in_app')) {
      const sent = sendSocketNotification(notification.userId, notification);
      sentVia.push({
        channel: 'in_app',
        status: sent ? 'sent' : 'failed',
        timestamp: new Date()
      });
    }

    // Email
    if (notification.channels.includes('email')) {
      const result = await sendEmail(
        notification.data.email,
        notification.title,
        notification.message
      );
      sentVia.push({
        channel: 'email',
        status: result.success ? 'sent' : 'failed',
        timestamp: new Date()
      });
    }

    // SMS
    if (notification.channels.includes('sms')) {
      const result = await sendSMS(
        notification.data.phone,
        notification.message
      );
      sentVia.push({
        channel: 'sms',
        status: result.success ? 'sent' : 'failed',
        timestamp: new Date()
      });
    }

    // Update sent channels
    notification.sentVia = sentVia;
    await notification.save();

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.status = 'read';
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
