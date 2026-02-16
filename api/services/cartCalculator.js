// Cart Calculation Service
// Shared utilities for cart totals and tax calculations
// Used by both cart.js and orders.js routes

const db = require('../config/database');

// Tax configuration
const TAX_RATE = parseFloat(process.env.TAX_RATE || '0.1'); // Default 10%

/**
 * Calculate cart totals (subtotal, tax, total)
 * @param {number} cartId - Cart ID
 * @returns {Promise<{subtotal: number, tax: number, total: number}>}
 */
async function calculateCartTotals(cartId) {
    const query = `
        SELECT 
            SUM(ci.quantity * ci.price) as subtotal
        FROM cart_items ci
        WHERE ci.cart_id = $1
    `;

    const result = await db.query(query, [cartId]);
    const subtotal = parseFloat(result.rows[0].subtotal || 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return { subtotal, tax, total };
}

/**
 * Calculate totals from items array (for order creation)
 * @param {Array} items - Array of cart items with price and quantity
 * @returns {{subtotal: number, tax: number, total: number}}
 */
function calculateItemsTotals(items) {
    const subtotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return { subtotal, tax, total };
}

/**
 * Calculate shipping cost based on order total
 * @param {number} total - Order total before shipping
 * @returns {number} Shipping cost
 */
function calculateShipping(total) {
    // Free shipping over $100, otherwise $10
    return total >= 100 ? 0 : 10;
}

module.exports = {
    calculateCartTotals,
    calculateItemsTotals,
    calculateShipping,
    TAX_RATE
};
