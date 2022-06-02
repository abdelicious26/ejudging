const eventModel = require('../models/eventModel');
const scoreModel = require('../models/scoreModel');
const userModel = require('../models/userModel');
const criteriaModel = require('../models/criteriaModel');
const scoreController = require('../controllers/scoreController');
const asyncHandler = require('express-async-handler')

module.exports.create = asyncHandler(async (request, response) => {
    const { name, description, venue, dateTime } = request.body
    if (!name || !description || !venue || !dateTime) {
        response.status(400)
        throw new Error('Please add all fields')
    }
    const eventExist = await eventModel.findOne({ name })
    if (eventExist) {
        response.status(400)
        throw new Error('Event name already exists')
    }
    const event = await eventModel.create({
        name: name,
        description: description,
        venue: venue,
        dateTime: dateTime
    })
    response.status(200).json(event)
});

module.exports.getAll = asyncHandler(async (request, response) => {
    const events = await eventModel.find().sort({ dateTime: -1, name: 1, description: 1 })
    response.status(200).json(events)
})

module.exports.update = asyncHandler(async (request, response) => {
    const event = await eventModel.findById(request.params.id)
    if (!event) {
        response.status(400)
        throw new Error('Event not found')
    }
    const { name, description, venue, dateTime, isActive, IsOnGoing } = request.body

    if (!name || !description || !venue || !dateTime) {
        response.status(400)
        throw new Error('Please add all fields')
    }
    const eventExist = await eventModel.find({ name: name })
    if (eventExist.length > 0) {
        if (eventExist[0]._id.toString() != request.params.id) {
            response.status(400)
            throw new Error('Event name already exist')
        }
    }
    const updatedEvent = await eventModel.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
    })
    response.status(200).json(updatedEvent)
})

module.exports.detail = asyncHandler(async (request, response) => {
    const event = await eventModel.findById(request.params.id)
    if (!event) {
        response.status(400)
        throw new Error('Event does not exist')
    }
    response.status(200).json(event)
})

module.exports.result = asyncHandler(async (request, response) => {
    const scores = await scoreModel.find({ event: request.params.id })
    response.status(200).json(scores)
})

module.exports.updateJudge = asyncHandler(async (request, response) => {
    const addJudge = eventModel.findById(request.params.id)
        .then(event => {
            if (!event) {
                response.status(400)
                throw new Error('Event not found')
            }
            return eventModel.findByIdAndUpdate(request.params.id, {
                $push: { judge: { userId: request.body.userId } }
            })
        })
    response.status(200).json(addJudge)
})

module.exports.updateCriteria = asyncHandler(async (request, response) => {

    const { criteriaId, percent } = request.body
    if (!criteriaId || !percent) {
        response.status(400)
        throw new Error('Please add all fields')
    }
    const addCriteria = eventModel.findById(request.params.id)
        .then(event => {
            if (!event) {
                response.status(400)
                throw new Error('Event not found')
            }

            return eventModel.findByIdAndUpdate(request.params.id, {
                $push: {
                    criteria: {
                        criteriaId: criteriaId,
                        percent: percent,
                    }
                },
            })
        })
    response.status(200).json(addCriteria)
})

module.exports.updateParticipant = asyncHandler(async (request, response) => {
    const addParticipant = eventModel.findById(request.params.id)
        .then(event => {
            if (!event) {
                response.status(400)
                throw new Error('Event not found')
            }
            return eventModel.findByIdAndUpdate(request.params.id, {
                $push: { participant: { participantId: request.body.participantId } }
            })
        })
    response.status(200).json(addParticipant)
})