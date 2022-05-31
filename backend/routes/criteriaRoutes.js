const express = require('express');
const router = express.Router();
const criteriaController = require('../controllers/criteriaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, criteriaController.create);
router.get('/', protect, criteriaController.getAll);
router.get('/active', protect, criteriaController.getAllActive);
router.get('/:id', protect, criteriaController.detail);
router.put('/:id', protect, criteriaController.update);

module.exports = router;