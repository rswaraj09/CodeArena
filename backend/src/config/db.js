const mongoose = require('mongoose');
const env = require('./env');
const dns = require('dns');

// Set public DNS servers to resolve MongoDB Atlas SRV records on Windows local networks only
if (process.platform === 'win32' && process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    // Fallback gracefully if setServers is unavailable
  }
}


let connectionPromise = null;

/**
 * Reuses a single connection across invocations — important on serverless
 * platforms (Vercel) where the module can be re-entered on a warm lambda
 * without a fresh cold start.
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!connectionPromise) {
    if (!env.mongodbUri) {
      throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
    }
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose.connect(env.mongodbUri, {
      maxPoolSize: 10,
    });
  }
  await connectionPromise;
  return mongoose.connection;
}

module.exports = { connectDB };
