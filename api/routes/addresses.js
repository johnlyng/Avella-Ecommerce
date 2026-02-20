const express = require('express');
const router = express.Router();
const addressService = require('../services/AddressService').default;
const { verifyApiKey, verifyToken } = require('../middleware/auth');

// Note: Address routes are typically user-specific and require authentication.
// For this POC, we'll use verifyToken if available, or allow userId in body/query for simplicity
// but in a real app, userId should come from the authenticated token.

// GET /api/addresses - List user's addresses
router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const result = await addressService.getAddressesByUserId(userId);
    res.json({ data: result });
});

// POST /api/addresses - Create address
router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const address = await addressService.createAddress(userId, req.body);
    res.status(201).json({ data: address });
});

// GET /api/addresses/:id - Get specific address
router.get('/:id', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const address = await addressService.getAddressById(parseInt(req.params.id), userId);
    if (!address) {
        return res.status(404).json({ error: 'Not Found', message: 'Address not found' });
    }
    res.json({ data: address });
});

// PUT /api/addresses/:id - Update address
router.put('/:id', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const address = await addressService.updateAddress(parseInt(req.params.id), userId, req.body);
    if (!address) {
        return res.status(404).json({ error: 'Not Found', message: 'Address not found' });
    }
    res.json({ data: address });
});

// DELETE /api/addresses/:id - Delete address
router.delete('/:id', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const deleted = await addressService.deleteAddress(parseInt(req.params.id), userId);
    if (!deleted) {
        return res.status(404).json({ error: 'Not Found', message: 'Address not found' });
    }
    res.json({ message: 'Address deleted successfully' });
});

// PATCH /api/addresses/:id/default - Set as default
router.patch('/:id/default', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const updated = await addressService.setDefaultAddress(parseInt(req.params.id), userId);
    if (!updated) {
        return res.status(404).json({ error: 'Not Found', message: 'Address not found' });
    }
    res.json({ data: updated });
});

module.exports = router;
