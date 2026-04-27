/* eslint-disable n/no-process-exit */
// process.exit() is intentional here: signal handlers and fatal error
// handlers must terminate the process; throwing would be swallowed.
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

const server = app.listen(config.port, () => {
  logger.info(`SkillBridge Nigeria API running`, { port: config.port, env: config.env });
});

// Graceful shutdown
function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

module.exports = server;
