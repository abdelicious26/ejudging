const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    },
    criteria: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Criteria'
    },
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Participant'
    },
    judge: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
        require: true
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
    }
}, {
    timestamps: true,
})
module.exports = mongoose.model('Score', ScoreSchema);