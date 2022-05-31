const criteriaModel = require('../models/criteriaModel');
const asyncHandler = require('express-async-handler')

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

module.exports.getAll = asyncHandler(async (request, response) => {
    const criteria = await criteriaModel.find()
    response.status(200).json(criteria)
})

module.exports.getAllActive = asyncHandler(async (request, response) => {
    const criteria = await criteriaModel.find({isActive: true})
    response.status(200).json(criteria)
})


module.exports.getAllActive = asyncHandler(async (request, response) => {
    const criteria = await criteriaModel.find({isActive: true})
    response.status(200).json(criteria)
})

module.exports.detail = asyncHandler(async (request, response) => {
    const criteria = await criteriaModel.findById(request.params.id)
    response.status(200).json(criteria)
})

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
        if(criteriaExist[0]._id.toString() != request.params.id){
            response.status(400)
            throw new Error('Criteria name already exist')
        }
    }
    const updatedCriteria = await criteriaModel.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
    })
    response.status(200).json(updatedCriteria)
})