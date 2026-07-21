import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export function errorHandler(error, req, res, _next) {
  const validationError = error instanceof ZodError;
  const statusCode = validationError ? 400 : (Number.isInteger(error.statusCode) ? error.statusCode : 500);
  const message = validationError ? 'Request validation failed.' : (statusCode >= 500 ? 'An unexpected server error occurred.' : error.message);
  const errors = validationError
    ? error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }))
    : (env.NODE_ENV === 'production' || !error.errors ? [] : error.errors);
  if (statusCode >= 500) console.error({ requestId: req.requestId, error });
  return sendError(res, { statusCode, message, errors });
}