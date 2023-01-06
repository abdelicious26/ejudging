const participantModel = require('../models/participantModel');
const asyncHandler = require('express-async-handler')

// @desc    Create participant record
// @access  Protected
module.exports.create = asyncHandler(async (request, response) => {
    const { name, description } = request.body
    if (!name) {
        response.status(400)
        throw new Error('Please add all fields')
    }
    const participantExist = await participantModel.findOne({ name })
    if (participantExist) {
        response.status(400)
        throw new Error('Participant name already exists')
    }
    const participant = await participantModel.create({
        name: name,
        description: description
    })
    response.status(200).json(participant)
});

// @desc    Get all participant Records
// @access  Protected
module.exports.getAll = asyncHandler(async (request, response) => {
    const participant = await participantModel.find().sort({ name: 1, description: 1 })
    response.status(200).json(participant)
})

// @desc    Get all active participants Records
// @access  Protected
module.exports.getAllActive = asyncHandler(async (request, response) => {
    const participant = await participantModel.find({ isActive: true }).sort({ name: 1, description: 1 })
    response.status(200).json(participant)
})

// @desc    Get participant Detail
// @access  Protected
module.exports.detail = asyncHandler(async (request, response) => {
    const participant = await participantModel.findById(request.params.id)
    response.status(200).json(participant)
})

// @desc    Update Participant Details
// @access  Protected
module.exports.update = asyncHandler(async (request, response) => {
    const participant = await participantModel.findById(request.params.id)
    if (!participant) {
        response.status(400)
        throw new Error('Participant not found')
    }
    const { name, description, isActive } = request.body

    if (!name) {
        response.status(400)
        throw new Error('Please add all fields')
    }
    const participantExist = await participantModel.find({ name: name })
    if (participantExist.length > 0) {
        if (participantExist[0]._id.toString() != request.params.id) {
            response.status(400)
            throw new Error('Participant name already exist')
        }
    }
    const updatedParticipant = await participantModel.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
    })
    response.status(200).json(updatedParticipant)
})