const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const cartRoutes = require('./routes/cartRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const chatRoutes = require('./routes/chatRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const { stripeWebhook } = require('./controllers/paymentController')

const app = express()

// 1. PLACE STRIPE WEBHOOK FIRST (Using raw body parser)
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook)

// 2. CONSOLIDATED BODY PARSERS WITH A BACKUP BUFFER FOR SAFETY
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    if (req.originalUrl.includes('/webhook')) {
      req.rawBody = buf; // Backup container for Stripe SDK validation
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  next();
});

const mongoSanitize = require('express-mongo-sanitize');

// Security middleware
// Security middleware
app.use(mongoSanitize())
app.use(helmet())

// CORS configuration (UPDATED FOR DYNAMIC RECOGNITION)
const allowedOrigins = [
  'http://localhost:3000',
  'https://aurielle-store-5enm.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean); // Filters out any undefined environment values safely

app.use(
  cors({
    origin: function (origin, callback) {
      // 1. Allow internal requests or utilities like Postman (no origin)
      if (!origin) return callback(null, true);
      
      // 2. Match hardcoded origins OR trust any dynamic Vercel deployment subdomain
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);


// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', limiter)

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API routes (Removed duplicated app.use(express.json()) call here)
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/support/chat', chatRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Aurielle API',
    version: '1.0.0',
  });
});

// Error handling middleware (must be last)
app.use(notFound)
app.use(errorHandler)

module.exports = app
