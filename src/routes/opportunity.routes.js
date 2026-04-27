const router = require('express').Router();
const { body, param, query } = require('express-validator');
const opportunityController = require('../controllers/opportunity.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/jobs', authenticate, [
  query('skill').optional().isString(),
  query('location').optional().isString(),
  query('type').optional().isIn(['job', 'apprenticeship', 'freelance']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], validate, opportunityController.listJobs);

router.get('/jobs/:id', authenticate, [
  param('id').isUUID(),
], validate, opportunityController.getJob);

router.post('/jobs', authenticate, authorize('employer'), [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty().isLength({ max: 5000 }),
  body('type').isIn(['job', 'apprenticeship', 'freelance']),
  body('location').trim().notEmpty(),
  body('requiredSkills').isArray({ min: 1, max: 10 }),
  body('requiredSkills.*').isString().isLength({ max: 100 }),
  body('salaryRange').optional().isObject(),
], validate, opportunityController.createJob);

router.post('/jobs/:id/apply', authenticate, authorize('youth'), [
  param('id').isUUID(),
  body('coverNote').optional().trim().isLength({ max: 1000 }),
], validate, opportunityController.applyForJob);

router.get('/profiles', authenticate, authorize('employer', 'admin'), [
  query('skill').optional().isString(),
  query('location').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
], validate, opportunityController.listGraduateProfiles);

router.get('/my-applications', authenticate, authorize('youth'), opportunityController.getMyApplications);

router.get('/matches', authenticate, authorize('youth'), opportunityController.getMyJobMatches);

module.exports = router;
