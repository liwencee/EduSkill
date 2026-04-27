module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 15000,
  verbose: true,
  setupFiles: ['./tests/setup.js'],
};
