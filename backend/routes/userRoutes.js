const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, UserController.getAll)
router.post('/create', protect, UserController.create)
router.post('/login', UserController.login)
router.get('/me', protect, UserController.getMe)
router.get('/active', protect, UserController.getAllActiveJudge);
router.get('/:id', protect, UserController.details)
router.put('/update/:id', protect, UserController.update)
router.put('/changepassword/:id', protect, UserController.changePassword)

module.exports = router;