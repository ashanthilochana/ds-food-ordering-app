const amqp = require('amqplib');
const { createNotification } = require('../controllers/notification.controller');

let channel;

exports.setupMessageQueue = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // Queues for different notification types
    const queues = [
      'order_notifications',
      'delivery_notifications',
      'payment_notifications'
    ];

    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });
      
      channel.consume(queue, async (msg) => {
        if (msg !== null) {
          try {
            const notification = JSON.parse(msg.content.toString());
            await createNotification(notification);
            channel.ack(msg);
          } catch (error) {
            console.error(`Error processing message from ${queue}:`, error);
            // Requeue the message if it's a temporary error
            channel.nack(msg, false, true);
          }
        }
      });
    }

    console.log('Message queues setup completed');
  } catch (error) {
    console.error('Message queue setup error:', error);
    throw error;
  }
};

exports.publishToQueue = async (queue, message) => {
  try {
    if (!channel) {
      throw new Error('Message queue not initialized');
    }
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    return true;
  } catch (error) {
    console.error('Message publish error:', error);
    return false;
  }
};
