const mongoose = require('mongoose');

let cachedConnection = global.mongooseConnection;

if (!cachedConnection) {
  cachedConnection = global.mongooseConnection = { conn: null, promise: null };
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB] MONGODB_URI not set. Skipping real DB connection.');
    return null;
  }

  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    cachedConnection.promise = mongoose.connect(uri, {
      bufferCommands: false,
    }).then((m) => {
      console.log('[DB] Connected to MongoDB Atlas');
      return m;
    }).catch((err) => {
      cachedConnection.promise = null;
      console.error('[DB] MongoDB connection error:', err.message);
      throw err;
    });
  }

  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
}

module.exports = connectDB;
