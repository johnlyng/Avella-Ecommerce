// Cart Calculator Service - TypeScript version
// Shared utilities for cart calculations

import { QueryResult } from 'pg';

const db = require('../config/database');

export const TAX_RATE = parseFloat(process.env.TAX_RATE || '0.1');
const SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 10;

interface CartTotals {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
}

interface CartItem {
    quantity: number;
    price: string | number;
}

/**
 * Calculate cart totals from database
 */
export async function calculateCartTotals(cartId: number): Promise<CartTotals> {
    const query = `
        SELECT 
            SUM(ci.quantity * ci.price) as subtotal
        FROM cart_items ci
        WHERE ci.cart_id = $1
    `;

    const result: QueryResult = await db.query(query, [cartId]);
    const subtotal = parseFloat(result.rows[0]?.subtotal || '0');

    const tax = subtotal * TAX_RATE;
    const shipping = calculateShipping(subtotal);
    const total = subtotal + tax + shipping;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
}

/**
 * Calculate totals from items array (no DB query)
 */
export function calculateItemsTotals(items: CartItem[]): CartTotals {
    const subtotal = items.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (item.quantity * price);
    }, 0);

    const tax = subtotal * TAX_RATE;
    const shipping = calculateShipping(subtotal);
    const total = subtotal + tax + shipping;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
}

/**
 * Calculate shipping cost based on subtotal
 */
export function calculateShipping(subtotal: number): number {
    return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}
