// Categories API Routes
// GET /api/categories - List all categories
// GET /api/categories/:slug - Get single category with products

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/categories - List all categories
router.get('/', async (req, res, next) => {
    try {
        const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

        const result = await db.query(query);

        res.json({ data: result.rows });
    } catch (error) {
        next(error);
    }
});

// GET /api/categories/:slug - Get category with products
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        // Get category
        const categoryQuery = `
      SELECT * FROM categories WHERE slug = $1
    `;
        const categoryResult = await db.query(categoryQuery, [slug]);

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Category with slug '${slug}' not found`,
            });
        }

        const category = categoryResult.rows[0];

        // Get products in category
        const productsQuery = `
      SELECT * FROM products
      WHERE category_id = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
        const productsResult = await db.query(productsQuery, [
            category.id,
            parseInt(limit),
            parseInt(offset),
        ]);

        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total
      FROM products
      WHERE category_id = $1 AND is_active = true
    `;
        const countResult = await db.query(countQuery, [category.id]);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            data: {
                ...category,
                products: productsResult.rows,
                product_count: total,
            },
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: offset + productsResult.rows.length < total,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
