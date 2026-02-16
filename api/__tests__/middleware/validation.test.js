// Validation Middleware Unit Tests
// Testing Zod schema validation for API endpoints

const { validate, schemas } = require('../../middleware/validation');
const { z } = require('zod');

describe('Validation Middleware', () => {

    describe('validate middleware factory', () => {
        it('should return a middleware function', () => {
            const middleware = validate('createCart');
            expect(typeof middleware).toBe('function');
            expect(middleware.length).toBe(3); // req, res, next
        });

        it('should return 500 for unknown schema', () => {
            // Arrange
            const middleware = validate('nonExistentSchema');
            const req = {};
            const res = testUtils.mockExpressRes();
            const next = jest.fn();

            // Act
            middleware(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Internal Server Error',
                message: expect.stringContaining('nonExistentSchema')
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('createCart schema', () => {
        let middleware, req, res, next;

        beforeEach(() => {
            middleware = validate('createCart');
            res = testUtils.mockExpressRes();
            next = jest.fn();
        });

        it('should accept valid userId', () => {
            // Arrange
            req = {
                body: { userId: 123 },
                params: {},
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should accept valid sessionId', () => {
            // Arrange
            req = {
                body: { sessionId: 'session-123' },
                params: {},
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
        });

        it('should reject when both userId and sessionId are missing', () => {
            // Arrange
            req = {
                body: {},
                params: {},
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation Error',
                    message: 'Request validation failed'
                })
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('addToCart schema', () => {
        let middleware, req, res, next;

        beforeEach(() => {
            middleware = validate('addToCart');
            res = testUtils.mockExpressRes();
            next = jest.fn();
        });

        it('should accept valid productSlug', () => {
            // Arrange
            req = {
                body: { productSlug: 'macbook-pro', quantity: 1 },
                params: { token: '123e4567-e89b-12d3-a456-426614174000' },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
        });

        it('should accept valid productId', () => {
            // Arrange
            req = {
                body: { productId: 42 },
                params: { token: '123e4567-e89b-12d3-a456-426614174000' },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
        });

        it('should reject when both productSlug and productId are missing', () => {
            // Arrange
            req = {
                body: { quantity: 1 },
                params: { token: '123e4567-e89b-12d3-a456-426614174000' },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation Error'
                })
            );
        });

        it('should reject invalid UUID token', () => {
            // Arrange
            req = {
                body: { productSlug: 'test' },
                params: { token: 'not-a-uuid' },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        it('should default quantity to 1 if not provided', () => {
            // Arrange
            req = {
                body: { productSlug: 'test' },
                params: { token: '123e4567-e89b-12d3-a456-426614174000' },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.body.quantity).toBe(1);
        });

        it('should reject negative quantity', () => {
            // Arrange
            req = {
                body: { productSlug: 'test', quantity: -1 },
                params: { token: '123e4567-e89b-12d3-a456-426614174000' },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should reject zero quantity', () => {
            // Arrange
            req = {
                body: { productSlug: 'test', quantity: 0 },
                params: { token: '123e4567-e89b-12d3-a456-426614174000' },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateCartItem schema', () => {
        let middleware, req, res, next;

        beforeEach(() => {
            middleware = validate('updateCartItem');
            res = testUtils.mockExpressRes();
            next = jest.fn();
        });

        it('should accept valid quantity update', () => {
            // Arrange
            req = {
                body: { quantity: 5 },
                params: {
                    token: '123e4567-e89b-12d3-a456-426614174000',
                    itemId: '123'
                },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
        });

        it('should transform itemId string to number', () => {
            // Arrange
            req = {
                body: { quantity: 1 },
                params: {
                    token: '123e4567-e89b-12d3-a456-426614174000',
                    itemId: '456'
                },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.params.itemId).toBe(456);
        });

        it('should reject missing quantity', () => {
            // Arrange
            req = {
                body: {},
                params: {
                    token: '123e4567-e89b-12d3-a456-426614174000',
                    itemId: '123'
                },
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('register schema', () => {
        let middleware, req, res, next;

        beforeEach(() => {
            middleware = validate('register');
            res = testUtils.mockExpressRes();
            next = jest.fn();
        });

        it('should accept valid registration data', () => {
            // Arrange
            req = {
                body: {
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'John',
                    lastName: 'Doe'
                },
                params: {},
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
        });

        it('should reject invalid email', () => {
            // Arrange
            req = {
                body: {
                    email: 'not-an-email',
                    password: 'password123',
                    firstName: 'John',
                    lastName: 'Doe'
                },
                params: {},
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should reject password shorter than 8 characters', () => {
            // Arrange
            req = {
                body: {
                    email: 'test@example.com',
                    password: 'short',
                    firstName: 'John',
                    lastName: 'Doe'
                },
                params: {},
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should trim firstName and lastName', () => {
            // Arrange
            req = {
                body: {
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: '  John  ',
                    lastName: '  Doe  '
                },
                params: {},
                query: {}
            };

            // Act
            middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.body.firstName).toBe('John');
            expect(req.body.lastName).toBe('Doe');
        });
    });
});
