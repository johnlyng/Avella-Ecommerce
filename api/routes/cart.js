// Cart API Routes
// POST /api/cart - Create cart
// GET /api/cart/:token - Get cart with items (by cart_token)
// POST /api/cart/:token/items - Add item to cart (accepts productSlug)
// PUT /api/cart/:token/items/:itemId - Update item quantity
// DELETE /api/cart/:token/items/:itemId - Remove item from cart
// DELETE /api/cart/:token - Clear cart
// POST /api/cart/merge - Merge guest cart into user cart

const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validation');
const cartService = require('../services/CartService').default;

// POST /api/cart - Create new cart
router.post('/', validate('createCart'), async (req, res) => {
    const { userId, sessionId } = req.body;
    const cart = await cartService.createCart(userId, sessionId);
    res.status(201).json({ data: cart });
});

// GET /api/cart/:token - Get cart with items (by cart_token)
router.get('/:token', async (req, res) => {
    const { token } = req.params;
    const cart = await cartService.getCartByToken(token);
    res.json({ data: cart });
});

// POST /api/cart/:token/items - Add item to cart (accepts productSlug)
router.post('/:token/items', validate('addToCart'), async (req, res) => {
    const { token } = req.params;
    const { productSlug, productId, quantity } = req.body;

    const cart = await cartService.addItemToCart(token, {
        productSlug,
        productId,
        quantity
    });

    res.status(201).json({ data: cart });
});

// PUT /api/cart/:token/items/:itemId - Update item quantity
router.put('/:token/items/:itemId', validate('updateCartItem'), async (req, res) => {
    const { token, itemId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateCartItem(token, parseInt(itemId), quantity);
    res.json({ data: cart });
});

// DELETE /api/cart/:token/items/:itemId - Remove item
router.delete('/:token/items/:itemId', validate('removeCartItem'), async (req, res) => {
    const { token, itemId } = req.params;
    const cart = await cartService.removeCartItem(token, parseInt(itemId));
    res.json({ data: cart });
});

// DELETE /api/cart/:token - Clear cart (remove all items)
router.delete('/:token', async (req, res) => {
    const { token } = req.params;
    const cart = await cartService.clearCart(token);
    res.json({ data: cart });
});

// POST /api/cart/merge - Merge guest cart into user cart
router.post('/merge', validate('mergeCart'), async (req, res) => {
    const { guestCartToken, userId } = req.body;

    // Get or create user cart
    const userCartQuery = 'SELECT cart_token FROM carts WHERE user_id = $1';
    const db = require('../config/database');
    const userCartResult = await db.query(userCartQuery, [userId]);

    let userCartToken;
    if (userCartResult.rows.length === 0) {
        // Create new cart for user
        const newCart = await cartService.createCart(userId, null);
        userCartToken = newCart.cart_token;
    } else {
        userCartToken = userCartResult.rows[0].cart_token;
    }

    const cart = await cartService.mergeCarts(guestCartToken, userCartToken);
    res.json({ data: cart });
});

// Error handling middleware for service errors
router.use((error, req, res, next) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            error: error.statusCode === 404 ? 'Not Found' : 'Bad Request',
            message: error.message
        });
    }
    next(error);
});

module.exports = router;
