# Avella Ecommerce

A premium, integration-ready electronics e-commerce platform built with an API-first architecture following the B.L.A.S.T. protocol. Avella provides a full-featured storefront alongside a robust management API designed for seamless integration with external systems like ERPs, inventory managers, and customer support tools.

## 🏗️ Architecture

- **Frontend:** Next.js 14 with ShadCN UI components
- **Backend:** Node.js REST API with Express & Drizzle ORM
- **Database:** PostgreSQL 16
- **Deployment:** Docker Desktop (OOTB orchestration)
- **API Docs:** OpenAPI 3.0 (Swagger) specification
- **Security:** Dual-layer auth (JWT for users, API Key for systems)

## 🎨 Design

Clean, minimalist aesthetic with vibrant blue accents (#2563EB), professional typography, and generous whitespace.

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Node.js 20+ (for local development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Avella-Ecommerce
cp .env.example .env
```

### 2. Start All Services

```bash
docker-compose up --build
```

This will start:

- **PostgreSQL** on port 5432
- **API** on port 3001
- **Frontend** on port 3000

### 3. Access the Application

- **Storefront:** <http://localhost:3000>
- **API Docs (Swagger):** <http://localhost:3001/api-docs>
- **API Base:** <http://localhost:3001/api>

## 📦 Included Sample Data

- **6 Categories:** Laptops, Smartphones, Tablets, Headphones, Smartwatches, Cameras
- **48 Products:** 8 products per category with realistic specs and pricing

## 📂 Project Structure

```
├── api/                    # Node.js REST API
├── frontend/               # Next.js application
├── database/
│   ├── migrations/         # PostgreSQL schema
│   └── seeds/              # Sample data
├── tools/                  # Python automation scripts
├── architecture/           # SOPs (Layer 1)
├── .tmp/                   # Temporary workbench
├── docker-compose.yml      # Multi-container orchestration
└── .env                    # Environment variables
```

## 🧪 Development

### Database Migrations

```bash
# Reset database (WARNING: destroys data)
docker-compose down -v
docker-compose up postgres -d
```

### API Testing

```bash
# Test all endpoints
python tools/test_api.py

# Manual test
curl http://localhost:3001/api/products | jq
```

### Frontend Development

```bash
# Access logs
docker-compose logs frontend -f

# Rebuild frontend
docker-compose up --build frontend
```

## 📝 API Documentation

Interactive OpenAPI documentation available at <http://localhost:3001/api-docs>

Key endpoints:

- `GET /api/products` - List all products
- `POST /api/products` - Create product (API Key)
- `PATCH /api/products/:id/inventory` - Update stock (API Key)
- `GET /api/customers` - List customers (API Key)
- `POST /api/orders/external` - Place direct order (API Key)
- `POST /api/auth/login` - User authentication

## 🔒 Security

- **JWT Authentication:** Secure access for customer accounts.
- **API Key Authentication:** `x-api-key` header for system-level management.
- **bcrypt Hashing:** Industry-standard password security (cost 12).
- **CORS & Validation:** Robust protection for cross-origin requests and data integrity.

## 🎯 Roadmap

### Phase 3: Architect (In Progress)

- [ ] Build API routes
- [ ] Implement authentication
- [ ] Create frontend components

### Phase 4: Stylize

- [ ] Apply ShadCN UI components
- [ ] Implement responsive design
- [ ] Newsletter section

### Phase 5: Trigger

- [ ] Production Docker configuration
- [ ] CI/CD pipeline
- [ ] Monitoring setup

## 📚 Documentation

- [Project Constitution](gemini.md) - Data schemas and behavioral rules
- [Implementation Plan](implementation_plan.md) - Technical blueprint
- [Design Reference](design_reference.md) - UI/UX inspiration
- [Task Tracker](task_plan.md) - B.L.A.S.T. phase progress

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [ShadCN UI](https://ui.shadcn.com/) - Component library
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Express](https://expressjs.com/) - API framework
- [Docker](https://www.docker.com/) - Containerization

## 📄 License

MIT License - see LICENSE file for details
