# 🧬 Gemini.md - Project Constitution
## Avella Ecommerce Application

> **Status:** Initialization Phase  
> **Last Updated:** 2026-01-25  
> **System Pilot:** Active

---

## 📐 Data Schemas

### Database: PostgreSQL

#### **users** (Authentication & Profiles)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **categories** (Electronics Product Categories)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **products** (Electronics Inventory)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2), -- MSRP/original price
  sku VARCHAR(100) UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]', -- Array of image URLs
  specifications JSONB DEFAULT '{}', -- Product specs (CPU, RAM, etc.)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **carts** (Shopping Carts)
```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- For guest carts
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **cart_items** (Cart Line Items)
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL, -- Snapshot at time of add
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **orders** (Order Records)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **order_items** (Order Line Items)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL, -- Snapshot
  product_sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### API Data Schemas (JSON)

#### **Product Response**
```json
{
  "id": "uuid",
  "categoryId": "uuid",
  "name": "string",
  "slug": "string",
  "description": "string",
  "price": "number",
  "compareAtPrice": "number | null",
  "sku": "string",
  "stockQuantity": "number",
  "images": ["url1", "url2"],
  "specifications": {
    "brand": "string",
    "model": "string",
    "cpu": "string",
    "ram": "string",
    "storage": "string"
  },
  "isActive": "boolean",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

#### **Cart Response**
```json
{
  "id": "uuid",
  "userId": "uuid | null",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "product": { /* Product object */ },
      "quantity": "number",
      "price": "number",
      "subtotal": "number"
    }
  ],
  "subtotal": "number",
  "tax": "number",
  "total": "number",
  "updatedAt": "ISO8601"
}
```

#### **Order Response**
```json
{
  "id": "uuid",
  "orderNumber": "string",
  "userId": "uuid | null",
  "status": "string",
  "items": [
    {
      "productName": "string",
      "quantity": "number",
      "price": "number",
      "total": "number"
    }
  ],
  "subtotal": "number",
  "tax": "number",
  "shipping": "number",
  "total": "number",
  "shippingAddress": {
    "name": "string",
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "country": "string"
  },
  "createdAt": "ISO8601"
}
```

---

## ⚖️ Behavioral Rules

### Brand & Tone
- **Professional:** Clean, modern, trustworthy UI/UX
- **Simplicity:** MVP-focused, no feature bloat
- **Clarity:** Clear error messages, intuitive navigation

### Design Aesthetic (Frontend)
**Inspired by uploaded reference image**
- **Color Scheme:**
  - Primary: Vibrant blue (#2563EB or similar)
  - Background: White/light gray (#FFFFFF, #F9FAFB)
  - Footer: Dark gray/charcoal (#1F2937)
  - Accents: Blue geometric shapes
  
- **Typography:**
  - Font family: Inter, Roboto, or similar modern sans-serif
  - Hero headlines: Large, bold, high contrast
  - Body text: Clean, readable, 16px minimum
  
- **Layout:**
  - Generous whitespace (breathing room)
  - Minimalist product cards (white backgrounds)
  - Grid-based product layouts
  - Clear visual hierarchy
  
- **Components:**
  - Blue CTA buttons (high contrast)
  - Clean navigation header
  - Newsletter section with blue background
  - Dark footer for contrast
  - Hover effects on interactive elements

### Business Logic Constraints
1. **Inventory Management:**
   - Never allow purchases when `stock_quantity <= 0`
   - Display "Out of Stock" badge when unavailable
   - Update stock atomically during checkout

2. **Pricing:**
   - All prices stored and calculated in cents (multiply by 100)
   - Display prices with 2 decimal precision
   - Tax calculation placeholder (configurable in future)

3. **Orders:**
   - Generate unique order numbers on creation (format: `AVE-YYYYMMDD-XXXX`)
   - Cart converts to Order atomically (transaction-based)
   - Orders are immutable once created (status updates only)

4. **Data Security:**
   - **Do NOT** store credit card data (future: Stripe integration)
   - Passwords must be hashed (bcrypt, cost factor 12)
   - Use JWT tokens for API authentication
   - Sanitize all user inputs

5. **Performance:**
   - API responses < 200ms target
   - Image optimization required
   - Database queries must use indexes on frequently queried fields

### Sample Data Requirements
**Electronics Categories:**
- Laptops
- Smartphones
- Tablets
- Headphones
- Smartwatches
- Cameras

**Sample Products per Category:** Minimum 5-8 products each

---

## 🏛️ Architectural Invariants

### File Structure
```
├── gemini.md          # THIS FILE - Project Constitution
├── task_plan.md       # Blueprint & Task Tracking  
├── findings.md        # Research & Discoveries
├── progress.md        # Execution Log & Test Results
├── .env               # API Keys/Secrets
├── architecture/      # Layer 1: SOPs (Standard Operating Procedures)
├── tools/             # Layer 3: Python Scripts (Deterministic Engines)
└── .tmp/              # Temporary Workbench
```

### Layer Definitions

**Layer 1 - Architecture (`architecture/`)**
- Markdown SOPs defining technical workflows
- Updated BEFORE code changes
- Contains edge cases and decision logic

**Layer 2 - Navigation (System Pilot)**
- Decision-making and orchestration layer
- Routes data between SOPs and Tools
- Does NOT contain business logic

**Layer 3 - Tools (`tools/`)**
- Deterministic Python scripts
- Atomic, testable, single-purpose
- All secrets in `.env`

---

## 🔒 Key Principles

1. **Data-First Rule:** No coding until schemas are defined
2. **Self-Annealing:** All errors update relevant SOPs
3. **Deliverables vs. Intermediates:** `.tmp/` is ephemeral, cloud is final
4. **Golden Rule:** If logic changes, update SOP before updating code

---

## 📝 Maintenance Log

### 2026-01-25 - Project Initialized
- Protocol 0 activated
- Memory files created
- Awaiting Discovery Phase completion
