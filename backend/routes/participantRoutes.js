const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, participantController.create);
router.get('/', protect, participantController.getAll);
router.get('/active', protect, participantController.getAllActive);
router.get('/:id', protect, participantController.detail);
router.put('/:id', protect, participantController.update);

module.exports = router;