# Ornut Peanut Butter Ecommerce Website

## Overview
A full-featured ecommerce platform for Ornut - premium artisanal peanut butter brand. Features include Firebase authentication, production-ready Cashfree payment integration, admin panel, order management, and real-time delivery tracking. Designed with warm brown and cream brand colors inspired by the Ornut squirrel mascot logo.

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
- `VITE_CASHFREE_APP_ID` - Cashfree app ID for frontend SDK
- `VITE_CASHFREE_MODE` - "production" or "sandbox" (defaults to sandbox)
- `CASHFREE_APP_ID` - Cashfree app ID for backend API
- `CASHFREE_SECRET_KEY` - Cashfree secret key for backend API
- `VITE_FORMSPREE_FORM_ID` - Formspree form ID
- `ADMIN_PASSWORD_HASH` - Hashed admin password (32-64 chars)
- `SESSION_SECRET` - Express session secret
- `DATABASE_URL` - PostgreSQL connection string

## Design System
- **Colors**: Warm brown and cream theme inspired by Ornut logo
  - Primary Brown: hsl(30 35% 44%) - #8B6F47
  - Cream: hsl(36 48% 91%) - #F5E6D3
  - Accent Tan: hsl(24 28% 58%) - #B89968
  - Full palette defined in client/src/index.css with dark mode support
- **Typography**: Inter (all text)
- **Spacing**: Consistent 4, 6, 8, 12, 16, 24 units
- **Components**: Shadcn UI with custom Ornut brown/cream theme
- **Logo**: Circular squirrel logo integrated in navbar

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

## Security Implementation

### Firebase Authentication
- **ID Token Verification**: All authenticated endpoints verify Firebase ID tokens using Firebase REST API
- **User Isolation**: User ID derived exclusively from verified token (not client-provided headers)
- **Ownership Checks**: Cart, wishlist, and order operations verify user ownership before allowing modifications
- **Admin Authentication**: Separate password-based auth with bcrypt for admin panel

### Authentication Flow
1. User signs in with Google via Firebase
2. Client obtains Firebase ID token via `user.getIdToken()`
3. Client sends token in `X-Firebase-Token` header
4. Server verifies token with Firebase API and extracts user ID
5. All downstream operations use verified user ID

### Admin Security
- Password must be 32-64 characters (enforced on both client and server)
- Password hashed with bcrypt (stored in `ADMIN_PASSWORD_HASH` env var)
- Admin password sent in `X-Admin-Token` header for admin API requests
- All admin endpoints protected by `verifyAdmin` middleware

## How to Use

### For Customers
1. **Browse Products**: Visit homepage and click "Shop Now" to see catalog
2. **Search & Filter**: Use search bar or category filters to find products
3. **Sign In**: Click "Sign In" button to authenticate with Google
4. **Add to Cart**: Browse products, select quantity, and add to cart
5. **Add to Wishlist**: Save favorite products to wishlist for later
6. **Checkout**: Fill out shipping address and contact details, then place order
7. **Track Orders**: View order history and track delivery status in real-time

### For Administrators
1. **Login**: Navigate to `/admin/login` and enter 32-64 character password
2. **View Dashboard**: See key metrics (total orders, revenue, products, pending deliveries)
3. **Manage Products**: Add, edit, or delete products with images and details
4. **Manage Orders**: View all orders and update delivery status
5. **Track Deliveries**: Add tracking updates with status, location, and messages

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project with Google sign-in enabled
- Cashfree account (for payment integration)
- Formspree account (for email notifications)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see Environment Variables section)
4. Push database schema: `npm run db:push`
5. Seed initial data: `npx tsx server/seed.ts`
6. Start development server: `npm run dev`

### Generating Admin Password Hash
To create a new admin password hash:
```javascript
import bcrypt from 'bcryptjs';
const password = "your-32-to-64-character-password-here";
const hash = await bcrypt.hash(password, 10);
console.log(hash); // Copy this to ADMIN_PASSWORD_HASH env var
```

## Payment Integration (Cashfree)
**Production-Ready Cashfree Integration (SDK v5+):**

### Backend (`server/routes.ts`):
Uses **cashfree-pg v5+** with proper SDK initialization:

```javascript
const cashfree = new Cashfree(
  process.env.NODE_ENV === "production" ? Cashfree.PRODUCTION : Cashfree.SANDBOX,
  cashfreeAppId,
  cashfreeSecretKey
);
```

