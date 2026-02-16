const express = require('express');
const router = express.Router();
const productService = require('../services/ProductService').default;
const { verifyApiKey } = require('../middleware/auth');

// PATCH /api/products/:id/inventory - Update stock (API Key protected)
router.patch('/:id/inventory', verifyApiKey, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'quantity is required'
            });
        }

        const product = await productService.updateStock(parseInt(id), quantity);
        res.json({ data: product });
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

// POST /api/products - Create product (API Key protected)
router.post('/', verifyApiKey, async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json({ data: product });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Product with this slug or SKU already exists'
            });
        }
        next(error);
    }
});

// PUT /api/products/:id - Update product (API Key protected)
router.put('/:id', verifyApiKey, async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productService.updateProduct(parseInt(id), req.body);
        res.json({ data: product });
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

// DELETE /api/products/:id - Soft delete product (API Key protected)
router.delete('/:id', verifyApiKey, async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productService.deleteProduct(parseInt(id));
        res.json({ data: product, message: 'Product archived successfully' });
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

// GET /api/products - List all products
router.get('/', async (req, res, next) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            limit,
            offset,
            sort
        } = req.query;

        const result = await productService.getProducts({
            category,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            search,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
            sortBy: sort
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

// GET /api/products/:slug - Get single product
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await productService.getProductBySlug(slug);

        if (!product) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Product with slug '${slug}' not found`,
            });
        }

        res.json({ data: product });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
