const app = require('./app');
const connectDB = require('./config/db');
const socketio = require('socket.io');
const http = require('http');
const redisClient = require('./utils/redisClient');
require('./workers/notificationWorker');

connectDB();

// CONNECT TO REDIS
(async () => {
    await redisClient.connect();
})();

const server = http.createServer(app);
const io = socketio(server, {
  cors:{
    origin: "*",
  },
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('newAnswer', (questionId) => {
    socket.broadcast.emit('notifyNewAnswer', questionId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});