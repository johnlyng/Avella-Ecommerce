// Products API Routes
// GET /api/products - List all products (with filters)
// GET /api/products/:slug - Get single product by slug

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/products - List all products
// Query params: category, minPrice, maxPrice, search, limit, offset
router.get('/', async (req, res, next) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            limit = 20,
            offset = 0,
        } = req.query;

        let query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;

        const params = [];
        let paramIndex = 1;

        // Category filter
        if (category) {
            query += ` AND c.slug = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        // Price filters
        if (minPrice) {
            query += ` AND p.price >= $${paramIndex}`;
            params.push(parseFloat(minPrice));
            paramIndex++;
        }

        if (maxPrice) {
            query += ` AND p.price <= $${paramIndex}`;
            params.push(parseFloat(maxPrice));
            paramIndex++;
        }

        // Search filter
        if (search) {
            query += ` AND (
        p.name ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex} OR
        p.sku ILIKE $${paramIndex}
      )`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Order by created_at desc
        query += ` ORDER BY p.created_at DESC`;

        // Pagination
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await db.query(query, params);

        // Get total count for pagination
        let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;

        const countParams = [];
        let countParamIndex = 1;

        if (category) {
            countQuery += ` AND c.slug = $${countParamIndex}`;
            countParams.push(category);
            countParamIndex++;
        }

        if (minPrice) {
            countQuery += ` AND p.price >= $${countParamIndex}`;
            countParams.push(parseFloat(minPrice));
            countParamIndex++;
        }

        if (maxPrice) {
            countQuery += ` AND p.price <= $${countParamIndex}`;
            countParams.push(parseFloat(maxPrice));
            countParamIndex++;
        }

        if (search) {
            countQuery += ` AND (
        p.name ILIKE $${countParamIndex} OR 
        p.description ILIKE $${countParamIndex} OR
        p.sku ILIKE $${countParamIndex}
      )`;
            countParams.push(`%${search}%`);
        }

        const countResult = await db.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            data: result.rows,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: offset + result.rows.length < total,
            },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/products/:slug - Get single product
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;

        const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
    `;

        const result = await db.query(query, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Product with slug '${slug}' not found`,
            });
        }

        res.json({ data: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
