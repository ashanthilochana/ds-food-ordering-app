require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const paymentRoutes = require('./routes/payment.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(errorHandler);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Stripe publishable key: ${process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 10)}...`);
    console.log(`Stripe secret key: ${process.env.STRIPE_SECRET_KEY?.substring(0, 10)}...`);
  }
});

module.exports = app;
