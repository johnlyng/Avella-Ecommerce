import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { categories, products, inventoryLevels, cartItems, carts, orderItems, orders } from './schema';

dotenv.config();

const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'avella',
    };

const pool = new Pool(poolConfig);
const db = drizzle(pool);

async function main() {
    console.log('Seeding test data...');

    // Clean existing data just in case
    await db.delete(cartItems);
    await db.delete(carts);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(inventoryLevels);
    await db.delete(products);
    await db.delete(categories);

    // 1. Categories
    const [laptops] = await db.insert(categories).values({
        name: 'Laptops',
        slug: 'laptops',
        description: 'High performance laptops',
    }).returning();

    const [smartphones] = await db.insert(categories).values({
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Mobile devices',
    }).returning();

    // 2. Products
    const [prod1] = await db.insert(products).values({
        name: 'Pro Laptop 15"',
        slug: 'pro-laptop-15',
        description: 'Powerful laptop',
        price: '1299.99',
        sku: 'LAP-15-PRO',
        categoryId: laptops.id,
        isActive: true,
    }).returning();

    const [prod2] = await db.insert(products).values({
        name: 'Smartphone X',
        slug: 'smartphone-x',
        description: 'Latest smartphone',
        price: '799.99',
        sku: 'PHONE-X',
        categoryId: smartphones.id,
        isActive: true,
    }).returning();

    // 3. Inventory Levels
    await db.insert(inventoryLevels).values([
        { productId: prod1.id, quantity: 50 },
        { productId: prod2.id, quantity: 100 }
    ]);

    console.log('Seeding completed!');
    await pool.end();
}

main().catch((err) => {
    console.error('Seeding failed!', err);
    process.exit(1);
});