**API Endpoints:**
- `POST /api/payment/create-order` - Creates Cashfree payment session
  - Calculates order total with shipping
  - Creates order in database with "payment_pending" status
  - Generates Cashfree order using `cashfree.PGCreateOrder(request)`
  - Returns `payment_session_id` and `order_id` to frontend
  - Sends order confirmation email via Formspree
  
- `POST /api/payment/verify` - Verifies payment status
  - Fetches order status using `cashfree.PGFetchOrder(orderId)`
  - Updates database order status to "confirmed" if PAID
  - Clears user's cart after successful payment
  - Sends payment confirmation email
  - Returns verification result

- `POST /api/payment/webhook` - Cashfree webhook handler
  - Receives payment notifications from Cashfree
  - Automatically updates order status when payments succeed/fail
  - Sends email notifications via Formspree
  - **Webhook URL for Cashfree Dashboard**: `https://your-domain.replit.dev/api/payment/webhook`

### Frontend (`client/src/pages/checkout.tsx`):
Uses **@cashfreepayments/cashfree-js** SDK:

```javascript
const cashfree = await load({ mode: "sandbox" }); // or "production"
const result = await cashfree.checkout({
  paymentSessionId: sessionId,
  redirectTarget: "_modal"
});
```

- Initializes Cashfree SDK with configurable mode (sandbox/production)
- Opens Cashfree checkout modal for payment
- Handles payment success/failure
- Verifies payment with backend before confirmation
- Shows loading states and user feedback

### Configuration:
- **Production Mode** (current setup): For real transactions
  - Backend: Always uses `CFEnvironment.PRODUCTION` 
  - Frontend: Always uses production mode
  - Set `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` with production credentials in Replit Secrets
  - **Configure Webhook in Cashfree Dashboard**:
    1. Go to Cashfree Dashboard > Developers > Webhooks
    2. Add webhook URL: `https://your-app-domain.replit.dev/api/payment/webhook`
    3. Select events: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`
  - Uses official Cashfree SDK response pattern: `response.data.payment_session_id`

**Note**: This integration follows the official [Cashfree Web Integration Guide](https://www.cashfree.com/docs/payments/online/web/redirect) for production deployments.

### Environment Variables:
- `CASHFREE_APP_ID` - Backend API client ID (x-client-id) - Production credentials
- `CASHFREE_SECRET_KEY` - Backend API secret (x-client-secret) - Production credentials

### Security:
- Payment order creation and verification done server-side
- Customer data validated before creating order
- Order status updates only after successful Cashfree payment verification
- Cart cleared only after payment confirmation
- Email notifications sent for both order creation and payment confirmation

## Email Notifications (Formspree)
Order confirmation emails are sent via Formspree:
- Triggered when order is placed
- Includes order number, items, customer details, and total
- Formspree form ID configured in environment variables

## Known Limitations
1. **Admin Password Storage**: Admin password stored in sessionStorage (XSS risk). Consider implementing server-issued session tokens for production.
2. **Cashfree Integration**: Payment flow requires additional Cashfree SDK integration
3. **Firebase Admin SDK**: Currently using Firebase REST API for token verification (production should use Admin SDK with service account)

## Recent Changes (November 2025)
- ✅ **Complete UI Redesign**: Warm brown/cream Ornut brand colors replacing green theme
- ✅ **Branding Update**: Integrated Ornut logo, changed all text to "ORNUT" brand name
- ✅ **Order Numbers**: Changed prefix from "PB..." to "ORNUT..." for brand consistency
- ✅ **Navigation**: Added admin login link to navbar (desktop & mobile)
- ✅ **Cashfree Payment Integration**: Production-ready payment system with SDK v5+
  - Backend endpoints for order creation and payment verification
  - Frontend SDK integration with configurable sandbox/production mode
  - **Secure webhook with HMAC signature verification** using `PGVerifyWebhookSignature`
  - Automatic order status updates via Cashfree webhooks
  - Email notifications via Formspree for orders and payments
  - Fixed SDK v5+ response handling (direct field access without `.data` wrapper)
- ✅ **Design Guidelines**: Created comprehensive design_guidelines.md for Ornut theme
- ✅ Complete ecommerce platform with all MVP features
- ✅ Secure Firebase authentication with ID token verification
- ✅ Admin panel with product and order management  
- ✅ Order tracking system with delivery status updates
- ✅ PostgreSQL database with complete schema
- ✅ User ownership checks on all protected endpoints
- ✅ SEO meta tags and Open Graph tags
- ✅ Responsive design with dark mode support
