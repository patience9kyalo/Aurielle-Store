# Aurielle

Aurielle is a full-stack e-commerce platform for browsing products, managing carts and wishlists, placing and tracking orders, processing payments, and connecting customers with support through real-time chat.

The project is organized into two applications:

- **Frontend**: A Next.js web application for customers and administrators.
- **Backend**: A Node.js and Express API that provides business logic, persistence, authentication, payments, and real-time services.

## Technology Overview

### Frontend

- Next.js 15 with the App Router
- React 18
- Tailwind CSS and PostCSS
- Zustand for authentication, cart, and wishlist state
- Socket.io Client for real-time chat
- Recharts for dashboard visualizations

### Backend

- Node.js and Express
- MongoDB with Mongoose
- Redis for caching
- JWT authentication with role-based access control
- Stripe for payment processing
- Cloudinary and Multer for image uploads
- Socket.io for real-time communication
- Nodemailer and Africa's Talking for notifications
- Zod-based request validation

## Main Features

### Customer Experience

- Account registration, login, and profile management
- Product browsing, search, filtering, and product details
- Product categories, reviews, and ratings
- Shopping cart and checkout
- Stripe payment processing
- Wishlist management
- Order history and order tracking
- Real-time customer support chat

### Administration

- Sales statistics and dashboard analytics
- Product creation, editing, and deletion
- Category management
- Order review and status management
- Protected admin routes with role-based authorization

## Project Structure

```text
Aurielle/
├── Backend/
│   ├── server.js              # API server entry point
│   ├── src/
│   │   ├── app.js             # Express application setup
│   │   ├── socket.js           # Socket.io configuration
│   │   ├── config/             # Database and third-party services
│   │   ├── controllers/        # Feature business logic
│   │   ├── jobs/               # Background jobs
│   │   ├── middleware/         # Authentication, validation, caching, and errors
│   │   ├── models/             # MongoDB schemas
│   │   ├── routes/             # REST API routes
│   │   ├── utils/              # Shared utilities and notifications
│   │   └── validators/         # Request validation schemas
│   └── README.md               # Backend documentation
├── frontend/
│   ├── app/                    # Next.js pages and layouts
│   ├── components/             # Reusable UI components
│   ├── lib/                    # API client and shared types
│   ├── public/                 # Static assets
│   ├── store/                  # Zustand stores
│   └── README.md               # Frontend documentation
└── README.md                   # Project overview
```

## Prerequisites

- Node.js 14 or higher
- npm
- MongoDB
- Redis
- Cloudinary account for image storage
- Stripe account for payments

## Getting Started

Install and run the backend in one terminal:

```bash
cd Backend
npm install
npm run dev
```

Install and run the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

The applications are available at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Environment Configuration

Create `Backend/.env` with the backend service credentials:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

Create `frontend/.env.local` for frontend service URLs:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Use real credentials for external services when testing uploads, payments, email, SMS, or production integrations. Do not commit environment files or secrets.

## Development Commands

### Backend

```bash
npm start       # Start the API server
npm run dev     # Start with Nodemon auto-reload
npm test        # Run Jest tests
```

### Frontend

```bash
npm run dev     # Start the Next.js development server
npm run build   # Create a production build
npm start       # Serve the production build
npm run lint    # Run linting
```

## API Areas

The backend exposes API areas for authentication, products, categories, carts, orders, payments, reviews, wishlists, chat, search, and the admin dashboard. The frontend API client is defined in `frontend/lib/api.js`.

## Documentation

For implementation-specific details, see:

- [Backend README](Backend/README.md)
- [Frontend README](frontend/README.md)

## License

This project is private and proprietary to Aurielle.
