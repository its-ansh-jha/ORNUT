# Design Guidelines for Ornut Peanut Butter Ecommerce Website

## Design Approach
**Reference-Based**: Drawing inspiration from wellversed.in's modern card-based layouts with clean aesthetics, combined with premium ecommerce patterns from Shopify and artisanal brands. Emphasis on large product photography, generous whitespace, and natural warmth reflecting the playful squirrel mascot and artisanal quality.

## Color System (Ornut Brand Palette)
**Light Mode:**
- Primary: `hsl(30 35% 44%)` - Warm rich brown #8B6F47 (like peanut butter) - Use for CTAs, links, highlights
- Secondary: `hsl(36 48% 91%)` - Soft cream #F5E6D3 (like peanuts) - Use for accents, backgrounds
- Background: `hsl(40 60% 98%)` - Very light cream #FAF8F5 - Main page background
- Card: `hsl(0 0% 100%)` - Pure white - For product cards and elevated surfaces
- Muted: `hsl(36 30% 94%)` - Light beige #F0EBE3 - For muted backgrounds
- Border: `hsl(30 15% 85%)` - Soft brown border #D9D0C7
- Foreground: `hsl(30 25% 25%)` - Dark brown #5D4E37 - Primary text color
- Muted-foreground: `hsl(30 15% 50%)` - Medium brown #8A7A6A - Secondary text
- Destructive: `hsl(0 70% 50%)` - Red for errors/delete actions

**Dark Mode:**
- Background: `hsl(30 25% 12%)` - Deep brown #2A2419
- Card: `hsl(30 20% 18%)` - Slightly lighter brown #36301F
- Primary: `hsl(36 48% 75%)` - Light cream (adjusted for dark bg)
- Foreground: `hsl(40 60% 95%)` - Light cream text
- Border: `hsl(30 15% 30%)` - Darker brown border

**Accent Colors:**
- Success: `hsl(142 70% 45%)` - Green for success states
- Warning: `hsl(38 92% 50%)` - Amber for warnings
- Info: `hsl(199 89% 48%)` - Blue for informational

## Typography System
**Fonts (from theme):**
- Primary: 'Space Grotesk' - Bold, modern headlines
- Secondary: 'Geist' - Clean body text
- Mono: 'Geist Mono' - Technical/pricing data

**Hierarchy:**
- Hero Headlines: text-6xl md:text-7xl, font-bold
- Section Headers: text-4xl md:text-5xl, font-semibold
- Product Titles: text-2xl, font-semibold
- Body Text: text-base, leading-relaxed
- Labels/Meta: text-sm, font-medium, tracking-wide
- Buttons: text-base, font-semibold

## Layout & Spacing
**Tailwind Units**: 4, 8, 12, 16, 24, 32
**Border Radius**: 0rem (sharp, modern from theme)
- Section padding: py-24 md:py-32
- Card padding: p-8 md:p-12
- Component gaps: gap-8 md:gap-12
- Container: max-w-7xl mx-auto px-6

## Page Structures

### Homepage
1. **Hero Section**: Full-width lifestyle image of peanut butter jar with peanuts and squirrel mascot subtly integrated, natural lighting. Overlay with large headline, subheadline, dual CTAs with backdrop-blur-lg, trust badges below (free shipping, 100% natural, handcrafted)

2. **Featured Products Grid**: 3-column (lg:grid-cols-3 md:grid-cols-2), large square product images on card backgrounds, hover lift effect, prominent pricing, quick-add buttons

3. **Brand Story**: 2-column asymmetric layout - large image of production process left, story text with squirrel mascot illustration right

4. **Why Ornut**: 4-column icon cards (natural ingredients, small batch, no additives, sustainable), icon + bold title + description

5. **Customer Love**: 3-column testimonial cards with photos, 5-star ratings, verified purchase badges

6. **Instagram Feed**: 4-column grid showcasing lifestyle shots, @handle overlay

7. **Newsletter CTA**: Centered section with mascot illustration, input field, subscribe button

### Product Catalog
- Sticky filter sidebar: Categories, price range, dietary filters, nut type
- 3-column grid with large images, wishlist icon top-right
- Sort controls: dropdown with price/popularity/newest
- Product cards: Image fills 60% of card height, title, price, quick-view button, add-to-cart

