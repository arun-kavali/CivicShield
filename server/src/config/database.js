import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });

  return mongoose.connection;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export function databaseStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  return {
    connected: mongoose.connection.readyState === 1,
    state: states[mongoose.connection.readyState] ?? 'unknown',
    database: mongoose.connection.name || null,
  };
}
