const dotenv = require('dotenv');
dotenv.config();

const http = require('http')
const express = require('express');
const connectDB = require('./src/config/db');
const app = require('./src/app')
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes')
const orderRoutes = require('./src/routes/orderRoutes')
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware')
const { initSocket } = require('./src/socket')
const { startTrackingPollJob } = require('./src/jobs/trackingpoll')

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...')
  console.error(err.name, err.message)
  process.exit(1)
})

connectDB();

const PORT = process.env.PORT || 5000

// Socket.IO needs the raw http server, not the Express app directly -
// this lets HTTP requests and websocket connections share one server.

const httpServer = http.createServer(app)
initSocket(httpServer)

const server = httpServer.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
})

startTrackingPollJob()

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...')
  console.error(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('Process terminated')
  })
})