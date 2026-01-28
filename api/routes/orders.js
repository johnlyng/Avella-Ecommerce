// Orders API Routes
// POST /api/orders - Create order from cart
// GET /api/orders/:id - Get order details

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper to generate order number (format: AVE-YYYYMMDD-XXXX)
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `AVE-${year}${month}${day}-${random}`;
}

// POST /api/orders - Create order from cart
router.post('/', async (req, res, next) => {
    const client = await db.getClient();

    try {
        const {
            cartId,
            userId,
            shippingAddress,
            billingAddress,
        } = req.body;

        if (!cartId || !shippingAddress) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'cartId and shippingAddress are required',
            });
        }

        await client.query('BEGIN');

        // Get cart items
        const cartItemsQuery = `
      SELECT 
        ci.*,
        p.name as product_name,
        p.sku as product_sku,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `;
        const cartItems = await client.query(cartItemsQuery, [cartId]);

        if (cartItems.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Cart is empty',
            });
        }

        // Check stock availability for all items
        for (const item of cartItems.rows) {
            if (item.stock_quantity < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: 'Insufficient Stock',
                    message: `${item.product_name} has insufficient stock`,
                });
            }
        }

        // Calculate totals
        const subtotal = cartItems.rows.reduce(
            (sum, item) => sum + item.quantity * parseFloat(item.price),
            0
        );
        const tax = subtotal * 0.1; // 10% tax
        const shipping = 0; // Free shipping for MVP
        const total = subtotal + tax + shipping;

        // Create order
        const orderNumber = generateOrderNumber();
        const createOrderQuery = `
      INSERT INTO orders (
        user_id, order_number, status, subtotal, tax, shipping, total,
        shipping_address, billing_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const orderResult = await client.query(createOrderQuery, [
            userId || null,
            orderNumber,
            'pending',
            subtotal,
            tax,
            shipping,
            total,
            JSON.stringify(shippingAddress),
            billingAddress ? JSON.stringify(billingAddress) : null,
        ]);

        const order = orderResult.rows[0];

        // Create order items and update stock
        for (const item of cartItems.rows) {
            // Insert order item
            const orderItemQuery = `
        INSERT INTO order_items (
          order_id, product_id, product_name, product_sku,
          quantity, price, total
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
            await client.query(orderItemQuery, [
                order.id,
                item.product_id,
                item.product_name,
                item.product_sku,
                item.quantity,
                item.price,
                item.quantity * parseFloat(item.price),
            ]);

            // Update product stock
            const updateStockQuery = `
        UPDATE products
        SET stock_quantity = stock_quantity - $1
        WHERE id = $2
      `;
            await client.query(updateStockQuery, [item.quantity, item.product_id]);
        }

        // Clear cart
        const clearCartQuery = 'DELETE FROM cart_items WHERE cart_id = $1';
        await client.query(clearCartQuery, [cartId]);

        await client.query('COMMIT');

        res.status(201).json({ data: order });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

// GET /api/orders/:id - Get order details
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get order
        const orderQuery = 'SELECT * FROM orders WHERE id = $1';
        const orderResult = await db.query(orderQuery, [id]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Order not found',
            });
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsQuery = `
      SELECT * FROM order_items
      WHERE order_id = $1
    `;
        const itemsResult = await db.query(itemsQuery, [id]);

        res.json({
            data: {
                ...order,
                items: itemsResult.rows,
            },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/orders - Get user orders
router.get('/', async (req, res, next) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'userId query parameter is required'
            });
        }

        const query = `
            SELECT * FROM orders
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [userId]);

        res.json({
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
