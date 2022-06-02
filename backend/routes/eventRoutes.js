const express = require('express');
const router = express.Router();
const auth = require('../auth');
const eventController = require('../controllers/eventController');


router.get('/detail/result/:id', eventController.result)
router.get('/detail/:id', eventController.detail)
router.post('/', eventController.create)
router.get('/', eventController.getAll)
router.put('/detail/judge/:id', eventController.updateJudge)
router.put('/detail/criteria/:id', eventController.updateCriteria)
router.put('/detail/participant/:id', eventController.updateParticipant)
router.put('/detail/:id', eventController.update)

module.exports = router;