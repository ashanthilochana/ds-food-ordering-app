const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.isDeliveryPerson = (req, res, next) => {
  if (req.user.role !== 'delivery_person') {
    return res.status(403).json({ message: 'Access denied. Delivery personnel only.' });
  }
  next();
};
