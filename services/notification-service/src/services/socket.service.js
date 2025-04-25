const jwt = require('jsonwebtoken');

const connectedUsers = new Map();

exports.setupSocketIO = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    connectedUsers.set(socket.userId, socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
      connectedUsers.delete(socket.userId);
    });
  });
};

exports.sendNotification = (userId, notification) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    return true;
  }
  return false;
};
