# LocalHub — Local Business Digital Platform

A production-style **MERN Stack digital platform** enabling small and local businesses (bakeries, repair workshops, boutiques, salons, pharmacies, grocery shops, and artisans) to establish their digital storefront, list products and services, manage incoming orders, collect verified customer reviews, and analyze business performance without needing to build or maintain a separate website.

---

## 🌟 Key Features

### 🏬 For Local Businesses & Merchants
- **Ready-Made Digital Storefront**: Branded store URL (`/business/:slug`), photo gallery, business bio, contact information, and weekly operating hours schedule.
- **Product & Inventory Catalog**: Full catalog management with retail prices, discount offers, stock quantity tracking, SKUs, and in-stock toggles.
- **Services & Procedures Menu**: Service booking with durations, estimates, and customer inquiry triggers (e.g. OLED screen repair, diagnostics, tailoring).
- **Promotional Coupons & Offers**: Percentage (%) or fixed ($) discount codes (e.g. `SWEET20`, `FIXIT10`, `FASHION15`), minimum order thresholds, and active date ranges.
- **Real-Time Order Dashboard**: Visual lifecycle transitions: `Pending` ➔ `Accepted` ➔ `Preparing` ➔ `Ready` ➔ `Completed` / `Cancelled`.
- **Customer Feedback & Direct Owner Responses**: Collect 1–5 star reviews and respond publicly to build community trust.
- **Business Performance Analytics**: Visual Recharts dashboards tracking daily gross revenue trends, order volume, popular products, and customer counts.
- **Customer Inquiry Inbox**: Direct messaging channel for pre-orders, scheduling, and custom requests.

### 🛍️ For Customers & Local Patrons
- **Neighbourhood Store Discovery**: Search by business name, product keywords, service procedures, or category.
- **Interactive OpenStreetMap with Leaflet**: Interactive map pins for local discovery with 1-click driving directions.
- **Smart Filters & Sorting**: Filter by category, open now, minimum rating (4.0+, 4.5+), and sort by rating or name.
- **Shopping Bag & Coupon Discounts**: Add products to cart, apply merchant coupon codes with instant backend verification, and choose between In-Store Pickup or Doorstep Local Delivery.
- **Live Order Tracking**: Visual progress bar tracking order status from pending to preparation and ready for pickup.
- **Verified Customer Reviews**: Rate and review businesses with verified purchase tags.
- **Saved Stores**: Bookmark favorite neighbourhood shops for quick re-ordering.

### 🛡️ For SuperAdmin
- **Platform Telemetry**: Global platform GMV, total stores, order volume, and category distribution charts.
- **Merchant Management**: Supervise stores, approve registrations, or suspend non-compliant businesses.
- **User Directory**: View all registered accounts across Customer, Owner, and Admin roles.
- **Review Moderation Queue**: Supervise and remove inappropriate reviews.
- **Category Taxonomy**: Define and update platform business categories.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, React Router 7, Vite, Tailwind CSS, Recharts, Lucide Icons, Leaflet (OpenStreetMap)
- **Backend**: Node.js, Express.js REST APIs, TypeScript (tsx)
- **Security & Auth**: JWT (JSON Web Tokens), bcryptjs password hashing, role-based authorization middleware
- **Data Persistence**: Persistent ACID document database engine with disk storage, Mongoose/MongoDB Atlas compatible

---

## 👤 Preloaded Demo Credentials

For immediate 1-click testing, click any avatar in the **Quick Demo Switcher bar** at the top of the app, or sign in using:

| Role | Email | Password | Preloaded Store |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@localhub.com` | `password123` | David Miller (Sample orders & favorites) |
| **Bakery Owner** | `owner@bakery.com` | `password123` | Sweet Home Bakery (Cakes, Sourdough, Croissants) |
| **Tech Repair Owner** | `owner@mobilecare.com` | `password123` | City Mobile Care (Screen Repair, Battery diagnostics) |
| **Fashion Owner** | `owner@trendyfashion.com` | `password123` | Trendy Fashion Boutique (Denim, Linens) |
| **SuperAdmin** | `admin@localhub.com` | `password123` | Alexandra Vance (Platform-wide controls) |

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=3000
JWT_SECRET=localhub_jwt_super_secret_key_2026
MONGO_URI=mongodb://localhost:27017/localhub
```

### 3. Start the Full-Stack Application
```bash
npm run dev
```
The application will launch on `http://localhost:3000` with the Express API and Vite client running concurrently.

---

## 📡 REST API Endpoints Overview

### Authentication
- `POST /api/auth/register` — Create customer or merchant account
- `POST /api/auth/login` — Sign in and issue JWT bearer token
- `GET /api/auth/me` — Retrieve active authenticated user profile
- `PUT /api/auth/profile` — Update name, phone, or avatar

### Businesses & Storefronts
- `GET /api/businesses` — Search & filter directory (`q`, `category`, `minRating`, `openNow`, `sort`)
- `GET /api/businesses/:id` — Get business by ID
- `GET /api/businesses/slug/:slug` — Get business by storefront slug
- `GET /api/businesses/owner/my-business` — Get logged-in merchant's store
- `POST /api/businesses` — Register new business profile
- `PUT /api/businesses/:id` — Update store details & operating hours

### Products & Inventory
- `GET /api/products/business/:businessId` — List catalog products
- `POST /api/products` — Add product item
- `PUT /api/products/:id` — Update pricing, discount, stock, or status
- `DELETE /api/products/:id` — Remove item from catalog

### Services
- `GET /api/services/business/:businessId` — List available services
- `POST /api/services` — Create service item
- `PUT /api/services/:id` — Edit service item
- `DELETE /api/services/:id` — Remove service item

### Promotional Offers & Coupons
- `GET /api/offers/business/:businessId` — List active promotions
- `POST /api/offers/validate` — Validate coupon against basket total
- `POST /api/offers` — Create promotional coupon
- `PUT /api/offers/:id` — Update offer parameters

### Orders & Fulfillment
- `POST /api/orders` — Place order (backend price & stock verification)
- `GET /api/orders/my-orders` — Customer order history
- `GET /api/orders/business/:businessId` — Merchant order management
- `GET /api/orders/:id` — Order status details & timeline
- `PUT /api/orders/:id/status` — Transition order status

### Reviews
- `GET /api/reviews/business/:businessId` — Customer feedback list
- `POST /api/reviews` — Submit 1-5 star review
- `POST /api/reviews/:id/respond` — Post verified merchant reply

### Analytics
- `GET /api/analytics/business/:businessId` — Sales volume, daily trends, top items

### Admin
- `GET /api/admin/analytics` — Platform gross sales and user breakdown
- `GET /api/admin/businesses` — Supervise all registered businesses
- `PUT /api/admin/businesses/:id/status` — Approve or suspend stores
- `GET /api/admin/users` — Manage platform user accounts
- `DELETE /api/admin/reviews/:id` — Remove flagged or abusive reviews

---

## 📄 License
MIT License.
