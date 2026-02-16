// CartService Unit Tests
// Testing all cart service layer methods

const cartService = require('../../services/CartService');
const { calculateCartTotals } = require('../../services/cartCalculator');

// Mock dependencies
jest.mock('../../config/database');
jest.mock('../../services/cartCalculator');

const db = require('../../config/database');

describe('CartService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createCart', () => {
        it('should create a cart with userId', async () => {
            // Arrange
            const userId = 123;
            const mockCart = {
                id: 1,
                cart_token: '123e4567-e89b-12d3-a456-426614174000',
                user_id: userId,
                session_id: null,
                created_at: new Date()
            };

            db.query
                .mockResolvedValueOnce({ rows: [mockCart] }) // INSERT cart
                .mockResolvedValueOnce({ rows: [mockCart] }) // SELECT cart
                .mockResolvedValueOnce({ rows: [] }); // SELECT items

            calculateCartTotals.mockResolvedValue({
                subtotal: 0,
                tax: 0,
                total: 0
            });

            // Act
            const result = await cartService.createCart(userId, null);

            // Assert
            expect(result).toMatchObject({
                id: 1,
                user_id: userId,
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0
            });
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO carts'),
                [userId, null]
            );
        });

        it('should create a cart with sessionId', async () => {
            // Arrange
            const sessionId = 'session-abc-123';
            const mockCart = {
                id: 2,
                cart_token: '223e4567-e89b-12d3-a456-426614174001',
                user_id: null,
                session_id: sessionId,
                created_at: new Date()
            };

            db.query
                .mockResolvedValueOnce({ rows: [mockCart] })
                .mockResolvedValueOnce({ rows: [mockCart] })
                .mockResolvedValueOnce({ rows: [] });

            calculateCartTotals.mockResolvedValue({
                subtotal: 0,
                tax: 0,
                total: 0
            });

            // Act
            const result = await cartService.createCart(null, sessionId);

            // Assert
            expect(result.session_id).toBe(sessionId);
            expect(result.user_id).toBeNull();
        });
    });

    describe('getCartByToken', () => {
        it('should retrieve cart by valid token', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            const cartId = 1;
            const mockCart = { id: cartId, cart_token: token };

            db.query
                .mockResolvedValueOnce({ rows: [{ id: cartId }] }) // token lookup
                .mockResolvedValueOnce({ rows: [mockCart] }) // get cart
                .mockResolvedValueOnce({ rows: [] }); // get items

            calculateCartTotals.mockResolvedValue({
                subtotal: 0,
                tax: 0,
                total: 0
            });

            // Act
            const result = await cartService.getCartByToken(token);

            // Assert
            expect(result.id).toBe(cartId);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('cart_token'),
                [token]
            );
        });

        it('should throw 404 error for invalid token', async () => {
            // Arrange
            const invalidToken = 'invalid-token-uuid';
            db.query.mockResolvedValueOnce({ rows: [] });

            // Act & Assert
            await expect(cartService.getCartByToken(invalidToken))
                .rejects.toThrow('Cart not found');
        });
    });

    describe('addItemToCart', () => {
        it('should add new item to cart with productSlug', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            const cartId = 1;
            const productSlug = 'macbook-pro';
            const product = {
                id: 10,
                slug: productSlug,
                name: 'MacBook Pro',
                price: '1999.99',
                stock_quantity: 50
            };

            db.query
                .mockResolvedValueOnce({ rows: [{ id: cartId }] }) // get cart by token
                .mockResolvedValueOnce({ rows: [product] }) // get product by slug
                .mockResolvedValueOnce({ rows: [] }) // check existing item
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // insert cart item
                .mockResolvedValueOnce({ rows: [{ id: cartId }] }) // get cart
                .mockResolvedValueOnce({ rows: [] }); // get items

            calculateCartTotals.mockResolvedValue({
                subtotal: 1999.99,
                tax: 199.99,
                total: 2199.98
            });

            // Act
            const result = await cartService.addItemToCart(token, {
                productSlug,
                quantity: 1
            });

            // Assert
            expect(result).toBeDefined();
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('slug'),
                [productSlug]
            );
        });

        it('should update quantity if item already in cart', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            const cartId = 1;
            const productId = 10;
            const existingItem = {
                id: 1,
                cart_id: cartId,
                product_id: productId,
                quantity: 2,
                price: '1999.99'
            };
            const product = {
                id: productId,
                price: '1999.99',
                stock_quantity: 50
            };

            db.query
                .mockResolvedValueOnce({ rows: [{ id: cartId }] })
                .mockResolvedValueOnce({ rows: [product] })
                .mockResolvedValueOnce({ rows: [existingItem] }) // existing item found
                .mockResolvedValueOnce({ rows: [{ ...existingItem, quantity: 3 }] }) // update
                .mockResolvedValueOnce({ rows: [{ id: cartId }] })
                .mockResolvedValueOnce({ rows: [] });

            calculateCartTotals.mockResolvedValue({
                subtotal: 5999.97,
                tax: 599.99,
                total: 6599.96
            });

            // Act
            await cartService.addItemToCart(token, { productId, quantity: 1 });

            // Assert
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE cart_items'),
                [3, cartId, productId] // new quantity = 2 + 1
            );
        });

        it('should throw error when product not found', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [] }); // product not found

            // Act & Assert
            await expect(
                cartService.addItemToCart(token, { productSlug: 'nonexistent' })
            ).rejects.toThrow('Product not found');
        });

        it('should throw error when insufficient stock', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            const product = {
                id: 10,
                stock_quantity: 2
            };

            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [product] });

            // Act & Assert
            await expect(
                cartService.addItemToCart(token, { productId: 10, quantity: 5 })
            ).rejects.toThrow('Only 2 items available');
        });
    });

    describe('updateCartItem', () => {
        it('should update item quantity', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            const cartId = 1;
            const itemId = 5;
            const newQuantity = 3;
            const item = {
                id: itemId,
                cart_id: cartId,
                product_id: 10,
                quantity: 1,
                stock_quantity: 50
            };

            db.query
                .mockResolvedValueOnce({ rows: [{ id: cartId }] })
                .mockResolvedValueOnce({ rows: [item] }) // verify item
                .mockResolvedValueOnce({ rows: [{ ...item, quantity: newQuantity }] }) // update
                .mockResolvedValueOnce({ rows: [{ id: cartId }] })
                .mockResolvedValueOnce({ rows: [] });

            calculateCartTotals.mockResolvedValue({
                subtotal: 100,
                tax: 10,
                total: 110
            });

            // Act
            const result = await cartService.updateCartItem(token, itemId, newQuantity);

            // Assert
            expect(result).toBeDefined();
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE cart_items'),
                [newQuantity, itemId]
            );
        });

        it('should throw error if item not found', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [] }); // item not found

            // Act & Assert
            await expect(
                cartService.updateCartItem(token, 999, 2)
            ).rejects.toThrow('Cart item not found');
        });

        it('should throw error if quantity exceeds stock', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            const item = {
                id: 1,
                stock_quantity: 5
            };

            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [item] });

            // Act & Assert
            await expect(
                cartService.updateCartItem(token, 1, 10)
            ).rejects.toThrow('Only 5 items available');
        });
    });

    describe('removeCartItem', () => {
        it('should remove item from cart', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            const cartId = 1;
            const itemId = 5;

            db.query
                .mockResolvedValueOnce({ rows: [{ id: cartId }] })
                .mockResolvedValueOnce({ rows: [{ id: itemId }] }) // delete
                .mockResolvedValueOnce({ rows: [{ id: cartId }] })
                .mockResolvedValueOnce({ rows: [] });

            calculateCartTotals.mockResolvedValue({
                subtotal: 0,
                tax: 0,
                total: 0
            });

            // Act
            const result = await cartService.removeCartItem(token, itemId);

            // Assert
            expect(result).toBeDefined();
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM cart_items'),
                [itemId, cartId]
            );
        });

        it('should throw error if item not found', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [] }); // delete returns nothing

            // Act & Assert
            await expect(
                cartService.removeCartItem(token, 999)
            ).rejects.toThrow('Cart item not found');
        });
    });

    describe('clearCart', () => {
        it('should remove all items from cart', async () => {
            // Arrange
            const token = '123e4567-e89b-12d3-a456-426614174000';
            const cartId = 1;

            db.query
                .mockResolvedValueOnce({ rows: [{ id: cartId }] })
                .mockResolvedValueOnce({ rows: [] }) // delete all items
                .mockResolvedValueOnce({ rows: [{ id: cartId }] })
                .mockResolvedValueOnce({ rows: [] });

            calculateCartTotals.mockResolvedValue({
                subtotal: 0,
                tax: 0,
                total: 0
            });

            // Act
            const result = await cartService.clearCart(token);

            // Assert
            expect(result.items).toHaveLength(0);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM cart_items WHERE cart_id'),
                [cartId]
            );
        });
    });

    describe('mergeCarts', () => {
        it('should merge guest cart into user cart', async () => {
            // Arrange
            const guestToken = 'guest-token-uuid';
            const userToken = 'user-token-uuid';
            const guestCartId = 1;
            const userCartId = 2;

            const guestCart = {
                id: guestCartId,
                items: [
                    { product_id: 10, quantity: 2, price: '19.99' }
                ]
            };

            const userCart = {
                id: userCartId,
                items: []
            };

            db.query
                // First getCartByToken (guest)
                .mockResolvedValueOnce({ rows: [{ id: guestCartId }] })
                .mockResolvedValueOnce({ rows: [guestCart] })
                .mockResolvedValueOnce({ rows: guestCart.items })
                // Second getCartByToken (user)
                .mockResolvedValueOnce({ rows: [{ id: userCartId }] })
                .mockResolvedValueOnce({ rows: [userCart] })
                .mockResolvedValueOnce({ rows: [] })
                // Merge operations
                .mockResolvedValueOnce({ rows: [] }) // check existing
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // insert
                .mockResolvedValueOnce({ rows: [] }) // delete guest cart
                // Final getCartById
                .mockResolvedValueOnce({ rows: [userCart] })
                .mockResolvedValueOnce({ rows: guestCart.items });

            calculateCartTotals.mockResolvedValue({
                subtotal: 39.98,
                tax: 3.99,
                total: 43.97
            });

            // Act
            const result = await cartService.mergeCarts(guestToken, userToken);

            // Assert
            expect(result).toBeDefined();
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM carts'),
                [guestToken]
            );
        });
    });

    describe('Error handling', () => {
        it('should throw error with statusCode property', async () => {
            // Arrange
            db.query.mockResolvedValueOnce({ rows: [] });

            // Act & Assert
            try {
                await cartService.getCartByToken('invalid-token');
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.message).toBe('Cart not found');
            }
        });
    });
});
