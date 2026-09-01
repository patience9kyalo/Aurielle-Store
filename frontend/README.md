# Aurielle Frontend

A modern Next.js e-commerce web application providing a seamless shopping experience with product browsing, cart management, order processing, and real-time chat support.

## Tech Stack

- **Framework**: Next.js 13+ (with App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with React
- **State Management**: Zustand (cartStore, authStore, wishlistStore)
- **HTTP Client**: Axios (via api.js)
- **Styling Tool**: PostCSS
- **Package Manager**: npm or yarn

## Project Structure

```
app/
├── globals.css            # Global styles
├── layout.js              # Root layout wrapper
├── page.jsx               # Home page
├── login/
│   └── page.jsx           # User login
├── register/
│   └── page.jsx           # User registration
├── account/
│   └── page.jsx           # User account/profile
├── products/
│   ├── page.jsx           # Products listing
│   └── [id]/
│       └── page.jsx       # Product detail page
├── cart/
│   └── page.jsx           # Shopping cart
├── checkout/
│   └── page.jsx           # Checkout process
├── orders/
│   ├── page.jsx           # Orders listing
│   └── [id]/
│       └── page.jsx       # Order details
├── wishlist/
│   └── page.jsx           # Wishlist
├── admin/
│   ├── layout.jsx         # Admin layout
│   ├── page.jsx           # Admin dashboard
│   ├── products/
│   │   ├── page.jsx       # Manage products
│   │   ├── new/
│   │   │   └── page.jsx   # Create new product
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.jsx # Edit product
│   ├── categories/
│   │   └── page.jsx       # Manage categories
│   └── orders/
│       ├── page.jsx       # Manage orders
│       └── [id]/
│           └── page.jsx   # Order details
components/
├── admin/
│   ├── ProductForm.jsx    # Product form component
│   └── StatCard.jsx       # Statistics card component
├── cart/                  # Shopping cart components
├── chat/
│   └── chatWidget.jsx     # Chat widget for support
├── layout/
│   ├── Footer.jsx         # Site footer
│   └── Navbar.jsx         # Navigation bar
├── product/
│   ├── CategoryCard.jsx   # Category display card
│   └── ProductCard.jsx    # Product display card
└── ui/                    # Reusable UI components
lib/
├── api.js                 # API client configuration
└── types.js               # TypeScript/JS type definitions
store/
├── authStore.js           # Authentication state management
├── cartStore.js           # Shopping cart state
└── wishlistStore.js       # Wishlist state management
public/                    # Static assets
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:3000`.

## Features

### User Features
- **User Authentication**: Register, login, and account management
- **Product Browsing**: Browse products with filtering and search
- **Product Details**: View detailed product information and reviews
- **Shopping Cart**: Add/remove items, view cart summary
- **Checkout**: Complete purchase process
- **Order Management**: View order history and track orders
- **Wishlist**: Save favorite products for later
- **Reviews & Ratings**: Read and submit product reviews
- **Real-time Chat**: Connect with support via chat widget

### Admin Features
- **Dashboard**: View sales statistics and analytics
- **Product Management**: Create, edit, delete products
- **Category Management**: Manage product categories
- **Order Management**: View and manage all orders

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Landing page with featured products |
| Products | `/products` | Browse all products |
| Product Detail | `/products/[id]` | Single product view |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Purchase checkout |
| Login | `/login` | User login |
| Register | `/register` | User registration |
| Account | `/account` | User profile |
| Orders | `/orders` | Order history |
| Order Detail | `/orders/[id]` | Order details |
| Wishlist | `/wishlist` | Saved products |
| Admin Dashboard | `/admin` | Admin statistics |
| Manage Products | `/admin/products` | Product CRUD |
| Add Product | `/admin/products/new` | Create new product |
| Edit Product | `/admin/products/[id]/edit` | Edit existing product |
| Manage Categories | `/admin/categories` | Category management |
| Manage Orders | `/admin/orders` | Order management |

## State Management (Zustand)

### authStore
- User authentication state
- Login/logout functionality
- User profile data

### cartStore
- Shopping cart items
- Add/remove/update cart items
- Cart total calculations

### wishlistStore
- Saved wishlist items
- Add/remove from wishlist

## API Integration

The frontend communicates with the backend via REST APIs configured in [lib/api.js](lib/api.js).

**Base URL**: `http://localhost:5000/api`

API endpoints include:
- `/auth` - Authentication
- `/products` - Products
- `/categories` - Categories
- `/cart` - Shopping cart
- `/orders` - Orders
- `/payments` - Payments
- `/reviews` - Reviews
- `/wishlist` - Wishlist
- `/chat` - Chat
- `/dashboard` - Admin dashboard

## Styling

- **Tailwind CSS**: Utility-first CSS framework for styling
- **PostCSS**: CSS processing
- **Global Styles**: [app/globals.css](app/globals.css)

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run linting
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## Performance Optimization

- Next.js automatic code splitting
- Image optimization
- CSS minification
- Caching strategies

## License

This project is private and proprietary to Aurielle.

## Support

For issues and questions, please contact the development team.