### Product Detail
- **Layout**: 2-column split - Left: Image gallery with main + 4 thumbnails, zoom on click. Right: Breadcrumb, title, price (large, primary color), star rating + review count, short description, quantity selector (- / +), Add to Cart (primary), Add to Wishlist (outline), accordion for ingredients/nutrition/shipping
- **Below**: Tabbed section (Reviews with photos, Recipes, FAQ), Related Products carousel

### Cart & Checkout
- **Cart**: Line items with thumbnail, title, quantity controls, remove icon, subtotal, promo input, shipping calculator, sticky checkout button
- **Checkout**: Multi-step progress bar, form sections with validation, order summary sidebar (sticky desktop), Cashfree payment integration, guest checkout option

### Account Dashboard
- Sidebar navigation: Orders, Wishlist, Addresses, Profile, Subscription (if recurring orders)
- Order history: Cards with product thumbnails, status badges, tracking links
- Wishlist: Grid matching catalog style

### Admin Panel
- **Login**: Centered card with mascot logo, email/password (32-64 char requirement), remember me
- **Dashboard**: Metric cards (4-column: today's orders, revenue, pending, inventory alerts), recent orders table, quick actions
- **Product Management**: Table with image preview, edit/delete icons, add product form with image upload, rich text editor for descriptions
- **Orders**: Filterable table, status dropdown, customer details, delivery tracking integration

## Component Library

### Navigation
Sticky header: Logo left, centered search bar with icon, right section (wishlist icon + count, account icon, cart icon + count + badge). Mega menu on category hover showing product images. Mobile: hamburger → slide-out with mascot at top.

### Buttons
- Primary: px-8 py-4, rounded-none (theme), font-semibold, primary background
- Secondary: Outline with border-2, secondary foreground
- Ghost: No background, hover with muted background
- Icon buttons: p-3, square, icon-only
- Backdrop-blur buttons (hero/images): backdrop-blur-lg with semi-transparent backgrounds

### Cards
All cards: rounded-none (theme), shadow-sm on hover becoming shadow-md, card background from theme
- Product cards: Image-dominant, minimal padding, clean separation
- Feature cards: Icon top, centered text, equal height
- Testimonial cards: Customer photo, quote, name, rating stars

### Forms
- Inputs: rounded-none, border-2, focus ring in primary
- Labels: text-sm font-medium, mb-2
- Validation: Inline messages, checkmark for success
- Search: Border-2 with search icon prefix

### Icons
**Heroicons outline**: shopping-cart, heart, magnifying-glass, user, truck, check-circle, chevron-right/down, x-mark, star (solid for ratings)

### Data Display
- Tables: Minimal borders, hover row highlight
- Status badges: Rounded-full, px-3 py-1, dot indicator
- Progress: Stepped with connecting lines

### Overlays
- Modals: Centered, max-w-2xl, backdrop with blur
- Toasts: Top-right, slide-in animation
- Quick View: Modal with product image + key details

## Images Strategy
1. **Hero**: Wide lifestyle shot - jar on rustic wood with scattered peanuts, warm natural lighting, subtle squirrel mascot cameo (1920x800px)
2. **Products**: Square format (1:1), white background, professional lighting, consistent styling (800x800px)
3. **Lifestyle**: In-use shots (toast, smoothies, baking), authentic, warm tones (1200x800px)
4. **Process**: Behind-scenes production, ingredient sourcing, batch making (1000x667px)
5. **Testimonials**: Real customer photos (200x200px circle crops)
6. **Mascot**: Playful squirrel illustrations for empty states, section breaks, loading states

## Animations
Purposeful only:
- Card hover: Subtle lift (transform translateY)
- Add to cart: Brief scale + check animation
- Page transitions: Fade
- Image galleries: Smooth carousel
- Skeleton loaders: Shimmer effect for product grids

## Mobile Optimization
- Single column stacking
- Bottom nav: Home, Categories, Cart, Account
- Collapsible filters with slide-up drawer
- Touch targets minimum 48px
- Swipeable galleries and carousels
- Sticky add-to-cart bar on product pages