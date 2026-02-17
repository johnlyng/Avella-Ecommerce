import * as dotenv from 'dotenv';
dotenv.config();
import { db } from './db';
import { products, inventoryLevels } from './db/schema';
import productService from './services/ProductService';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';

async function main() {
    console.log('Verifying Inventory System...');

    // 1. Check if inventory_levels has data
    const levels = await db.select().from(inventoryLevels).limit(5);
    console.log('Inventory Levels Sample:', levels);

    if (levels.length === 0) {
        console.warn('Warning: No inventory levels found! Migration might have failed to copy data.');
    } else {
        console.log(`Found ${levels.length} sample inventory records.`);
    }

    // 2. Fetch a product via Service to check mapping
    const allProducts = await db.select().from(products).limit(1);
    if (allProducts.length > 0) {
        const product = allProducts[0];
        console.log(`Testing with product: ${product.name} (ID: ${product.id})`);

        // Use getProductById to test the join logic
        const serviceProduct = await productService.getProductById(product.id);
        console.log('Service Product Result:', removeImages(serviceProduct));

        if (serviceProduct && serviceProduct.stock_quantity !== undefined) {
            const expectedStock = levels.find(l => l.productId === product.id)?.quantity;
            console.log(`PASS: stock_quantity is present: ${serviceProduct.stock_quantity}`);
            if (expectedStock !== undefined) {
                console.log(`Stock matches database level: ${expectedStock === serviceProduct.stock_quantity}`);
            }
        } else {
            console.error('FAIL: stock_quantity is missing or undefined!');
        }

        // 3. Test update stock
        console.log('Testing updateStock...');
        const newStock = (serviceProduct?.stock_quantity || 0) + 5;
        await productService.updateStock(product.id, newStock);

        const updatedProduct = await productService.getProductById(product.id);
        console.log(`Updated Stock: ${updatedProduct?.stock_quantity}`);

        if (updatedProduct?.stock_quantity === newStock) {
            console.log('PASS: Stock update successful.');
        } else {
            console.error(`FAIL: expected ${newStock}, got ${updatedProduct?.stock_quantity}`);
        }

    } else {
        console.log('No products to test.');
    }

    console.log('Verification Complete.');
    process.exit(0);
}

function removeImages(obj: any) {
    if (!obj) return obj;
    const { images, ...rest } = obj;
    return rest;
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
