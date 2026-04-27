const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');

const security = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

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

// Body parsing — enforce size limits to prevent request smuggling
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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
