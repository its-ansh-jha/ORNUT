# Peanut Butter Ecommerce Website

## Overview
A full-featured ecommerce platform for selling artisanal peanut butter products with Firebase authentication, Cashfree payment integration, admin panel, order management, and delivery tracking.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, PostgreSQL, Drizzle ORM
- **Authentication**: Firebase (Google Sign-in)
- **Payment**: Cashfree
- **Email**: Formspree API
- **State Management**: TanStack Query

## Features
- Google authentication with Firebase
- Product catalog with search and filtering
- Shopping cart and wishlist
- Secure checkout with Cashfree
- Order tracking with delivery status updates
- Admin panel for product and order management
- Email notifications for orders via Formspree
- Responsive design with dark mode
- SEO optimized

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, Footer)
│   │   ├── lib/           # Auth context, Firebase config, query client
│   │   ├── pages/         # All page components
│   │   └── index.css      # Tailwind + design tokens
├── server/
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database storage layer
│   └── db.ts              # Database connection
└── shared/
    └── schema.ts          # Database schema & TypeScript types
```

## Database Schema
- **users**: Firebase authenticated users
- **products**: Product catalog (name, price, category, image, stock)
- **cartItems**: User shopping cart
- **wishlistItems**: User wishlist
- **orders**: Order records with shipping/contact details
- **orderItems**: Line items for each order
- **deliveryTracking**: Delivery status updates with timestamps

## API Endpoints
- `/api/auth/sync` - Sync Firebase user to database
- `/api/products` - Get all products
- `/api/cart` - Cart CRUD operations
- `/api/wishlist` - Wishlist CRUD operations
- `/api/orders` - Create and list orders
- `/api/admin/login` - Admin authentication
- `/api/admin/products` - Product management
- `/api/admin/orders` - Order management with delivery updates

## Environment Variables
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_CASHFREE_APP_ID` - Cashfree app ID
- `VITE_FORMSPREE_FORM_ID` - Formspree form ID
- `ADMIN_PASSWORD_HASH` - Hashed admin password (32-64 chars)
- `SESSION_SECRET` - Express session secret
- `DATABASE_URL` - PostgreSQL connection string

## Design System
- **Colors**: Green and white theme (primary: hsl(142 76% 36%))
- **Typography**: Plus Jakarta Sans (headings), Inter (body)
- **Spacing**: Consistent 4, 6, 8, 12, 16, 24 units
- **Components**: Shadcn UI with custom green theme

## Admin Panel
- Protected by 32-64 character password
- Dashboard with stats (orders, revenue, products, deliveries)
- Product management (add, edit, delete products with images)
- Order management with delivery status updates
- Updates tracked locations and messages for customer tracking

## Delivery Status Flow
1. Order Placed
2. Processing
3. Shipped
4. In Transit (with location updates)
5. Out for Delivery
6. Delivered

## Recent Changes
- Initial implementation completed with all MVP features
- Firebase authentication integrated
- Admin panel with product and order management
- Order tracking system with delivery updates
- SEO meta tags added to all pages
