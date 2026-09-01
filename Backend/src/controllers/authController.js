const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const sendEmail = require('../utils/sendEmail')

const generateToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

//Register a new user

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body

    //Check if user exists

    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    // const salt = await bcrypt.genSalt(10)
    // const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
        name,
        email,
        password,
        phone,
    })

    if (user) {

        //Send a welcome email

        try {
            await sendEmail({
                email: user.email,
                subject: 'Welcome to Aurielle',
                message: `Hi ${user.name},\n\nThank you for registering! Start shopping now. `,
            })
        } catch (error) {
            console.log('Email sending failed', error.message)
        }

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            },
            message: 'Registration Successful',
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

//Authenticate a user and get token

const authUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    //find user and include password field

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        res.status(401)
        throw new Error('Invalid email or password')
    }

    console.log("Comparing inputs -> Password length:", password?.length, "Hash found:", !!user.password)

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
        res.status(401)
        throw new Error('Invalid email or password')
    }

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        },
        message: 'Login Successful',
    })
})

//Get user profile

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        res.json({
            success: true,
            data: user,
        })
    } else {
        res.status(400)
        throw new Error('User not found')
    }
})

//Update user profile

const updateUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id)

    if (user) {
        user.name = req.body.name ?? user.name
        user.email = req.body.email ?? user.email
        user.phone = req.body.phone ?? user.phone

        if (req.body.password) {
            user.password = req.body.password
        }

        const updatedUser = await user.save()

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            },
            message: 'Update Successful'
        })
    } else {
        res.status(400)
        throw new Error('User not found')
    }

})

//Get all users (admin only)

const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({})
    res.json(users)
})

//Delete user (admin only)

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params._id)

    if (user) {
        await user.deleteOne()
        res.json({ message: 'User removed' })
    } else {
        res.status(400)
        throw new Error('User not found')
    }
})

//Get user by ID (admin only)

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params._id).select('-password')

    if (!user) {
        res.status(400)
        throw new Error('User not found')
    }

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        },
    })
})

const logoutUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id)

    res.json({
        success: true,
        message: 'Logged out successfully'
    })
})

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    logoutUser,
}