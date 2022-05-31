const express = require('express');
const router = express.Router();
const auth = require('../auth');
const eventController = require('../controllers/eventController');

router.post('/', eventController.create)
router.get('/', eventController.getAll)
router.get('/detail/result/:id', eventController.result)
router.get('/detail/:id', eventController.detail)
router.put('/detail/:id', eventController.update)
router.put('/detail/judge/:id', eventController.updateJudge)
router.put('/detail/criteria/:id', eventController.updateCriteria)
router.put('/detail/participant/:id', eventController.updateParticipant)

module.exports = router;