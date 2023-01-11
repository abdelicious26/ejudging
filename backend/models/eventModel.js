const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Event Name is required"]
    },
    description: {
        type: String
    },
    venue: {
        type: String,
        required: [true, "Venue is required"]
    },
    dateTime: {
        type: Date
    },
    createdBy: {
        //immutable: true,
        type: String
    },
    updatedBy: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true,
        required: [true, "IsActive field is required"]
    },
    scoringType: {
        type: String,
        required: [true, "Scoring Type field is required"]
    },
    IsOnGoing: {
        type: Boolean,
        default: false,
        required: [true, "IsOnGoing field is required"]
    },
    criteria: [{
        criteriaId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Criteria'
        },
        orderNumber: {
            type: Number
            // required: [true, "Order Number is required"]
        },
        percent: {
            type: Number,
            required: [true, "Percent is required"],
            min: 5,
            max: 100
        },
    }],
    judge: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }],
    participant: [{
        participantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Participant'
        },
        orderNumber: {
            type: Number
            // required: [true, "Order Number is required"]
        },
    }],

}, {
    timestamps: true,
})

module.exports = mongoose.model('Event', eventSchema)