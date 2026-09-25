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
