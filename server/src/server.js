import http from 'node:http';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { initializeSocketServer } from './socket/index.js';
import { startDemoAlertScheduler } from './schedulers/demoAlertScheduler.js';

const app = createApp();
const httpServer = http.createServer(app);
initializeSocketServer(httpServer);

async function startServer() {
  await connectDatabase();
  startDemoAlertScheduler();

  await new Promise((resolve) => {
    httpServer.listen(env.PORT, resolve);
  });

  console.info(`CivicShield API listening on ${env.SERVER_URL}`);
}

async function shutdown(signal) {
  console.info(`${signal} received. Shutting down CivicShield API.`);
  await new Promise((resolve, reject) => httpServer.close((error) => (error ? reject(error) : resolve())));
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT').catch((error) => {
  console.error(error);
  process.exit(1);
}));
process.on('SIGTERM', () => shutdown('SIGTERM').catch((error) => {
  console.error(error);
  process.exit(1);
}));

startServer().catch((error) => {
  console.error('Failed to start CivicShield API.', error);
  process.exit(1);
});
