const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');

const security = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Trust the first reverse-proxy hop (Railway, Vercel, etc. all sit in front of
// the app) so req.ip and X-Forwarded-For are read correctly. Without this,
// express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every request.
app.set('trust proxy', 1);

// Request ID
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Security middleware
app.use(security.helmet);
app.use(security.cors);
app.use(security.hpp);
app.use(security.globalRateLimiter);
app.use(security.speedLimiter);

// Body parsing — size limit raised to 10mb for file/document uploads (KYC docs, etc.)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Friendly response for oversized payloads (raw-body throws PayloadTooLargeError,
// type 'entity.too.large' — not a SyntaxError, despite what body-parser's own
// docs examples sometimes suggest)
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ success: false, message: 'Payload too large' });
  }
  next(err);
});

// Compression
app.use(compression());

// HTTP request logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (req) => req.path === '/api/v1/health',
}));

// Disable x-powered-by (already done by helmet but explicit)
app.disable('x-powered-by');

// Routes
app.use('/api/v1', routes);

// 404 and error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
