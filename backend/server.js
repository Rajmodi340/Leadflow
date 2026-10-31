require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const HOST = process.env.HOST || '0.0.0.0';
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT} [${process.env.NODE_ENV}]`);
    console.log(`📋 Health check: http://${HOST}:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });
};

startServer();
