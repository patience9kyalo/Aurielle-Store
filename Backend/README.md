# Aurielle Backend

A robust Node.js/Express server for the Aurielle e-commerce platform, providing REST APIs for product management, user authentication, shopping cart, orders, payments, and real-time chat functionality.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via db config)
- **Cache**: Redis (for caching and sessions)
- **Payment Processing**: Stripe
- **File Storage**: Cloudinary (for image uploads)
- **Real-time Communication**: Socket.io
- **Email Service**: Email notifications via sendEmail utility

## Project Structure

```
src/
├── app.js                 # Express app configuration
├── socket.js              # Socket.io setup for real-time features
├── config/                # Configuration files
│   ├── cloudinary.js      # Cloudinary image storage config
│   ├── db.js              # MongoDB connection
│   ├── redis.js           # Redis cache config
│   └── stripe.js          # Stripe payment config
├── controllers/           # Business logic for each feature
│   ├── authController.js
│   ├── cartController.js
│   ├── categoryController.js
│   ├── chatController.js
│   ├── dashboardController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── productController.js
│   ├── reviewController.js
│   ├── searchController.js
│   └── wishlistController.js
├── routes/                # API route definitions
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── categoryRoutes.js
│   ├── chatRoutes.js
│   ├── dashboardRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   ├── reviewRoutes.js
│   └── wishlistRoutes.js
├── models/                # MongoDB schemas
│   ├── cartModel.js
│   ├── categoryModel.js
│   ├── orderModel.js
│   ├── productModel.js
│   ├── reviewModel.js
│   ├── userModel.js
│   └── wishlistModel.js
├── middleware/            # Express middleware
│   ├── authMiddleware.js  # JWT authentication
│   ├── cacheMiddleware.js # Redis caching
│   ├── errorMiddleware.js # Error handling
│   ├── uploadMiddleware.js # File upload handling
│   └── validateMiddleware.js # Request validation
├── validators/            # Request validation schemas
│   ├── cartValidator.js
│   ├── categoryValidator.js
│   ├── orderValidator.js
│   ├── productValidator.js
│   ├── reviewsValidator.js
│   ├── userValidator.js
│   └── wishlistValidator.js
├── utils/                 # Utility functions
│   ├── generateToken.js   # JWT token generation
│   ├── sendEmail.js       # Email notifications
│   └── smsService.js      # SMS notifications
├── jobs/                  # Background jobs
│   └── trackingpoll.js    # Order tracking updates
└── uploads/               # Uploaded files storage
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the Backend directory with the following:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_url
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   JWT_SECRET=your_jwt_secret
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_email_password
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start the server**:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The server will be running on `http://localhost:5000` by default.

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Password management
- Role-based access control

### Products
- Product creation, reading, updating, and deletion
- Category management
- Product search and filtering
- Image uploads via Cloudinary

### Shopping Cart
- Add/remove items from cart
- Cart persistence
- Cart validation

### Orders
- Order creation and management
- Order status tracking
- Order history

### Payments
- Stripe integration for payment processing
- Payment confirmation and handling

### Reviews & Ratings
- User reviews on products
- Rating system

### Wishlist
- Add/remove items from wishlist
- Wishlist management

### Chat
- Real-time messaging via Socket.io
- Chat history

### Dashboard
- Admin analytics and statistics
- Order and product management

### Caching
- Redis-based caching for improved performance

## API Routes

- `/api/auth` - Authentication endpoints
- `/api/products` - Product management
- `/api/categories` - Category management
- `/api/cart` - Shopping cart operations
- `/api/orders` - Order management
- `/api/payments` - Payment processing
- `/api/reviews` - Product reviews
- `/api/wishlist` - Wishlist management
- `/api/chat` - Chat functionality
- `/api/dashboard` - Admin dashboard
- `/api/search` - Product search

## Middleware

- **authMiddleware**: Protects routes requiring authentication
- **cacheMiddleware**: Caches responses in Redis
- **validateMiddleware**: Validates request data
- **uploadMiddleware**: Handles file uploads
- **errorMiddleware**: Centralized error handling

## Environment Requirements

- Node.js v14 or higher
- MongoDB database
- Redis server
- Cloudinary account (for image storage)
- Stripe account (for payments)

## Scripts

```bash
npm start      # Start production server
npm run dev    # Start development server with auto-reload
npm test       # Run tests (if configured)
```

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is private and proprietary to Aurielle.

## Support

For issues and questions, please contact the development team.
