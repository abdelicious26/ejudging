const scoreModel = require('../models/scoreModel');
const eventModel = require('../models/eventModel');
const asyncHandler = require('express-async-handler')

module.exports.getEvents = asyncHandler(async (request, response) => {
    console.log(request.user)
    const event = await eventModel.find({ "judge.userId": request.user._id, isActive: true }).sort({ dateTime: 1, name: 1, description: 1 })
    response.status(200).json(event)
    // return eventModel.find({ "judge.userId": userId, isActive: true }).then(events => {
    //     return events
    // })
});
// module.exports.getEvents = asyncHandler(async (request, response) => {
//     response.status(200).json(request.user)
// })


module.exports.detail = asyncHandler(async (request, response) => {
    const event = await eventModel.findById(request.params.id)
    if (!event) {
        response.status(400)
        throw new Error('Event does not exist')
    }
    response.status(200).json(event)
})

module.exports.score = asyncHandler(async (request, response) => {
    const myScore = await scoreModel.find({ judge: request.user._id, event: request.params.id })
    if (!myScore) {
        response.status(400)
        throw new Error('Event does not exist')
    }
    response.status(200).json(myScore)
})


module.exports.create = asyncHandler(async (request, response) => {
    const { criteria, participant, score } = request.body

    if (!criteria || !participant || !score) {
        response.status(400)
        throw new Error('Please add all fields')
    }
    let details = new scoreModel({
        event: request.params.id,
        criteria: criteria,
        participant: participant,
        judge: request.user._id
    })
    let saveScore = {
        score: score
    }
    let query = { 'event': details.event, 'criteria': details.criteria, 'participant': details.participant, 'judge': details.judge };
    let updatedScore = scoreModel.findOneAndUpdate(query, saveScore, { new: true, upsert: true }).then(res => {
        return res;
    })
    response.status(200).json(updatedScore)
});