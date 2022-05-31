const express = require('express');
const router = express.Router();
const auth = require('../auth');
const scoreController = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, scoreController.getEvents)
router.get('/event/score/:id', protect, scoreController.score)
router.get('/event/:id', protect, scoreController.detail)
router.put('/event/:id', protect, scoreController.create)

module.exports = router;