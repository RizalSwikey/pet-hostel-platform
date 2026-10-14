const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const roomsRouter = require('./routes/rooms');
const petsRouter = require('./routes/pets');
const bookingsRouter = require('./routes/bookings');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Database connection middleware for serverless invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB Middleware] Connection failed:', err.message);
  }
  next();
});

// Health check
app.get(['/api/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'pet-hostel-api',
  });
});

// API Routes (v1 & base alias)
app.use('/api/v1/rooms', roomsRouter);
app.use('/api/rooms', roomsRouter);

app.use('/api/v1/pets', petsRouter);
app.use('/api/pets', petsRouter);

app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/bookings', bookingsRouter);

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
