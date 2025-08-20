require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboardDB';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
  res.send('<h1>Dashboard Backend API</h1>');
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/widgets', require('./routes/widgets'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/external', require('./routes/external'));
app.use('/api/notifications', require('./routes/notifications'));


// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected with socket id:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Global io instance
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
