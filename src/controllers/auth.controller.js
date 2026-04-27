const authService = require('../services/auth.service');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { success, created, error, unauthorized } = require('../utils/apiResponse');
const logger = require('../utils/logger');

async function register(req, res) {
  try {
    const { email, password, name, role } = req.body;
    const user = await authService.registerUser({ email, password, name, role });
    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    logger.info('User registered', { userId: user.id, role: user.role });
    return created(res, { user: sanitize(user), tokens }, 'Registration successful');
  } catch (err) {
    if (err.message === 'Email already registered') {
      return error(res, err.message, 409);
    }
    logger.error('Registration error', { error: err.message });
    return error(res, 'Registration failed', 500);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    logger.info('User logged in', { userId: user.id });
    return success(res, { user: sanitize(user), tokens }, 'Login successful');
  } catch (err) {
    return unauthorized(res, 'Invalid email or password');
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return unauthorized(res, 'Refresh token required');
    const decoded = verifyRefreshToken(refreshToken);
    const user = await authService.getUserById(decoded.id);
    if (!user) return unauthorized(res, 'User not found');
    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    return success(res, { tokens }, 'Token refreshed');
  } catch {
    return unauthorized(res, 'Invalid or expired refresh token');
  }
}

async function logout(req, res) {
  logger.info('User logged out', { userId: req.user.id });
  return success(res, null, 'Logged out successfully');
}

async function me(req, res) {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) return unauthorized(res, 'User not found');
    return success(res, { user: sanitize(user) });
  } catch (err) {
    return error(res, 'Failed to fetch profile', 500);
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return success(res, null, 'Password changed successfully');
  } catch (err) {
    return error(res, err.message || 'Password change failed', 400);
  }
}

function sanitize(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

module.exports = { register, login, refresh, logout, me, changePassword };
