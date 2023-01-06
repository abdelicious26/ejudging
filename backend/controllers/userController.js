const userModel = require('../models/userModel');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

// @desc    Get all user records
// @route   GET /api/users/
// @access  Protected
module.exports.getAll = asyncHandler(async (request, response) => {
    const users = await userModel.find().sort({ firstName: 1, lastName: 1 })
    response.status(200).json(users)
})

// @desc    Get all users with that is judge and active
// @route   GET /api/users/active
// @access  Protected
module.exports.getAllActiveJudge = asyncHandler(async (request, response) => {
    const users = await userModel.find({ isActive: true, recordType: 'judge' }).sort({ firstName: 1, lastName: 1 })
    response.status(200).json(users)
})

// @desc    Update User details
// @route   PUT /api/users/update/:id
// @access  Protected
module.exports.update = asyncHandler(async (request, response) => {
    const user = await userModel.findById(request.params.id)
    if (!user) {
        response.status(400)
        throw new Error('User not found')
    }
    const { firstName, lastName, username, recordType, isActive } = request.body

    if (!firstName || !lastName || !username || !recordType) {
        response.status(400)
        throw new Error('Please add all fields')
    }

    const usernameExist = await userModel.find({ username: username })
    if (usernameExist.length > 0) {
        if (usernameExist[0]._id.toString() != request.params.id) {
            response.status(400)
            throw new Error('Username already exist')
        }
    }
    const updatedUser = await userModel.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
    })
    response.status(200).json(updatedUser)
})

// @desc    Change user's password
// @route   PUT /api/users/changepassword/:id
// @access  Protected
module.exports.changePassword = asyncHandler(async (request, response) => {
    const user = await userModel.findById(request.params.id)
    if (!user) {
        response.status(400)
        throw new Error('User not found')
    }
    const { oldPassword, newPassword } = request.body
    if (user && !(await bcrypt.compare(oldPassword, user.password))) {
        response.status(400)
        throw new Error('Old password is incorrect.')
    }
    // if(user.password != oldPassword){
    //     response.status(400)
    //     throw new Error('Old password is incorrect.')
    // }
    if (newPassword.length < 8) {
        response.status(400)
        throw new Error('Password should be at least 8 characters')
    }
    if (!newPassword) {
        response.status(400)
        throw new Error('Please add all fields')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    const updatedPassword = {
        password: hashedPassword
    }
    const updatedUser = await userModel.findByIdAndUpdate(request.params.id, updatedPassword, {
        new: true,
    })
    response.status(200).json(updatedUser)
})

// @desc    Reset user's password to default
// @route   PUT /api/users/resetpassword/:id
// @access  Protected
module.exports.resetPassword = asyncHandler(async (request, response) => {
    const user = await userModel.findById(request.params.id)
    if (!user) {
        response.status(400)
        throw new Error('User not found')
    }
    const { defaultPassword } = request.body
    if (!defaultPassword) {
        response.status(400)
        throw new Error('Please add all fields')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(defaultPassword, salt)
    const updatedPassword = {
        password: hashedPassword
    }
    const updatedUser = await userModel.findByIdAndUpdate(request.params.id, updatedPassword, { new: true, })
    response.status(200).json(updatedUser)
})

// @desc    Retrieve User's Details
// @route   GET /api/users/:id
// @access  Protected
module.exports.details = async (request, response) => {
    const user = await userModel.findById(request.params.id)
    if (!user) {
        response.status(400)
        throw new Error('User not found')
    }
    response.status(200).json(user)
};

// @desc    Register new user
// @route   POST /api/users/create
// @access  Public
module.exports.create = asyncHandler(async (request, response) => {
    const { firstName, lastName, username, recordType } = request.body
    const password = 'password1234'
    if (!firstName || !lastName || !username || !recordType) {
        response.status(400)
        throw new Error('Please add all fields')
    }
    // Check if user exists
    const userExists = await userModel.findOne({ username })
    if (userExists) {
        response.status(400)
        throw new Error('User already exists')
    }
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create user
    const user = await userModel.create({
        firstName,
        lastName,
        username,
        password: hashedPassword,
        recordType
    })

    if (user) {
        response.status(201).json({
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            token: generateToken(user._id),
        })
    } else {
        response.status(400)
        throw new Error('Invalid user data')
    }
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
module.exports.login = asyncHandler(async (request, response) => {
    const { username, password } = request.body
    // Check for user username
    const user = await userModel.findOne({ username })
    if (user && (await bcrypt.compare(password, user.password))) {
        response.json({
            _id: user.id,
            firstname: user.firstName,
            lastName: user.lastName,
            username: user.username,
            recordType: user.recordType,
            token: generateToken(user._id),
        })
    } else {
        response.status(400)
        console.log('ERROR ON LOGIN')
        throw new Error('Invalid credentials')
    }
})

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
module.exports.getMe = asyncHandler(async (request, response) => {
    response.status(200).json(request.user)
})

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: '30d',
    })
}