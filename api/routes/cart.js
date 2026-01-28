// Cart API Routes
// POST /api/cart - Create cart
// GET /api/cart/:id - Get cart with items
// POST /api/cart/:id/items - Add item to cart
// PUT /api/cart/:id/items/:itemId - Update item quantity
// DELETE /api/cart/:id/items/:itemId - Remove item from cart

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { v4: uuidv4 } = require('crypto');

// Helper to calculate cart totals
async function calculateCartTotals(cartId) {
    const query = `
    SELECT 
      SUM(ci.quantity * ci.price) as subtotal
    FROM cart_items ci
    WHERE ci.cart_id = $1
  `;
    const result = await db.query(query, [cartId]);
    const subtotal = parseFloat(result.rows[0].subtotal || 0);
    const tax = subtotal * 0.1; // 10% tax (configurable)
    const total = subtotal + tax;

    return { subtotal, tax, total };
}

// POST /api/cart - Create new cart
router.post('/', async (req, res, next) => {
    try {
        const { userId, sessionId } = req.body;

        if (!userId && !sessionId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Either userId or sessionId is required',
            });
        }

        const query = `
            INSERT INTO carts (user_id, session_id)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result = await db.query(query, [userId || null, sessionId || null]);
        const cart = result.rows[0];
        const fullCart = await fetchCartWithItems(cart.id);
        res.status(201).json({ data: fullCart });
    } catch (error) {
        next(error);
    }
});

// GET /api/cart/:id - Get cart with items
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const cart = await fetchCartWithItems(id);

        if (!cart) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Cart not found',
            });
        }

        res.json({ data: cart });
    } catch (error) {
        next(error);
    }
});

// POST /api/cart/:id/items - Add item to cart
router.post('/:id/items', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { productId, quantity = 1 } = req.body;

        // Check if cart exists
        const cartQuery = 'SELECT * FROM carts WHERE id = $1';
        const cartResult = await db.query(cartQuery, [id]);

        if (cartResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Cart not found',
            });
        }

        if (!productId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'productId is required',
            });
        }

        // Get product details and check stock
        const productQuery = 'SELECT * FROM products WHERE id = $1 AND is_active = true';
        const productResult = await db.query(productQuery, [productId]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Product not found',
            });
        }

        const product = productResult.rows[0];

        if (product.stock_quantity < quantity) {
            return res.status(400).json({
                error: 'Insufficient Stock',
                message: `Only ${product.stock_quantity} items available`,
            });
        }

        // Check if item already in cart
        const existingQuery = `
      SELECT * FROM cart_items 
      WHERE cart_id = $1 AND product_id = $2
    `;
        const existingResult = await db.query(existingQuery, [id, productId]);

        let result;
        if (existingResult.rows.length > 0) {
            // Update quantity
            const newQuantity = existingResult.rows[0].quantity + quantity;
            const updateQuery = `
        UPDATE cart_items
        SET quantity = $1
        WHERE cart_id = $2 AND product_id = $3
        RETURNING *
      `;
            result = await db.query(updateQuery, [newQuantity, id, productId]);
        } else {
            // Insert new item
            const insertQuery = `
        INSERT INTO cart_items (cart_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
            result = await db.query(insertQuery, [
                id,
                productId,
                quantity,
                product.price,
            ]);
        }

        const fullCart = await fetchCartWithItems(id);
        res.status(201).json({ data: fullCart });
    } catch (error) {
        next(error);
    }
});

// PUT /api/cart/:id/items/:itemId - Update item quantity
router.put('/:id/items/:itemId', async (req, res, next) => {
    try {
        const { id, itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Quantity must be at least 1',
            });
        }

        const query = `
      UPDATE cart_items
      SET quantity = $1
      WHERE id = $2 AND cart_id = $3
      RETURNING *
    `;
        const result = await db.query(query, [quantity, itemId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Cart item not found',
            });
        }

        const fullCart = await fetchCartWithItems(id);
        res.json({ data: fullCart });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/cart/:id/items/:itemId - Remove item
router.delete('/:id/items/:itemId', async (req, res, next) => {
    try {
        const { id, itemId } = req.params;

        const query = `
      DELETE FROM cart_items
      WHERE id = $1 AND cart_id = $2
      RETURNING *
    `;
        const result = await db.query(query, [itemId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Cart item not found',
            });
        }

        const fullCart = await fetchCartWithItems(id);
        res.json({ data: fullCart });
    } catch (error) {
        next(error);
    }
});

// POST /api/cart/merge - Merge guest cart into user cart
router.post('/merge', async (req, res, next) => {
    const client = await db.getClient();
    try {
        const { guestCartId, userId } = req.body;

        if (!guestCartId || !userId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'guestCartId and userId are required',
            });
        }

        await client.query('BEGIN');

        // 1. Get user's existing cart
        const userCartQuery = 'SELECT id FROM carts WHERE user_id = $1';
        const userCartResult = await client.query(userCartQuery, [userId]);
        const userCart = userCartResult.rows[0];

        // 2. Get guest cart items
        const guestItemsQuery = 'SELECT * FROM cart_items WHERE cart_id = $1';
        const guestItemsResult = await client.query(guestItemsQuery, [guestCartId]);
        const guestItems = guestItemsResult.rows;

        let finalCartId;

        if (!userCart) {
            // Case A: User has no cart. Convert guest cart to user cart.
            const updateCartQuery = `
                UPDATE carts 
                SET user_id = $1, session_id = NULL, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id
            `;
            const updateResult = await client.query(updateCartQuery, [userId, guestCartId]);
            finalCartId = updateResult.rows[0].id;
        } else {
            // Case B: User already has a cart. Merge items.
            finalCartId = userCart.id;

            for (const item of guestItems) {
                // Check if user cart already has this product
                const existingItemQuery = `
                    SELECT id, quantity FROM cart_items 
                    WHERE cart_id = $1 AND product_id = $2
                `;
                const existingItemResult = await client.query(existingItemQuery, [finalCartId, item.product_id]);

                if (existingItemResult.rows.length > 0) {
                    // Update quantity
                    const newQuantity = existingItemResult.rows[0].quantity + item.quantity;
                    await client.query(
                        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
                        [newQuantity, existingItemResult.rows[0].id]
                    );
                } else {
                    // Reassign item to user cart
                    await client.query(
                        'UPDATE cart_items SET cart_id = $1 WHERE id = $2',
                        [finalCartId, item.id]
                    );
                }
            }

            // Delete the now-empty (or merged-away) guest cart
            await client.query('DELETE FROM carts WHERE id = $1', [guestCartId]);
        }

        await client.query('COMMIT');

        // Return the full updated cart
        const fullCartResponse = await fetchCartWithItems(finalCartId);
        res.json({ data: fullCartResponse });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

// Helper to fetch cart with all internal details
async function fetchCartWithItems(cartId) {
    const cartQuery = 'SELECT * FROM carts WHERE id = $1';
    const cartResult = await db.query(cartQuery, [cartId]);
    if (cartResult.rows.length === 0) return null;
    const cart = cartResult.rows[0];

    const itemsQuery = `
      SELECT 
        ci.*,
        p.name as product_name,
        p.images as product_images,
        p.slug as product_slug,
        p.stock_quantity,
        (ci.quantity * ci.price) as subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `;
    const itemsResult = await db.query(itemsQuery, [cartId]);

    const subtotal = itemsResult.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return {
        ...cart,
        items: itemsResult.rows,
        subtotal,
        tax,
        total
    };
}

module.exports = router;
