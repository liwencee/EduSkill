const logger = require('../utils/logger');
const config = require('../config');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode < 500 ? err.message : 'Internal server error';

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  const body = { success: false, message };
  if (config.env !== 'production' && statusCode < 500) {
    body.detail = err.message;
  }

  return res.status(statusCode).json(body);
}

function notFoundHandler(req, res) {
  return res.status(404).json({ success: false, message: `Route ${req.path} not found` });
}

module.exports = { errorHandler, notFoundHandler };
