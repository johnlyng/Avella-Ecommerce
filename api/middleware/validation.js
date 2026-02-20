// Zod Validation Middleware for API Routes
// Provides type-safe request validation with detailed error messages

const { z } = require('zod');

// Validation schemas for cart operations
const schemas = {
    // Create cart
    createCart: z.object({
        body: z.object({
            userId: z.number().int().positive().optional(),
            sessionId: z.string().min(1).optional()
        }).refine(data => data.userId || data.sessionId, {
            message: "Either userId or sessionId is required"
        })
    }),

    // Add item to cart
    addToCart: z.object({
        params: z.object({
            token: z.string().uuid()
        }),
        body: z.object({
            productSlug: z.string().min(1).optional(),
            productId: z.number().int().positive().optional(),
            quantity: z.number().int().min(1).default(1)
        }).refine(data => data.productSlug || data.productId, {
            message: "Either productSlug or productId is required"
        })
    }),

    // Update cart item quantity
    updateCartItem: z.object({
        params: z.object({
            token: z.string().uuid(),
            itemId: z.string().regex(/^\d+$/).transform(Number)
        }),
        body: z.object({
            quantity: z.number().int().min(1)
        })
    }),

    // Remove cart item
    removeCartItem: z.object({
        params: z.object({
            token: z.string().uuid(),
            itemId: z.string().regex(/^\d+$/).transform(Number)
        })
    }),

    // Merge cart
    mergeCart: z.object({
        body: z.object({
            guestCartToken: z.string().uuid(),
            userId: z.union([z.string().min(1), z.number().int().positive()]).transform(Number)
        })
    }),

    // Create order
    createOrder: z.object({
        body: z.object({
            cartToken: z.string().uuid(),
            userId: z.string().optional(),
            shippingAddress: z.object({
                name: z.string().min(1),
                street: z.string().min(1),
                city: z.string().min(1),
                state: z.string().min(1),
                zip: z.string().min(1),
                country: z.string().min(1)
            }),
            billingAddress: z.object({
                name: z.string().min(1),
                street: z.string().min(1),
                city: z.string().min(1),
                state: z.string().min(1),
                zip: z.string().min(1),
                country: z.string().min(1)
            }).optional()
        })
    }),

    // Auth - Register
    register: z.object({
        body: z.object({
            email: z.string().email(),
            password: z.string().min(8),
            firstName: z.string().min(1).trim(),
            lastName: z.string().min(1).trim()
        })
    }),

    // Auth - Login
    login: z.object({
        body: z.object({
            email: z.string().email(),
            password: z.string().min(1)
        })
    })
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the schema to use
 * @returns {Function} Express middleware
 */
function validate(schemaName) {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: `Validation schema '${schemaName}' not found`
            });
        }

        try {
            // Validate request
            const validated = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });

            // Replace req objects with validated data
            req.body = validated.body || req.body;
            req.query = validated.query || req.query;
            req.params = validated.params || req.params;

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Request validation failed',
                    details: (error.errors || []).map(err => ({
                        path: (err.path || []).join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
}

module.exports = { validate, schemas };
