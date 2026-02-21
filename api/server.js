// Avella Ecommerce API Server
// Express REST API with OpenAPI documentation

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { swaggerUi, swaggerDocument, swaggerOptions } = require('./config/swagger');
const db = require('./config/database');

// Import routes
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const customersRoutes = require('./routes/customers');
const addressesRoutes = require('./routes/addresses');
const companiesRoutes = require('./routes/companies');
const webhooksRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT NOW()');
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
        });
    }
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
app.get('/openapi.yaml', (req, res) => {
    res.sendFile(__dirname + '/openapi.yaml');
});

// API Routes
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/webhooks', webhooksRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.details,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Authentication Error',
            message: 'Invalid token',
        });
    }

    // Database errors
    if (err.code) {
        // Handle foreign key violations for cart_id as 404 (Stale Session)
        if (err.code === '23503' && err.message.includes('cart_id')) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Cart session no longer exists',
            });
        }

        return res.status(500).json({
            error: 'Database Error',
            message: err.message,
        });
    }

    // Generic errors
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'Something went wrong',
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Avella API Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`📄 OpenAPI Spec: http://localhost:${PORT}/openapi.yaml`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    db.pool.end(() => {
        console.log('Database connections closed');
        process.exit(0);
    });
});

module.exports = app;
