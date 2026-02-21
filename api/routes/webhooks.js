const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const webhookService = require('../services/WebhookService').default;

// Middleware: admin only
const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    }
    next();
};

// GET /api/webhooks/logs - List delivery logs
router.get('/logs', verifyToken, adminOnly, async (req, res) => {
    const logs = await webhookService.getLogs();
    res.json({ data: logs });
});

// GET /api/webhooks - List all endpoints
router.get('/', verifyToken, adminOnly, async (req, res) => {
    const endpoints = await webhookService.getEndpoints();
    res.json({ data: endpoints });
});

// POST /api/webhooks - Create new endpoint
router.post('/', verifyToken, adminOnly, async (req, res) => {
    const { label, url, events, isActive } = req.body;

    if (!label || !url || !Array.isArray(events)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'label, url, and events (array) are required',
        });
    }

    try {
        new URL(url); // Validate URL format
    } catch {
        return res.status(400).json({ error: 'Bad Request', message: 'Invalid URL format' });
    }

    const endpoint = await webhookService.createEndpoint({ label, url, events, isActive });
    res.status(201).json({ data: endpoint });
});

// PATCH /api/webhooks/:id - Update endpoint
router.patch('/:id', verifyToken, adminOnly, async (req, res) => {
    const id = parseInt(req.params.id);
    const { label, url, events, isActive } = req.body;

    if (url) {
        try { new URL(url); } catch {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid URL format' });
        }
    }

    const endpoint = await webhookService.updateEndpoint(id, { label, url, events, isActive });
    if (!endpoint) {
        return res.status(404).json({ error: 'Not Found', message: 'Webhook endpoint not found' });
    }
    res.json({ data: endpoint });
});

// DELETE /api/webhooks/:id - Delete endpoint
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
    const id = parseInt(req.params.id);
    const endpoint = await webhookService.deleteEndpoint(id);
    if (!endpoint) {
        return res.status(404).json({ error: 'Not Found', message: 'Webhook endpoint not found' });
    }
    res.json({ data: endpoint });
});

module.exports = router;
