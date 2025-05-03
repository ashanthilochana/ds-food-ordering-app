require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const amqp = require('amqplib');
const notificationRoutes = require('./routes/notification.routes');
const testRoutes = require('./routes/test.routes');
const { setupSocketIO } = require('./services/socket.service');
const { setupMessageQueue } = require('./services/queue.service');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/test', testRoutes);

// Error handling
app.use(errorHandler);

// Socket.IO setup
setupSocketIO(io);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery-db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Message Queue setup
setupMessageQueue().catch(err => console.error('RabbitMQ connection error:', err));

// Start server
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
