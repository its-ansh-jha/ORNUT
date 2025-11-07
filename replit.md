# Ornut Peanut Butter Ecommerce Website

## Overview
This project is a full-featured, production-ready e-commerce platform for Ornut, an artisanal peanut butter brand. It includes Firebase authentication, Cashfree payment integration, an admin panel for comprehensive management, and real-time order tracking. The platform is designed to provide a seamless shopping experience for customers and efficient management for administrators, all within a warm, branded aesthetic inspired by the Ornut squirrel mascot logo. The business vision is to provide a robust online presence for Ornut, capitalizing on market potential for premium food products with a user-friendly and secure platform.

## User Preferences
I prefer detailed explanations and clear communication. I want the agent to follow an iterative development process, making small, testable changes. Please ask for my approval before implementing any major architectural changes or feature additions. Do not make changes to the `server/storage.ts` or `server/db.ts` files without explicit instruction.

## System Architecture
The platform is built with a modern web stack: React, TypeScript, Tailwind CSS, and Shadcn UI for the frontend, and Express.js with PostgreSQL and Drizzle ORM for the backend. Firebase handles user authentication (Google Sign-in), while Cashfree is integrated for secure payments. Formspree is used for email notifications. State management on the frontend is managed by TanStack Query.

### UI/UX Decisions
The design adheres to a warm brown and cream color scheme, directly inspired by the Ornut brand and its squirrel logo. This palette is consistently applied across the UI, including a custom theme for Shadcn UI components. Typography uses Inter for all text, and spacing follows a consistent unit system (4, 6, 8, 12, 16, 24 units). The platform supports dark mode and is fully responsive. The logo is prominently featured in the navigation bar.

### Technical Implementations
- **Authentication**: Firebase is used for Google Sign-in. Server-side, Firebase ID tokens are verified for all authenticated endpoints, ensuring user isolation and ownership checks for data modifications. Admin authentication uses a separate password-based system with bcrypt hashing.
- **Payment Gateway**: Production-ready Cashfree integration (SDK v5+) handles payment session creation, verification, and webhook processing for automatic order status updates.
- **Order Management**: Comprehensive order tracking with delivery status updates (Order Placed, Processing, Shipped, In Transit, Out for Delivery, Delivered) and a 5-day return window.
- **Coupon System**: An admin-managed coupon system supports percentage or fixed-amount discounts, usage limits, minimum order values, and public/private visibility. Discounts are applied at checkout, and usage is tracked after successful payment.
- **Admin Panel**: A secure, password-protected dashboard for managing products, orders, returns, and coupons, including the ability to update delivery and return tracking.
- **Database Schema**: A PostgreSQL database manages `users`, `products`, `cartItems`, `wishlistItems`, `orders`, `orderItems`, `deliveryTracking`, `returns`, `returnTracking`, and `coupons`.
- **API Endpoints**: A well-defined set of RESTful APIs for authentication sync, product management, cart and wishlist operations, order creation and listing, return management, coupon validation, and all admin functionalities.
- **Email Notifications**: Order confirmation and payment success/failure emails are sent via Formspree.

### System Design Choices
- **Security**: Robust security measures include Firebase ID token verification, user ownership checks, and a secure admin authentication flow. Payment order creation and verification are handled server-side.
- **Scalability**: The modular architecture (client/server separation, Drizzle ORM) supports future scaling.
- **SEO**: Meta tags and Open Graph tags are implemented for improved search engine optimization.

## External Dependencies
- **Firebase**: For user authentication (Google Sign-in).
- **Cashfree**: For payment processing and secure transactions.
- **Formspree**: For sending email notifications (order confirmations, payment updates).
- **PostgreSQL**: The primary database for all application data.
- **Node.js**: Runtime environment for the backend.
- **React**: Frontend JavaScript library.
- **Express.js**: Backend web application framework.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Shadcn UI**: UI component library.
- **Drizzle ORM**: TypeScript ORM for PostgreSQL.
- **TanStack Query**: For data fetching, caching, and state management in the frontend.
- **bcryptjs**: For hashing admin passwords.