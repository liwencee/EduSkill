const jwt = require('jsonwebtoken');
const config = require('../config');
const { unauthorized, forbidden } = require('../utils/apiResponse');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Authentication token required');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token expired');
    }
    return unauthorized(res, 'Invalid token');
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return unauthorized(res);
    if (roles.length && !roles.includes(req.user.role)) {
      return forbidden(res, 'Insufficient permissions');
    }
    return next();
  };
}

function generateTokens(payload) {
  const access = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  const refresh = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { access, refresh };
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = { authenticate, authorize, generateTokens, verifyRefreshToken };
