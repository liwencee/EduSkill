const router = require('express').Router();
const { body, param, query } = require('express-validator');
const skillUpController = require('../controllers/skillup.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const VALID_LANGUAGES = ['english', 'yoruba', 'igbo', 'hausa', 'pidgin'];
const VALID_CATEGORIES = ['digital_marketing', 'coding', 'fashion_design', 'solar_tech', 'agribusiness', 'financial_literacy'];

router.get('/courses', authenticate, [
  query('category').optional().isIn(VALID_CATEGORIES),
  query('language').optional().isIn(VALID_LANGUAGES),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], validate, skillUpController.listCourses);

router.get('/courses/:id', authenticate, [
  param('id').isUUID(),
], validate, skillUpController.getCourse);

router.post('/courses/:id/enroll', authenticate, authorize('youth'), [
  param('id').isUUID(),
], validate, skillUpController.enrollCourse);

router.post('/courses/:id/progress', authenticate, authorize('youth'), [
  param('id').isUUID(),
  body('lessonId').isUUID(),
  body('completed').isBoolean(),
], validate, skillUpController.updateProgress);

router.get('/my-courses', authenticate, authorize('youth'), skillUpController.getMyCourses);

router.get('/certificates', authenticate, authorize('youth'), skillUpController.getMyCertificates);

router.get('/study-groups', authenticate, skillUpController.listStudyGroups);

router.post('/study-groups', authenticate, authorize('youth'), [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('courseId').isUUID(),
  body('maxMembers').isInt({ min: 2, max: 50 }),
], validate, skillUpController.createStudyGroup);

module.exports = router;
