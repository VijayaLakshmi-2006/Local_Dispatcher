import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dispatchRoutes from './routes/dispatchRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Dispatcher IO initialization
import { setIoInstance } from './services/dispatchService.js';

dotenv.config();

// Connect Database
connectDB();
console.log('Environment check: GROQ_API_KEY is', process.env.GROQ_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED');

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*', // Use configured frontend url
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Pass socket.io instance to the dispatch service
setIoInstance(io);

// Middleware
app.use(cors());
app.use(express.json());

// Basic sanity check route
app.get('/', (req, res) => {
  res.json({ message: 'Hyperlocal Delivery Dispatcher Backend API is running...' });
});

// Health check route for Render
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join User Room (so customer receives order updates for their own orders)
  socket.on('join-user-room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User socket ${socket.id} joined room: ${userId}`);
    }
  });

  // Join Order Room (for agent tracking updates on specific orders)
  socket.on('join-order-room', (orderId) => {
    if (orderId) {
      socket.join(orderId);
      console.log(`Socket ${socket.id} joined order room: ${orderId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error occurred' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
