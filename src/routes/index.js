const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/edupro', require('./edupro.routes'));
router.use('/skillup', require('./skillup.routes'));
router.use('/opportunity', require('./opportunity.routes'));

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'SkillBridge Nigeria API is running', timestamp: new Date().toISOString() });
});

module.exports = router;
