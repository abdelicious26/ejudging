const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"]
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"]
    },
    username: {
        type: String,
        required: [true, "username is required"],
        unique: [true, "username is already exists"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    recordType: {
        type: String
    },
    createdBy: {
        //immutable: true,
        type: String
    },
    updatedBy: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
        required: [true, "IsActive field is required"]
    }
},{
    timestamps: true,
})

module.exports = mongoose.model('User', UserSchema)