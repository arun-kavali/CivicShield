import { Router } from 'express';
import { databaseStatus } from '../config/database.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const database = databaseStatus();
  const statusCode = database.connected ? 200 : 503;

  return sendSuccess(res, {
    statusCode,
    message: database.connected ? 'CivicShield API is healthy.' : 'CivicShield API is running but database is unavailable.',
    data: {
      service: 'civicshield-api',
      database,
    },
  });
});
