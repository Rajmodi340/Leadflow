const config = require('./config/env');
const app = require('./app');
const { connectDBWithRetry } = require('./config/db');

const PORT = config.PORT;
const HOST = config.HOST;

const startServer = async () => {
  // Start listening first so the platform health check can reach the container
  // even while the database connection is being established.
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT} [${config.NODE_ENV}]`);
    console.log(`📋 Health check: http://${HOST}:${PORT}/health`);
    const envReport = {
      PORT: Boolean(process.env.PORT),
      NODE_ENV: Boolean(process.env.NODE_ENV),
      MONGODB_URI: Boolean(config.MONGODB_URI),
      JWT_SECRET: Boolean(config.JWT_SECRET),
      JWT_EXPIRES_IN: Boolean(config.JWT_EXPIRES_IN),
      CLIENT_URL: Boolean(config.CLIENT_URL),
    };
    console.log(`🔧 Environment variables present: ${JSON.stringify(envReport)}`);
  });

  // Connect to MongoDB in the background (retries instead of exiting).
  connectDBWithRetry().catch((err) => {
    console.error(`❌ MongoDB bootstrap error: ${err.message}`);
  });

  // Graceful shutdown
  process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });
};

startServer();
