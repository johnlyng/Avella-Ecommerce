// Cart Service Layer
// Handles all cart-related business logic

const db = require('../config/database');
const { calculateCartTotals } = require('./cartCalculator');

class CartService {
    /**
     * Create a new cart
     * @param {number|null} userId - User ID (optional)
     * @param {string|null} sessionId - Session ID (optional)
     * @returns {Promise<Object>} - Created cart with items
     */
    async createCart(userId = null, sessionId = null) {
        const query = `
            INSERT INTO carts (user_id, session_id)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result = await db.query(query, [userId, sessionId]);
        const cart = result.rows[0];
        return await this.getCartById(cart.id);
    }

    /**
     * Get cart by token
     * @param {string} token - Cart token (UUID)
     * @returns {Promise<Object>} - Cart with items
     * @throws {Error} - If cart not found
     */
    async getCartByToken(token) {
        const cartQuery = 'SELECT id FROM carts WHERE cart_token = $1';
        const cartResult = await db.query(cartQuery, [token]);

        if (cartResult.rows.length === 0) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        const cartId = cartResult.rows[0].id;
        return await this.getCartById(cartId);
    }

    /**
     * Get cart by ID with all items
     * @param {number} cartId - Cart ID
     * @returns {Promise<Object>} - Cart with items
     */
    async getCartById(cartId) {
        const cartQuery = 'SELECT * FROM carts WHERE id = $1';
        const cartResult = await db.query(cartQuery, [cartId]);

        if (cartResult.rows.length === 0) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        const cart = cartResult.rows[0];

        // Get cart items with product details
        const itemsQuery = `
            SELECT 
                ci.id,
                ci.quantity,
                ci.price,
                p.id as product_id,
                p.name,
                p.slug,
                p.description,
                p.category_id,
                p.price as current_price,
                p.stock_quantity
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1
        `;
        const itemsResult = await db.query(itemsQuery, [cartId]);

        // Calculate totals
        const totals = await calculateCartTotals(cartId);

        return {
            ...cart,
            items: itemsResult.rows,
            ...totals
        };
    }

    /**
     * Add item to cart
     * @param {string} token - Cart token
     * @param {Object} itemData - Item data {productSlug?, productId?, quantity}
     * @returns {Promise<Object>} - Updated cart
     */
    async addItemToCart(token, { productSlug, productId, quantity = 1 }) {
        // Get cart ID from token
        const cartQuery = 'SELECT id FROM carts WHERE cart_token = $1';
        const cartResult = await db.query(cartQuery, [token]);

        if (cartResult.rows.length === 0) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        const cartId = cartResult.rows[0].id;

        // Get product details by slug or id
        let productQuery, productParam;
        if (productSlug) {
            productQuery = 'SELECT * FROM products WHERE slug = $1 AND is_active = true';
            productParam = productSlug;
        } else if (productId) {
            productQuery = 'SELECT * FROM products WHERE id = $1 AND is_active = true';
            productParam = productId;
        } else {
            const error = new Error('productSlug or productId is required');
            error.statusCode = 400;
            throw error;
        }

        const productResult = await db.query(productQuery, [productParam]);

        if (productResult.rows.length === 0) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        const product = productResult.rows[0];

        // Check stock availability
        if (product.stock_quantity < quantity) {
            const error = new Error(`Only ${product.stock_quantity} items available`);
            error.statusCode = 400;
            throw error;
        }

        // Check if item already in cart
        const existingQuery = `
            SELECT * FROM cart_items 
            WHERE cart_id = $1 AND product_id = $2
        `;
        const existingResult = await db.query(existingQuery, [cartId, product.id]);

        if (existingResult.rows.length > 0) {
            // Update quantity
            const newQuantity = existingResult.rows[0].quantity + quantity;
            const updateQuery = `
                UPDATE cart_items
                SET quantity = $1
                WHERE cart_id = $2 AND product_id = $3
                RETURNING *
            `;
            await db.query(updateQuery, [newQuantity, cartId, product.id]);
        } else {
            // Insert new item
            const insertQuery = `
                INSERT INTO cart_items (cart_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            await db.query(insertQuery, [cartId, product.id, quantity, product.price]);
        }

        return await this.getCartById(cartId);
    }

