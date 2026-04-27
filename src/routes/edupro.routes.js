const router = require('express').Router();
const { body, param, query } = require('express-validator');
const eduProController = require('../controllers/edupro.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/courses', authenticate, eduProController.listCourses);

router.get('/courses/:id', authenticate, [
  param('id').isUUID().withMessage('Invalid course ID'),
], validate, eduProController.getCourse);

router.post('/courses/:id/enroll', authenticate, authorize('teacher'), [
  param('id').isUUID(),
], validate, eduProController.enrollCourse);

router.post('/lesson-plan', authenticate, authorize('teacher'), [
  body('topic').trim().notEmpty().isLength({ max: 200 }).withMessage('Topic required (max 200 chars)'),
  body('gradeLevel').trim().notEmpty().withMessage('Grade level required'),
  body('subject').trim().notEmpty().withMessage('Subject required'),
  body('duration').isInt({ min: 30, max: 180 }).withMessage('Duration must be 30–180 minutes'),
  body('learningObjectives').optional().isArray({ max: 5 }),
], validate, eduProController.generateLessonPlan);

router.get('/materials', authenticate, [
  query('subject').optional().isString(),
  query('grade').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], validate, eduProController.listMaterials);

router.get('/certificates', authenticate, authorize('teacher'), eduProController.getMyCertificates);

router.get('/community/posts', authenticate, eduProController.getCommunityPosts);

router.post('/community/posts', authenticate, authorize('teacher'), [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('content').trim().notEmpty().isLength({ max: 5000 }),
  body('subject').trim().notEmpty(),
], validate, eduProController.createCommunityPost);

module.exports = router;
