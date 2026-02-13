-- Avella Ecommerce Database Schema - Primary Key Redesign
-- PostgreSQL 16+
-- Migration: 002_redesign_primary_keys.sql
-- 
-- This migration redesigns primary keys from random UUIDs to bigint identity
-- following Supabase Postgres best practices for better performance and API usability.
--
-- BREAKING CHANGE: This drops and recreates all tables.
-- Only run this on development databases without production data.

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop the pgcrypto extension (we'll still use it for tokens)
-- But recreate it to ensure it's available
DROP EXTENSION IF EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (Authentication & Profiles)
-- Uses bigint identity for internal ID, UUID for external references
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (Electronics Product Categories)
-- Uses bigint identity, slug is the natural key for API access
CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (Electronics Inventory)
-- Uses bigint identity, slug is the natural key for API access
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10, 2) CHECK (compare_at_price >= 0),
  sku VARCHAR(100) UNIQUE,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  images JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carts table (Shopping Carts)
-- Uses bigint identity, cart_token is used for API access (secure, unguessable)
CREATE TABLE carts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cart_owner_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Cart Items table (Cart Line Items)
-- Uses bigint identity for primary key
CREATE TABLE cart_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id BIGINT REFERENCES carts(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (cart_id, product_id)
);

-- Orders table (Order Records)
-- Uses bigint identity, order_number is the human-readable identifier for API access
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10, 2) DEFAULT 0 CHECK (tax >= 0),
  shipping DECIMAL(10, 2) DEFAULT 0 CHECK (shipping >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table (Order Line Items)
-- Uses bigint identity for primary key
CREATE TABLE order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_sku ON products(sku);

CREATE INDEX idx_carts_cart_token ON carts(cart_token);
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate sequential order numbers
-- Format: ORD-YYYY-NNNNNN (e.g., ORD-2024-000001)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    current_year VARCHAR(4);
    next_sequence INTEGER;
    order_num VARCHAR(50);
BEGIN
    current_year := to_char(CURRENT_TIMESTAMP, 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 10) AS INTEGER)
    ), 0) + 1
    INTO next_sequence
    FROM orders
    WHERE order_number LIKE 'ORD-' || current_year || '-%';
    
    -- Format: ORD-YYYY-NNNNNN
    order_num := 'ORD-' || current_year || '-' || LPAD(next_sequence::TEXT, 6, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with bigint identity PK and UUID for external references';
COMMENT ON COLUMN users.id IS 'Internal sequential ID (not exposed in APIs)';
COMMENT ON COLUMN users.uuid IS 'External UUID for secure references';

COMMENT ON TABLE categories IS 'Product categories - use slug for API access';
COMMENT ON COLUMN categories.slug IS 'URL-friendly identifier used in API endpoints';

COMMENT ON TABLE products IS 'Product catalog - use slug for API access';
COMMENT ON COLUMN products.slug IS 'URL-friendly identifier used in API endpoints';

COMMENT ON TABLE carts IS 'Shopping carts - use cart_token for API access';
COMMENT ON COLUMN carts.cart_token IS 'Secure token for cart access in API endpoints';

COMMENT ON TABLE orders IS 'Orders - use order_number for API access';
COMMENT ON COLUMN orders.order_number IS 'Human-readable order identifier (e.g., ORD-2024-000001)';
