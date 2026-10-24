const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getDBStatus } = require('./config/db');
const ticketRoutes = require('./routes/ticketRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: '*', // Allow frontend from any port / dev server
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    databaseConnected: getDBStatus(),
    storageMode: getDBStatus() ? 'MongoDB' : 'In-Memory Store (Resilient Fallback)',
  });
});

// Mount Routes
app.use('/api/tickets', ticketRoutes);

// Root fallback
app.get('/', (req, res) => {
  res.send('Support Ticketing Tool REST API is running. Access endpoints at /api/tickets');
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Support Ticketing Tool API Server Running!`);
    console.log(`📍 Port: http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🎟️  Tickets API:  http://localhost:${PORT}/api/tickets`);
    console.log(`📊 Stats API:    http://localhost:${PORT}/api/tickets/stats`);
    console.log(`===============================================`);
  });
};

// Start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
