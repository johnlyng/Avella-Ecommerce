// Authentication API Routes
// POST /api/auth/register - Register new user
// POST /api/auth/login - Login user

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRY = '7d';

// POST /api/auth/register - Register new user
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 }),
        body('firstName').trim().notEmpty(),
        body('lastName').trim().notEmpty(),
        body('companyId').optional().isInt(),
    ],
    async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array(),
            });
        }

        const { email, password, firstName, lastName, companyId } = req.body;

        // Check if user exists
        const existingQuery = 'SELECT * FROM users WHERE email = $1';
        const existing = await db.query(existingQuery, [email]);

        if (existing.rows.length > 0) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'User with this email already exists',
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // Check if provided company exists
        if (companyId) {
            const companyCheck = await db.query('SELECT id FROM companies WHERE id = $1', [companyId]);
            if (companyCheck.rows.length === 0) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Provided company does not exist',
                });
            }
        }

        // Create user
        const createQuery = `
        INSERT INTO users (email, password_hash, first_name, last_name, role, company_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name as "firstName", last_name as "lastName", role, company_id as "companyId", created_at
      `;
        const result = await db.query(createQuery, [
            email,
            passwordHash,
            firstName,
            lastName,
            'customer',
            companyId || null,
        ]);

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.status(201).json({
            message: 'User registered successfully',
            data: {
                user,
                token,
            },
        });
    }
);

// POST /api/auth/login - Login user
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
    ],
    async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Get user
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const userResult = await db.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid email or password',
            });
        }

        const user = userResult.rows[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid email or password',
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        const mappedUser = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            companyId: user.company_id,
            createdAt: user.created_at,
        };

        res.json({
            message: 'Login successful',
            data: {
                user: mappedUser,
                token,
            },
        });
    }
);

module.exports = router;
