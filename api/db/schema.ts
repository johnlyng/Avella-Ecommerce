import { pgTable, serial, varchar, text, decimal, integer, timestamp, boolean, uuid, jsonb, AnyPgColumn } from 'drizzle-orm/pg-core';

// Categories table
export const categories = pgTable('categories', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    parentId: integer('parent_id').references((): AnyPgColumn => categories.id),
    imageUrl: varchar('image_url', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Users table
export const users = pgTable('users', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    uuid: uuid('uuid').defaultRandom().notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    role: varchar('role', { length: 20 }).default('customer'),
    phoneNumber: varchar('phone_number', { length: 20 }),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Products table
export const products = pgTable('products', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    sku: varchar('sku', { length: 100 }).unique(),
    categoryId: integer('category_id').references((): AnyPgColumn => categories.id),
    images: jsonb('images').default([]),
    specifications: jsonb('specifications').default({}),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Carts table
export const carts = pgTable('carts', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    cartToken: uuid('cart_token').defaultRandom().notNull().unique(),
    userId: integer('user_id').references(() => users.id),
    sessionId: varchar('session_id', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Cart Items table
export const cartItems = pgTable('cart_items', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    cartId: integer('cart_id').references(() => carts.id).notNull(),
    productId: integer('product_id').references(() => products.id).notNull(),
    quantity: integer('quantity').notNull().default(1),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Orders table
export const orders = pgTable('orders', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    userId: integer('user_id').references((): AnyPgColumn => users.id), // Nullable in SQL (ON DELETE SET NULL), removed .notNull()
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
    shippingCost: decimal('shipping', { precision: 10, scale: 2 }).notNull().default('0'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    shippingAddress: jsonb('shipping_address'),
    billingAddress: jsonb('billing_address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Order Items table
export const orderItems = pgTable('order_items', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer('order_id').references(() => orders.id).notNull(),
    productId: integer('product_id').references(() => products.id).notNull(),
    productName: varchar('product_name', { length: 255 }).notNull(),
    productSku: varchar('product_sku', { length: 100 }).notNull(),
    quantity: integer('quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Addresses table
export const addresses = pgTable('addresses', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id').references(() => users.id).notNull(),
    type: varchar('type', { length: 50 }).default('shipping'),
    firstName: varchar('first_name', { length: 100 }), // Optional
    lastName: varchar('last_name', { length: 100 }),   // Optional
    addressLine1: varchar('address_line1', { length: 255 }).notNull(),
    addressLine2: varchar('address_line2', { length: 255 }),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }).notNull(),
    country: varchar('country', { length: 100 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 20 }),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Type exports for TypeScript
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
