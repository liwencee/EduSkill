const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/security');

const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must be 8+ chars with uppercase, lowercase, number, and special char'),
  body('name').trim().notEmpty().isLength({ max: 100 }).withMessage('Name is required (max 100 chars)'),
  body('role')
    .isIn(['teacher', 'youth', 'employer', 'admin'])
    .withMessage('Role must be teacher, youth, employer, or admin'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', authRateLimiter, registerRules, validate, authController.register);
router.post('/login', authRateLimiter, loginRules, validate, authController.login);
router.post('/refresh', authRateLimiter, authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
], validate, authController.changePassword);

module.exports = router;
