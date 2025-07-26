const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// SIMPLIFIED CORS SETUP - ONE APPROACH ONLY
// ---------------------------------------
// Define allowed origins
const allowedOrigins = [
  'https://worktracker.ct.ws',      // Production frontend
  'http://localhost:8080',          // Local development
  'http://192.168.1.2:8080',        // Network access frontend
  'https://analytics-irb5.onrender.com', // Backend URL (for testing)
  null, // Allow requests with no origin
  undefined // Also catch undefined origins
];

// CORS middleware configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Allow any origin from the same network (192.168.1.x)
      if (origin && origin.includes('192.168.1.')) {
        console.log('Allowing network origin:', origin);
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        // In development, allow all origins for easier testing
        if (process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    }
  },
  credentials: false, // Set to false for mobile compatibility
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle OPTIONS requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic CORS test route
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Routes
console.log('Loading auth routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('Auth routes loaded.');
console.log('Loading work routes...');
app.use('/api/work', require('./routes/work'));
console.log('Work routes loaded.');
console.log('Loading expenses routes...');
app.use('/api/expenses', require('./routes/expenses'));
console.log('Expenses routes loaded.');

console.log('Loading dashboard routes...');
app.use('/api/dashboard', require('./routes/dashboard'));
console.log('Dashboard routes loaded.');

console.log('Loading goals routes...');
app.use('/api/goals', require('./routes/goals'));
console.log('Goals routes loaded.');

console.log('Loading customization routes...');
app.use('/api/customization', require('./routes/customization'));
console.log('Customization routes loaded.');

console.log('Loading calendar routes...');
app.use('/api/calendar', require('./routes/calendar'));
console.log('Calendar routes loaded.');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development'
  });
});

// CORS Debug route
app.get('/cors-debug', (req, res) => {
  res.json({
    requestOrigin: req.header('Origin'),
    corsOriginEnv: process.env.CORS_ORIGIN,
    corsHeaders: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.getHeader('Access-Control-Allow-Credentials'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
      'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers')
    }
  });
});

// Debug route (temporary) - REMOVE FOR PRODUCTION
app.get('/debug', (req, res) => {
  res.json({
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
    dbConnected: !!process.env.DB_HOST
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
