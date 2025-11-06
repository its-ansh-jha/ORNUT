# Design Guidelines for Peanut Butter Ecommerce Website

## Design Approach
**Reference-Based**: Drawing inspiration from modern ecommerce leaders (Shopify, Etsy, Amazon) with emphasis on product showcase and seamless checkout experience. The green and white color scheme (to be implemented later) aligns with natural, organic peanut butter branding.

## Typography System
- **Primary Font**: Plus Jakarta Sans (Google Fonts) - modern, friendly, approachable
- **Secondary Font**: Inter (Google Fonts) - clean for body text and data
- **Hierarchy**:
  - Hero Headlines: text-5xl to text-6xl, font-bold
  - Section Headers: text-3xl to text-4xl, font-semibold
  - Product Titles: text-xl, font-semibold
  - Body Text: text-base, font-normal
  - Labels/Meta: text-sm, font-medium
  - Buttons: text-base, font-semibold

## Layout & Spacing System
**Tailwind Units**: Standardize on 4, 6, 8, 12, 16, 24 for consistent rhythm
- Section padding: py-16 md:py-24
- Component spacing: gap-8 or gap-12
- Card padding: p-6 or p-8
- Container: max-w-7xl mx-auto px-4

## Page Structure & Components

### Homepage
1. **Hero Section** (with large hero image)
   - Full-width banner showcasing peanut butter jars in natural setting
   - Prominent headline emphasizing product quality
   - Primary CTA buttons with backdrop-blur-md background
   - Trust indicators (delivery info, ratings)

2. **Featured Products Grid**
   - 3-column grid (lg:grid-cols-3 md:grid-cols-2)
   - Product cards with image, title, price, quick-add button
   - Wishlist heart icon (top-right corner)

3. **Why Choose Us**
   - 4-column feature highlights (ingredients, process, sustainability, taste)
   - Icon + title + description format

4. **Customer Testimonials**
   - 3-column testimonial cards with customer photos
   - Star ratings and purchase verification badges

5. **FAQ Section**
   - Accordion-style expandable questions
   - Categories: Product, Delivery, Payment, Returns

### Product Catalog Page
- Filter sidebar (categories, price range, dietary tags)
- Grid view with 3-4 products per row
- Search bar with autocomplete suggestions (Heroicons magnifying glass)
- Sort dropdown (price, popularity, newest)
- Product cards: hover effect showing "Quick View" and "Add to Wishlist"

### Product Detail Page
- 2-column layout (image gallery left, details right)
- Image gallery with thumbnails and zoom on hover
- Product title, price, ratings, reviews count
- Quantity selector with + / - buttons
- Add to Cart (primary) and Add to Wishlist (secondary outline) buttons
- Tabs: Description, Nutritional Info, Reviews, Shipping
- Related Products carousel at bottom

### Shopping Cart
- Line items with product image, title, price, quantity controls
- Running total with subtotal, shipping estimate, taxes
- Promo code input field
- Sticky "Proceed to Checkout" button
- Continue Shopping link
- Empty cart state with illustration and CTA

### Wishlist Page
- Grid layout similar to catalog
- "Move to Cart" button on each item
- Share wishlist functionality

### Checkout Flow
- Multi-step progress indicator (Cart → Shipping → Payment → Confirmation)
- Form sections with clear labels and validation
- Address autocomplete integration
- Cashfree payment iframe embed
- Order summary sidebar (sticky on desktop)

### Order Tracking Page
- Order number search input
- Timeline visualization with status updates:
  - Order Placed → Processing → Shipped → In Transit → Out for Delivery → Delivered
- Estimated delivery date
- Live location updates display
- Contact support button

### User Account Dashboard
- Sidebar navigation: Orders, Wishlist, Addresses, Profile
- Order history table with status badges
- Saved addresses with edit/delete actions
- Profile settings form

### Admin Panel
- Login page with password field (32-64 character requirement messaging)
- Dashboard with metrics cards (orders today, revenue, pending deliveries)
- Product management table with add/edit/delete actions
- Order management: filterable table with customer details, delivery status dropdown
- Rich text editor for product descriptions
- Image upload with preview for product photos

## Component Library

### Navigation
- Sticky header with logo, search bar, account/cart icons
- Mega menu for product categories on hover
- Mobile: hamburger menu with slide-out drawer
- Cart icon with item count badge
- Wishlist icon with count

### Buttons
- Primary: Rounded corners (rounded-lg), medium padding (px-6 py-3)
- Secondary: Outline style with border
- Icon buttons: Square with padding-3, rounded-full for circular
- Backdrop blur on buttons over images

### Cards
- Product cards: rounded-xl, shadow-sm on hover
- Testimonial cards: rounded-lg with subtle border
- Admin dashboard cards: rounded-lg with header divider

### Forms
- Input fields: rounded-lg, border with focus ring
- Labels: text-sm font-medium, positioned above inputs
- Validation: inline error messages in red, success states with checkmark
- Search bar: rounded-full with icon prefix

### Icons
**Heroicons** (outline style for general UI, solid for emphasis):
- Shopping cart, heart (wishlist), magnifying glass (search)
- User, truck (delivery), check-circle (success)
- Chevrons for navigation, x-mark for close

### Data Display
- Order tables: striped rows, sticky header
- Status badges: rounded-full pills with dot indicator
- Progress indicators: stepped timeline with connecting lines

### Overlays
- Modals: centered with backdrop, rounded-xl, max-w-lg
- Toast notifications: top-right corner, auto-dismiss
- Image lightbox for product gallery zoom

## Images
1. **Hero Image**: Wide shot of peanut butter jars arranged with fresh peanuts, wooden surface, natural lighting - conveys artisanal quality
2. **Product Images**: Clean white background shots, consistent aspect ratio (square), high-resolution for zoom
3. **Lifestyle Images**: Peanut butter in use (on toast, in smoothies), creates emotional connection
4. **Customer Testimonial Photos**: Authentic user photos increase trust
5. **About/Process Images**: Behind-the-scenes production, ingredient sourcing

## Animations
Minimal and purposeful only:
- Smooth page transitions
- Cart item add: brief scale animation
- Hover states: subtle elevation on cards
- Loading states: skeleton screens for product grids

## Mobile Responsiveness
- Stack all columns to single column on mobile
- Bottom navigation bar for cart/account/wishlist on mobile
- Collapsible filters on catalog page
- Touch-friendly buttons (min height 44px)
- Swipeable product image galleries