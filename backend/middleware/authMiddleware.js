const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const userModel = require('../models/userModel')

const protect = asyncHandler(async (request, response, next) => {
    let token

    if (
        request.headers.authorization &&
        request.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = request.headers.authorization.split(' ')[1]

            // Verify token
            const decoded = jwt.verify(token, process.env.SECRET)

            // Get user from the token
            request.user = await userModel.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            console.log(error)
            response.status(401)
            throw new Error('Not authorized')
        }
    }

    if (!token) {
        response.status(401)
        throw new Error('Not authorized, no token')
    }
})

module.exports = { protect }