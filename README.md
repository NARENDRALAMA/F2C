# Farmers-to-Consumers (F2C)

A complete **Next.js full-stack** marketplace platform connecting local NSW farmers directly with Sydney consumers — no middlemen, fresh produce, fair prices.

> **ITSU3008 — Team:** Samir Paudel (58252), Kazi Wasif Muhammad (53923), Zain Tanveer (59678)

---

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router) — single project for both frontend and backend
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (HTTP Bearer tokens) + bcrypt password hashing
- **Payments:** Stripe (optional — runs in demo mode without keys)
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Notifications:** react-hot-toast
- **HTTP client:** axios

---

## 📁 Project Structure

```
.
├── app/                       # Next.js App Router
│   ├── layout.jsx            # Root layout (Auth + Cart providers, Navbar, Footer)
│   ├── page.jsx              # Home / landing page
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── products/
│   │   ├── page.jsx          # Browse with filters, search, pagination
│   │   └── [id]/page.jsx     # Product detail + reviews
│   ├── cart/page.jsx
│   ├── checkout/page.jsx
│   ├── orders/page.jsx       # Consumer order tracking
│   ├── farmer/dashboard/page.jsx
│   ├── admin/page.jsx
│   └── api/                  # All backend routes
│       ├── auth/             # register, login, me
│       ├── products/         # CRUD + farmer/mine
│       ├── orders/           # create, mine, farmer/incoming, [id]/status, [id]/cancel
│       ├── payments/         # create-intent, confirm, history
│       ├── feedback/         # create + by product
│       └── admin/            # stats, users, orders, products
├── components/               # Navbar, Footer, ProductCard, Spinner
├── context/                  # AuthContext, CartContext (client-side)
├── lib/                      # db.js, auth.js, seed.js
├── models/                   # User, Product, Order, Payment, Feedback
├── utils/api.js              # Axios instance with JWT interceptors
└── public/images/
```

---

## 🛠 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example and fill in values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/f2c
JWT_SECRET=your-long-random-secret-here
STRIPE_SECRET_KEY=                       # optional — leave blank for demo mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Start MongoDB

Local Mongo:
```bash
brew services start mongodb-community     # macOS
# or
mongod --dbpath ~/data/db
```

Or use a free **MongoDB Atlas** cluster and paste the connection string in `MONGODB_URI`.

### 4. Seed sample data

```bash
npm run seed
```

This creates 4 demo users and 6 sample products.

### 5. Run dev server

```bash
npm run dev
```

Open **http://localhost:3000**.

---

## 🔑 Demo Credentials (after seeding)

All passwords: `password123`

| Role     | Email             |
|----------|-------------------|
| Admin    | admin@f2c.com     |
| Farmer 1 | john@farm.com     |
| Farmer 2 | mary@farm.com     |
| Consumer | alice@email.com   |

---

## 📡 API Endpoints

| Method | Endpoint                                 | Auth     | Description                          |
|--------|------------------------------------------|----------|--------------------------------------|
| POST   | `/api/auth/register`                     | -        | Create new account                   |
| POST   | `/api/auth/login`                        | -        | Login → JWT                          |
| GET    | `/api/auth/me`                           | Bearer   | Current user                         |
| PUT    | `/api/auth/me`                           | Bearer   | Update profile                       |
| GET    | `/api/products`                          | -        | List (filters, search, sort, paged)  |
| GET    | `/api/products/[id]`                     | -        | Single product                       |
| POST   | `/api/products`                          | Farmer   | Create                               |
| PUT    | `/api/products/[id]`                     | Farmer   | Update own                           |
| DELETE | `/api/products/[id]`                     | Farmer   | Soft-delete own                      |
| GET    | `/api/products/farmer/mine`              | Farmer   | List own products                    |
| POST   | `/api/orders`                            | Consumer | Place order (stock check + Stripe)   |
| GET    | `/api/orders/mine`                       | Consumer | Own orders                           |
| GET    | `/api/orders/[id]`                       | Bearer   | Single order                         |
| PUT    | `/api/orders/[id]/status`                | Farmer/Admin | Update status                    |
| PUT    | `/api/orders/[id]/cancel`                | Consumer | Cancel pending order                 |
| GET    | `/api/orders/farmer/incoming`            | Farmer   | Orders containing farmer's products  |
| POST   | `/api/payments/create-intent`            | Bearer   | Create Stripe PaymentIntent          |
| POST   | `/api/payments/confirm`                  | Bearer   | Mark payment as paid                 |
| GET    | `/api/payments/history`                  | Consumer | Payment history                      |
| POST   | `/api/feedback`                          | Consumer | Add review (delivered orders only)   |
| GET    | `/api/feedback/product/[id]`             | -        | Reviews for a product                |
| GET    | `/api/admin/stats`                       | Admin    | Dashboard stats                      |
| GET    | `/api/admin/users`                       | Admin    | All users                            |
| PUT    | `/api/admin/users/[id]/toggle`           | Admin    | Activate/deactivate user             |
| GET    | `/api/admin/products`                    | Admin    | All products                         |
| GET    | `/api/admin/orders`                      | Admin    | All orders                           |

---

## ✨ Features

### Consumer
- Browse products with category filter, search, sort, pagination
- Product detail with reviews & star ratings
- Persistent cart (localStorage)
- Secure checkout with Stripe
- Order tracking with visual status timeline
- Cancel pending orders
- Leave reviews on delivered products

### Farmer
- Dashboard with My Products / Incoming Orders / Add Product tabs
- Add, edit, soft-delete products
- View incoming orders & update status (pending → delivered)

### Admin
- Stats: users, products, orders, revenue
- User management with activate/deactivate
- Browse all products & orders

### Platform
- JWT auth with bcrypt-hashed passwords
- Role-based access control (consumer / farmer / admin)
- Mongoose validation & soft-delete pattern
- Toast notifications across the app
- Responsive mobile-first design
- SSR home page with cached featured products

---

## 📜 Scripts

```bash
npm run dev      # Next.js dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run seed     # Seed demo users + products into MongoDB
```

---

## 🧪 Demo Mode (no Stripe)

If you leave `STRIPE_SECRET_KEY` empty, checkout will skip the real Stripe call and mark orders as paid automatically. This lets you demo the full flow end-to-end without setting up Stripe.

---

© 2026 Farmers-to-Consumers · ITSU3008
