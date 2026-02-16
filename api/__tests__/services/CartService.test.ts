// Cart Service Tests - TypeScript version
// Testing all cart service layer methods

import cartService from '../../services/CartService';
import { calculateCartTotals } from '../../services/cartCalculator';

// Mock dependencies
jest.mock('../../db');
jest.mock('../../services/cartCalculator');

import { db } from '../../db';

const mockDb = db as jest.Mocked<typeof db>;
const mockCalculateCartTotals = calculateCartTotals as jest.MockedFunction<typeof calculateCartTotals>;

describe('CartService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createCart', () => {
        it('should create a cart with userId', async () => {
            const userId = 123;
            const mockCart = {
                id: 1,
                cartToken: '123e4567-e89b-12d3-a456-426614174000',
                userId,
                sessionId: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Mock insert
            (mockDb.insert as any).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockCart])
                })
            });

            // Mock getCartById calls
            (mockDb.select as any).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([mockCart])
                    }),
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([])
                    })
                })
            });

            mockCalculateCartTotals.mockResolvedValue({
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0
            });

            const result = await cartService.createCart(userId, null);

            expect(result).toMatchObject({
                id: 1,
                userId
            });
        });
    });

    describe('getCartByToken', () => {
        it('should retrieve cart by valid token', async () => {
            const token = '123e4567-e89b-12d3-a456-426614174000';
            const mockCart = {
                id: 1,
                cartToken: token,
                userId: null,
                sessionId: 'test',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            (mockDb.select as any).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([mockCart])
                    }),
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([])
                    })
                })
            });

            mockCalculateCartTotals.mockResolvedValue({
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0
            });

            const result = await cartService.getCartByToken(token);
            expect(result.id).toBe(1);
        });

        it('should throw 404 error for invalid token', async () => {
            (mockDb.select as any).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([])
                    })
                })
            });

            await expect(cartService.getCartByToken('invalid'))
                .rejects.toThrow('Cart not found');
        });
    });

    // Additional simplified tests for demonstration
    describe('error handling', () => {
        it('should throw error with statusCode property', async () => {
            (mockDb.select as any).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([])
                    })
                })
            });

            try {
                await cartService.getCartByToken('invalid-token');
            } catch (error: any) {
                expect(error.statusCode).toBe(404);
                expect(error.message).toBe('Cart not found');
            }
        });
    });
});
