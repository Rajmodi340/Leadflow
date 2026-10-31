require('./env');

const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  if (!MONGODB_URI) {
    console.error(
      '❌ MONGODB_URI is not set. Set it as an environment variable for the deployment.'
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

/**
 * Connect with retries so a slow/blocked database never crash-loops the
 * container. The HTTP server keeps serving /health while this retries.
 */
const connectDBWithRetry = async () => {
  let attempt = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ok = await connectDB();
    if (ok) {
      mongoose.connection.on('disconnected', () => {
        console.error('⚠️  MongoDB disconnected. Reconnecting...');
        connectDBWithRetry();
      });
      return;
    }
    if (!MONGODB_URI) {
      console.error('ℹ️  Waiting for MONGODB_URI to be provided; retrying in 30s.');
      await new Promise((r) => setTimeout(r, 30000));
    } else {
      console.error(`↻ MongoDB connection attempt ${attempt} failed; retrying in ${RETRY_DELAY_MS / 1000}s.`);
      attempt += 1;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;
module.exports.connectDBWithRetry = connectDBWithRetry;
