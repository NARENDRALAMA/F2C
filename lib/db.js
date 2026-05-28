import mongoose from 'mongoose';

/** Matches `lib/seed.js` default so local dev works without copying `.env.local` first. */
const DEFAULT_DEV_URI = 'mongodb://127.0.0.1:27017/f2c';

function resolveMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (process.env.NODE_ENV !== 'production') return DEFAULT_DEV_URI;
  throw new Error(
    'Set MONGODB_URI in your environment (e.g. .env.local). Production builds require an explicit connection string.'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const uri = resolveMongoUri();

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
