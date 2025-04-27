// Mock queue service for testing
const { createNotification } = require('../controllers/notification.controller');

exports.setupMessageQueue = async () => {
  console.log('Mock message queue setup completed');
};

exports.publishToQueue = async (queue, message) => {
  console.log('Mock message published to queue:', { queue, message });
  // Simulate processing the message
  try {
    await createNotification(message);
    return true;
  } catch (error) {
    console.error('Mock queue error:', error);
    return false;
  }
};
