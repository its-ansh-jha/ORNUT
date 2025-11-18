# ORNUT - Premium Peanut Butter E-commerce Platform

A full-featured, production-ready e-commerce platform for Ornut artisanal peanut butter, built with React, TypeScript, Express, and PostgreSQL.

## 🌟 Features

### Customer Features
- **Product Browsing**: Browse premium peanut butter products with detailed information
- **Shopping Cart**: Add products to cart with quantity management
- **Wishlist**: Save favorite products for later
- **User Authentication**: Secure Google Sign-in with Firebase
- **Order Management**: Place orders and track delivery status
- **Payment Integration**: Secure payments via Cashfree
- **SEO Optimized**: Product pages with meta tags and structured data
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### Admin Features
- **Product Management**: Add, edit, and manage products
- **Order Management**: View and update order status
- **Delivery Tracking**: Update delivery status and tracking information
- **Return Management**: Handle product returns
- **Coupon System**: Create and manage discount coupons
- **Dashboard**: Analytics and overview of store performance

## 🛠️ Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + Shadcn UI
- TanStack Query for state management
- Wouter for routing
- React Helmet Async for SEO
- Framer Motion for animations

### Backend
- Express.js
- PostgreSQL with Drizzle ORM
- Firebase Admin SDK for authentication
- Cashfree for payments
- Formspree for email notifications

## 📋 Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15+
- Firebase project (for authentication)
- Cashfree account (for payments)
- Formspree account (for emails)

## 🚀 Quick Start

### Local Development (Replit)

1. **Clone the repository**
   ```bash
   git clone https://github.com/its-ansh-jha/ORNUT.git
   cd ORNUT
   ```

2. **Set environment variables in Replit Secrets**
   - Add all required secrets (see `.env.example`)

3. **Install dependencies**
   - Dependencies are auto-installed in Replit

4. **Run the application**
   ```bash
   npm run dev
   ```

### EC2 Production Deployment

For detailed EC2 deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick deployment:**

1. **Setup environment**
   ```bash
   cp .env.example .env
   nano .env  # Add your credentials
   ```

2. **Run deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

The script will:
- Install dependencies
- Setup database schema
- Build the application
- Start with PM2 process manager

## 📁 Project Structure

```
ORNUT/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
│   └── index.html
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── env.ts            # Environment configuration
│   └── vite.ts           # Vite dev server setup
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema and Zod types
├── attached_assets/     # Product images and assets
├── .env.example         # Environment variables template
├── deploy.sh            # EC2 deployment script
└── DEPLOYMENT.md        # Detailed deployment guide
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Session
SESSION_SECRET=your-session-secret

# Firebase (Client)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase (Admin)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cashfree
CASHFREE_APP_ID=your-app-id
CASHFREE_SECRET_KEY=your-secret-key
CASHFREE_ENV=SANDBOX  # or PRODUCTION

# Formspree
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id

# Admin
ADMIN_PASSWORD_HASH=your-bcrypt-hash

# Server
NODE_ENV=production
PORT=5000
```

### Database Schema

Push the schema to your database:

```bash
npm run db:push
```

For production with potential data loss warnings:

```bash
npm run db:push -- --force
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database

# Type checking
npm run check        # Run TypeScript type checker
```

## 🔐 Security Features

- Firebase Authentication with token verification
- Bcrypt password hashing for admin panel
- User ownership validation for all operations
- HTTPS/SSL support with Let's Encrypt
- CSRF protection
- Environment variable validation
- Secure session management

## 📧 Email Notifications

The application sends email notifications for:
- Order confirmations
- Payment success/failure
- Delivery updates

Configure Formspree endpoint in environment variables.

## 💳 Payment Integration

Cashfree payment integration supports:
- Secure payment session creation
- Payment verification
- Webhook handling for automatic status updates
- Sandbox and production environments

## 🎨 Design System

The application uses a warm brown and cream color scheme inspired by the Ornut brand:

- Primary Color: `#D97632` (Warm Orange)
- Typography: Inter font family
- Spacing: 4, 6, 8, 12, 16, 24px units
- Components: Shadcn UI with custom theming

See [design_guidelines.md](./design_guidelines.md) for detailed design specifications.

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔍 SEO Optimization

- Dynamic meta tags with React Helmet
- Open Graph and Twitter Card tags
- JSON-LD structured data
- SEO-friendly URLs with product slugs
- Optimized for high-value keywords

## 🚢 Deployment Options

### 1. Amazon EC2
Detailed guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

### 2. Replit
- Push code to Replit
- Add secrets
- Click Run

### 3. Other Platforms
Compatible with any Node.js hosting platform:
- Heroku
- DigitalOcean App Platform
- Railway
- Render

## 🐛 Troubleshooting

### Common Issues

**Application won't start**
- Verify all environment variables are set
- Check database connection
- Review logs for specific errors

**Database connection errors**
- Verify DATABASE_URL format
- Ensure PostgreSQL is accessible
- Check firewall rules

**Payment not working**
- Verify Cashfree credentials
- Check CASHFREE_ENV setting
- Review webhook configuration

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Support

For issues and questions:
- Create an issue on GitHub
- Check logs: `pm2 logs ornut` (production)
- Review documentation in DEPLOYMENT.md

## 🔄 Updates and Maintenance

To update the application:

```bash
git pull origin main
npm install
npm run build
npm run db:push
pm2 restart ornut
```

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ for Ornut - Premium Artisanal Peanut Butter
