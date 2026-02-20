const express = require('express');
const router = express.Router();
const customerService = require('../services/CustomerService').default;
const { verifyApiKey } = require('../middleware/auth');

// GET /api/customers - List customers (API Key protected)
router.get('/', verifyApiKey, async (req, res) => {
    const { search, email, limit, offset } = req.query;
    const result = await customerService.getCustomers({
        search,
        email,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
    });
    res.json(result);
});

// POST /api/customers - Create customer (API Key protected)
router.post('/', verifyApiKey, async (req, res) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json({ data: customer });
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({
                error: 'Conflict',
                message: 'Customer with this email already exists'
            });
        }
        throw error;
    }
});

module.exports = router;
