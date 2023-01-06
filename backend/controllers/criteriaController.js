const criteriaModel = require('../models/criteriaModel');
const asyncHandler = require('express-async-handler')

// @desc    Create new Criteria Record
// @access  Protected
module.exports.create = asyncHandler(async (request, response) => {
    const { name, description } = request.body
    if (!name) {
        response.status(400)
        throw new Error('Please add all fields')
    }
    const criteriaExist = await criteriaModel.findOne({ name })
    if (criteriaExist) {
        response.status(400)
        throw new Error('Criteria name already exists')
    }
    const criteria = await criteriaModel.create({
        name: name,
        description: description
    })
    response.status(200).json(criteria)
});

// @desc    get all criteria records
// @access  Protected
module.exports.getAll = asyncHandler(async (request, response) => {
    const criteria = await criteriaModel.find().sort({ name: 1, description: 1 })
    response.status(200).json(criteria)
})

// @desc    get all active criteria records
// @access  Protected
module.exports.getAllActive = asyncHandler(async (request, response) => {
    const criteria = await criteriaModel.find({ isActive: true }).sort({ name: 1, description: 1 })
    response.status(200).json(criteria)
})

// @desc    get criteria details
// @access  Protected
module.exports.detail = asyncHandler(async (request, response) => {
    const criteria = await criteriaModel.findById(request.params.id)
    response.status(200).json(criteria)
})

// @desc    update criteria details
// @access  Protected
module.exports.update = asyncHandler(async (request, response) => {
    const criteria = await criteriaModel.findById(request.params.id)
    if (!criteria) {
        response.status(400)
        throw new Error('Criteria not found')
    }
    const { name, description, isActive } = request.body

    if (!name) {
        response.status(400)
        throw new Error('Please add all fields')
    }
    const criteriaExist = await criteriaModel.find({ name: name })
    if (criteriaExist.length > 0) {
        if (criteriaExist[0]._id.toString() != request.params.id) {
            response.status(400)
            throw new Error('Criteria name already exist')
        }
    }
    const updatedCriteria = await criteriaModel.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
    })
    response.status(200).json(updatedCriteria)
})