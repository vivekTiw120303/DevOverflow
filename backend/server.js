const app = require('./app');
const connectDB = require('./config/db');
const socketio = require('socket.io');
const http = require('http');

connectDB(); // Connect to MongoDB

const server = http.createServer(app);
const io = socketio(server, {
  cors:{
    origin: "*",
  },
});

io.on('cnnection', (socket) => {
  console.log('User connected');

  socket.on('newAnswer', (questionId) => {
    socket.broadcast.emit('notifyNewAnswer', questionId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

});

app.set('io', io); // Set io instance to app

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})