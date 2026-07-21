export function sendSuccess(res, { statusCode = 200, message = 'Request completed successfully.', data = null } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: [],
    timestamp: new Date().toISOString(),
  });
}

export function sendError(res, { statusCode = 500, message = 'An unexpected error occurred.', errors = [] } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString(),
  });
}
