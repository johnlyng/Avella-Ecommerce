# Avella Ecommerce

A premium, integration-ready electronics e-commerce platform built with an API-first architecture. Avella provides a full-featured storefront alongside a robust management API designed for seamless integration with external systems like ERPs, inventory managers, and CRM tools.

## 🏗️ Architecture

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), ShadCN UI, Tailwind CSS |
| **Backend** | Node.js, Express, Drizzle ORM |
| **Database** | PostgreSQL 16 |
| **Deployment** | Docker Desktop (multi-container via `docker-compose`) |
| **API Docs** | OpenAPI 3.1 / Swagger UI |
| **Auth** | JWT (customers) + API Key (system integrations) |

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running

### 1. Clone and configure

```bash
git clone https://github.com/johnlyng/Avella-Ecommerce.git
cd Avella-Ecommerce
cp .env.example .env
```

### 2. Start all services

```bash
docker-compose up --build
```

### 3. Seed the database

```bash
node api/seed.js
```

### 4. Access the application

| Service | URL |
|---|---|
| Storefront | <http://localhost:3000> |
| API Base | <http://localhost:3001/api> |
| Swagger UI | <http://localhost:3001/api-docs> |
| Drizzle Studio | <http://localhost:3001/database> |

## 📦 Sample Data

Running `node api/seed.js` populates:

- **Companies** — Avella AS + sample B2B partners
- **Categories** — Laptops, Smartphones, Tablets, Headphones, Smartwatches, Cameras
- **Products** — 48 products (8 per category) with realistic specs and pricing
- **Inventory** — Stock levels for all products
- **Users** — Avella AS employees with addresses
- **Orders** — Sample orders for demo users

## 📂 Project Structure

```
├── api/
│   ├── db/
│   │   ├── schema.ts           # Drizzle ORM schema
│   │   └── migrations/         # Auto-generated SQL migrations
│   ├── routes/                 # Express route handlers
│   ├── services/               # Business logic (CustomerService, WebhookService, …)
│   ├── seed.js                 # Database seeder
│   └── server.js               # Express entry point
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin pages (products, webhooks)
│   │   ├── profile/            # User profile & address management
│   │   ├── register/           # Customer & company registration
│   │   └── orders/             # Order history
│   ├── components/             # Shared UI components
│   ├── context/                # Auth context
│   └── lib/api.ts              # Typed API client
├── docker-compose.yml
└── .env
```

## ✨ Features

### Storefront (Customer-Facing)

- Product catalogue with category filtering
- Shopping cart (guest + authenticated, with merge on login)
- Checkout and order placement
- Order history
- User profile with saved addresses
- B2B company registration and lookup

### Admin

- Product management (create, edit, inventory updates)
- Webhook management — configure outgoing HTTP endpoints for order events

### API Integrations

- **Webhook system** — fires `order.created` and `order.updated` events to registered URLs with delivery logging
- **External orders** — `POST /api/orders/external` for ERP-driven order creation
- **Customer API** — full CRUD for customers and companies

## 📝 Key API Endpoints

```
# Authentication
POST   /api/auth/register
POST   /api/auth/login

# Products (public read, API Key write)
GET    /api/products
POST   /api/products
PATCH  /api/products/:id/inventory

# Orders
POST   /api/orders                  # Authenticated customer
POST   /api/orders/external         # API Key (ERP integration)
PATCH  /api/orders/:id/status       # API Key

# Customers & Companies (API Key)
GET    /api/customers
GET    /api/companies
POST   /api/companies

# Webhooks (JWT admin)
GET    /api/webhooks
POST   /api/webhooks
PATCH  /api/webhooks/:id
DELETE /api/webhooks/:id
GET    /api/webhooks/logs
```

Full interactive documentation at <http://localhost:3001/api-docs>

## 🔒 Security

- **JWT** — signed tokens for customer sessions
- **API Key** — `x-api-key` header for system-to-system access
- **bcrypt** — password hashing at cost factor 12
- **CORS & input validation** on all endpoints

## 🛠️ Development

### Rebuild a single service

```bash
docker-compose build api --no-cache && docker-compose up -d api
docker-compose build frontend --no-cache && docker-compose up -d frontend
```

### Apply schema changes

```bash
cd api
npx drizzle-kit push
```

### View logs

```bash
docker-compose logs api -f
docker-compose logs frontend -f
```

## 🛠️ Built With

- [Next.js](https://nextjs.org/) · [ShadCN UI](https://ui.shadcn.com/) · [Tailwind CSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/) · [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/) · [Docker](https://www.docker.com/)

## 📄 License

MIT License — see LICENSE for details.
