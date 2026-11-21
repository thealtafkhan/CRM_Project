const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts/styles for Chart.js and React SPA
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Request parsers & logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/opportunities', require('./routes/opportunityRoutes'));
app.use('/api/followups', require('./routes/followUpRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Serve React Frontend Production Static Assets
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// For all non-API GET requests, serve React's index.html
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      status: 404,
      title: 'Not Found',
      detail: `Cannot ${req.method} ${req.originalUrl}`
    });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Centralized Error Handling Middleware (RFC 7807)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`AcxiomCRM Server running on port ${PORT}`);
});

module.exports = app;
