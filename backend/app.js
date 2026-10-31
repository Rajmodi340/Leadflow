const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const activityRoutes = require('./routes/activities');
const dashboardRoutes = require('./routes/dashboard');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to CLIENT_URL
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Sanitize input to prevent NoSQL injection
app.use(mongoSanitize());

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LeadFlow API is running',
    health: '/health',
    api: '/api/v1',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LeadFlow API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
