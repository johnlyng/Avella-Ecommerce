// Categories API Routes
const express = require('express');
const router = express.Router();
const categoryService = require('../services/CategoryService').default;
const productService = require('../services/ProductService').default;

/**
 * GET /api/categories
 * List all categories with product counts
 */
router.get('/', async (req, res, next) => {
    try {
        const categories = await categoryService.getCategories();
        res.json({ data: categories });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/categories/:slug
 * Get single category with its products
 */
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        // Get category info
        const category = await categoryService.getCategoryBySlug(slug);

        if (!category) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Category with slug '${slug}' not found`,
            });
        }

        // Get products in this category using ProductService
        const productsResult = await productService.getProducts({
            category: slug,
            limit: limit ? parseInt(limit) : 20,
            offset: offset ? parseInt(offset) : 0
        });

        res.json({
            data: {
                ...category,
                products: productsResult.data,
                product_count: productsResult.pagination.total
            },
            pagination: productsResult.pagination
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
