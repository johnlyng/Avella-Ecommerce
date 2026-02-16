import orderService from '../../services/OrderService';
import { db } from '../../db';

jest.mock('../../db');

describe('OrderService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        const mockCartParams = {
            cartToken: '123e4567-e89b-12d3-a456-426614174000',
            userId: 1,
            shippingAddress: { street: '123 Main St', city: 'City' },
            billingAddress: { street: '456 Side St', city: 'Town' }
        };

        it('should successfully create an order within a transaction', async () => {
            // Mock Transaction
            const mockTx = {
                select: jest.fn(),
                insert: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            };

            // db.transaction executes the callback
            (db.transaction as jest.Mock).mockImplementation(async (cb) => await cb(mockTx));

            // 1. Mock Get Cart
            mockTx.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        limit: jest.fn().mockResolvedValueOnce([{ id: 100 }]) // Cart found
                    })
                })
            });

            // 2. Mock Get Cart Items
            const mockItems = [
                {
                    cartItem: { quantity: 2, cartId: 100 },
                    product: { id: 1, name: 'Test Product', price: '20.00', stockQuantity: 10, sku: 'SKU1' }
                }
            ];
            mockTx.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    innerJoin: jest.fn().mockReturnValueOnce({
                        where: jest.fn().mockResolvedValueOnce(mockItems)
                    })
                })
            });

            // 3. Mock Create Order
            const mockNewOrder = { id: 500, orderNumber: 'ORD-123' };
            mockTx.insert.mockReturnValueOnce({
                values: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([mockNewOrder])
                })
            });

            // 4. Mock Create Order Items (loop) & Update Stock
            mockTx.insert.mockReturnValue({ values: jest.fn().mockResolvedValue({}) }); // For order items
            mockTx.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue({})
                })
            });

            // 5. Mock Clear Cart
            mockTx.delete.mockReturnValue({ where: jest.fn().mockResolvedValue({}) });

            const result = await orderService.createOrder(mockCartParams);

            expect(result).toEqual(mockNewOrder);
            expect(mockTx.insert).toHaveBeenCalledTimes(2); // Order + OrderItem
            expect(mockTx.update).toHaveBeenCalledTimes(1); // Stock update
            expect(mockTx.delete).toHaveBeenCalledTimes(1); // Clear cart
        });

        it('should throw error if cart not found', async () => {
            const mockTx = { select: jest.fn() };
            (db.transaction as jest.Mock).mockImplementation(async (cb) => await cb(mockTx));

            mockTx.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        limit: jest.fn().mockResolvedValueOnce([]) // Cart not found
                    })
                })
            });

            await expect(orderService.createOrder(mockCartParams))
                .rejects.toThrow('Cart not found');
        });

        it('should throw error if insufficient stock', async () => {
            const mockTx = { select: jest.fn() };
            (db.transaction as jest.Mock).mockImplementation(async (cb) => await cb(mockTx));

            // Cart found
            mockTx.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        limit: jest.fn().mockResolvedValueOnce([{ id: 100 }])
                    })
                })
            });

            // Items with low stock
            const mockItems = [
                {
                    cartItem: { quantity: 100, cartId: 100 },
                    product: { id: 1, name: 'Rare Item', price: '1000.00', stockQuantity: 5 }
                }
            ];
            mockTx.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    innerJoin: jest.fn().mockReturnValueOnce({
                        where: jest.fn().mockResolvedValueOnce(mockItems)
                    })
                })
            });

            await expect(orderService.createOrder(mockCartParams))
                .rejects.toThrow('Rare Item has insufficient stock');
        });
    });
});
