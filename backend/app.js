const path = require('path');
const fs = require('fs');
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

// Path to the built frontend (copied into backend/public during the Docker build)
const publicPath = path.join(__dirname, 'public');
const indexFile = path.join(publicPath, 'index.html');
const hasFrontend = fs.existsSync(indexFile);

// Security headers (CSP allows the bundled app + Google Fonts)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS — same-origin requests (served SPA) plus explicit allowlist
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.APP_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:9999',
  'https://leadflow-m26w.vercel.app',
].filter(Boolean);

const isSameOrigin = (origin, host) => {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch (err) {
    return false;
  }
};

app.use((req, res, next) => {
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        isSameOrigin(origin, req.headers.host) ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(origin.replace(/\/$/, ''))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })(req, res, next);
});

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

// Static assets for the built SPA
if (hasFrontend) {
  app.use(express.static(publicPath, { index: false, maxAge: '1h' }));
}

// Health check
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStates[mongoose.connection.readyState] || 'unknown';
  res.status(200).json({
    success: true,
    message: 'LeadFlow API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbState,
  });
});

// API routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Root: SPA when a build is present, otherwise API info JSON
app.get('/', (req, res, next) => {
  if (hasFrontend) return res.sendFile(indexFile);
  return res.status(200).json({
    success: true,
    message: 'LeadFlow API is running',
    health: '/health',
  });
});

// SPA fallback for client-side routes (never for API paths)
app.get('*', (req, res, next) => {
  if (!hasFrontend) return next();
  if (req.path.startsWith('/api') || req.path === '/health') return next();
  return res.sendFile(indexFile);
});

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
