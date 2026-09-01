const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

let io = null

// Called once from server.js with the raw http server (not the Express
// app) - Socket.IO needs to sit alongside Express on the same server,
// not run as a separate service.
const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    })

    // Auth handshake: the frontend connects with
    // io(URL, { auth: { token: '<jwt>' } }) using the same token it
    // already gets from login - no separate auth system needed.
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token
            if (!token) return next(new Error('Authentication required'))

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById(decoded._id).select('role')

            if (!user) return next(new Error('User not found'))

            socket.userId = decoded._id.toString()
            socket.userRole = user.role
            next()
        } catch (err) {
            next(new Error('Authentication failed'))
        }
    })

    io.on('connection', (socket) => {
        // Private room per user - order updates only ever get sent here,
        // never broadcast to everyone.
        socket.join(`user:${socket.userId}`)

        // Admins also join a shared room so an admin dashboard can show
        // live order activity across all customers.
        if (socket.userRole === 'admin') {
            socket.join('admins')
        }

        console.log(`Socket connected: user ${socket.userId} (${socket.userRole})`)

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: user ${socket.userId}`)
        })
    })

    return io
}

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized - call initSocket(httpServer) first in server.js')
    }
    return io
}

const emitOrderUpdate = (userId, payload) => {
    if (!io) return
    io.to(`user:${userId}`).emit('order:update', payload)
    io.to('admins').emit('order:update', payload)
}

module.exports = { initSocket, getIO, emitOrderUpdate }