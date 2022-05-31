const mongoose = require('mongoose');

const CriteriaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Criteria Name is required"]
    },
    description: {
        type: String
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
},{
    timestamps: true,
})

module.exports = mongoose.model('Criteria', CriteriaSchema)