    /**
     * Update cart item quantity
     * @param {string} token - Cart token
     * @param {number} itemId - Cart item ID
     * @param {number} quantity - New quantity
     * @returns {Promise<Object>} - Updated cart
     */
    async updateCartItem(token, itemId, quantity) {
        const cartQuery = 'SELECT id FROM carts WHERE cart_token = $1';
        const cartResult = await db.query(cartQuery, [token]);

        if (cartResult.rows.length === 0) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        const cartId = cartResult.rows[0].id;

        // Verify item belongs to cart
        const itemQuery = `
            SELECT ci.*, p.stock_quantity
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.id = $1 AND ci.cart_id = $2
        `;
        const itemResult = await db.query(itemQuery, [itemId, cartId]);

        if (itemResult.rows.length === 0) {
            const error = new Error('Cart item not found');
            error.statusCode = 404;
            throw error;
        }

        const item = itemResult.rows[0];

        // Check stock availability
        if (item.stock_quantity < quantity) {
            const error = new Error(`Only ${item.stock_quantity} items available`);
            error.statusCode = 400;
            throw error;
        }

        // Update quantity
        const updateQuery = `
            UPDATE cart_items
            SET quantity = $1
            WHERE id = $2
            RETURNING *
        `;
        await db.query(updateQuery, [quantity, itemId]);

        return await this.getCartById(cartId);
    }

    /**
     * Remove item from cart
     * @param {string} token - Cart token
     * @param {number} itemId - Cart item ID
     * @returns {Promise<Object>} - Updated cart
     */
    async removeCartItem(token, itemId) {
        const cartQuery = 'SELECT id FROM carts WHERE cart_token = $1';
        const cartResult = await db.query(cartQuery, [token]);

        if (cartResult.rows.length === 0) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        const cartId = cartResult.rows[0].id;

        // Delete item (verify it belongs to this cart)
        const deleteQuery = `
            DELETE FROM cart_items
            WHERE id = $1 AND cart_id = $2
            RETURNING *
        `;
        const result = await db.query(deleteQuery, [itemId, cartId]);

        if (result.rows.length === 0) {
            const error = new Error('Cart item not found');
            error.statusCode = 404;
            throw error;
        }

        return await this.getCartById(cartId);
    }

    /**
     * Clear all items from cart
     * @param {string} token - Cart token
     * @returns {Promise<Object>} - Empty cart
     */
    async clearCart(token) {
        const cartQuery = 'SELECT id FROM carts WHERE cart_token = $1';
        const cartResult = await db.query(cartQuery, [token]);

        if (cartResult.rows.length === 0) {
            const error = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        const cartId = cartResult.rows[0].id;

        const deleteQuery = 'DELETE FROM cart_items WHERE cart_id = $1';
        await db.query(deleteQuery, [cartId]);

        return await this.getCartById(cartId);
    }

    /**
     * Merge guest cart into user cart
     * @param {string} guestCartToken - Guest cart token
     * @param {string} userCartToken - User cart token
     * @returns {Promise<Object>} - Merged cart
     */
    async mergeCarts(guestCartToken, userCartToken) {
        // Get both carts
        const guestCart = await this.getCartByToken(guestCartToken);
        const userCart = await this.getCartByToken(userCartToken);

        // Move all items from guest cart to user cart
        for (const item of guestCart.items) {
            const existingQuery = `
                SELECT * FROM cart_items
                WHERE cart_id = $1 AND product_id = $2
            `;
            const existingResult = await db.query(existingQuery, [
                userCart.id,
                item.product_id
            ]);

            if (existingResult.rows.length > 0) {
                // Update quantity (add to existing)
                const newQuantity = existingResult.rows[0].quantity + item.quantity;
                const updateQuery = `
                    UPDATE cart_items
                    SET quantity = $1
                    WHERE cart_id = $2 AND product_id = $3
                `;
                await db.query(updateQuery, [newQuantity, userCart.id, item.product_id]);
            } else {
                // Insert new item
                const insertQuery = `
                    INSERT INTO cart_items (cart_id, product_id, quantity, price)
                    VALUES ($1, $2, $3, $4)
                `;
                await db.query(insertQuery, [
                    userCart.id,
                    item.product_id,
                    item.quantity,
                    item.price
                ]);
            }
        }

        // Delete guest cart
        const deleteQuery = 'DELETE FROM carts WHERE cart_token = $1';
        await db.query(deleteQuery, [guestCartToken]);

        return await this.getCartById(userCart.id);
    }
}

module.exports = new CartService();
