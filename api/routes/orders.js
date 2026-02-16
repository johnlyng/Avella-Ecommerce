const express = require('express');
const router = express.Router();
const orderService = require('../services/OrderService').default;
const { verifyApiKey } = require('../middleware/auth');

// POST /api/orders/external - Create order directly (API Key protected)
router.post('/external', verifyApiKey, async (req, res, next) => {
    try {
        const order = await orderService.createExternalOrder(req.body);
        res.status(201).json({ data: order });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('insufficient stock')) {
            return res.status(400).json({
                error: 'Bad Request',
                message: error.message
            });
        }
        next(error);
    }
});

// PATCH /api/orders/:id/status - Update order status (API Key protected)
router.patch('/:id/status', verifyApiKey, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber } = req.body;

        if (!status) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'status is required'
            });
        }

        const order = await orderService.updateOrderStatus(parseInt(id), status, trackingNumber);
        res.json({ data: order });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                error: 'Not Found',
                message: error.message
            });
        }
        next(error);
    }
});

// POST /api/orders - Create order from cart
router.post('/', async (req, res, next) => {
    try {
        const {
            cartToken,
            userId,
            shippingAddress,
            billingAddress,
        } = req.body;

        if (!cartToken || !shippingAddress) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'cartToken and shippingAddress are required',
            });
        }

        const order = await orderService.createOrder({
            userId,
            cartToken,
            shippingAddress,
            billingAddress
        });

        res.status(201).json({ data: order });
    } catch (error) {
        if (error.message === 'Cart not found') {
            return res.status(404).json({ error: 'Not Found', message: 'Cart not found' });
        }
        if (error.message === 'Cart is empty') {
            return res.status(400).json({ error: 'Bad Request', message: 'Cart is empty' });
        }
        if (error.message.includes('insufficient stock')) {
            return res.status(400).json({ error: 'Insufficient Stock', message: error.message });
        }
        next(error);
    }
});

// GET /api/orders/:orderNumber - Get order details
router.get('/:orderNumber', async (req, res, next) => {
    try {
        const { orderNumber } = req.params;
        const order = await orderService.getOrderByNumber(orderNumber);

        if (!order) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Order not found',
            });
        }

        res.json({ data: order });
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

        const orders = await orderService.getUserOrders(parseInt(userId));

        res.json({ data: orders });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
