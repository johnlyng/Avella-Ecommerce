// Cart Calculator Service Unit Tests - TypeScript version
// Testing cart totals, tax, and shipping calculations

import {
    calculateCartTotals,
    calculateItemsTotals,
    calculateShipping,
    TAX_RATE
} from '../../services/cartCalculator';

// Mock database
jest.mock('../../config/database');

const db = require('../../config/database');

describe('Cart Calculator Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('calculateCartTotals', () => {
        it('should calculate totals with correct tax rate', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ subtotal: '100.00' }]
            });

            const result = await calculateCartTotals(1);

            expect(result.subtotal).toBe(100);
            expect(result.tax).toBe(10); // 10% of 100
            expect(result.shipping).toBe(0); // Free shipping over $100
            expect(result.total).toBe(110);
        });

        it('should handle empty cart (zero subtotal)', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ subtotal: null }]
            });

            const result = await calculateCartTotals(1);

            expect(result.subtotal).toBe(0);
            expect(result.tax).toBe(0);
            expect(result.total).toBe(10); // Just shipping
        });

        it('should handle decimal subtotals correctly', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ subtotal: '99.99' }]
            });

            const result = await calculateCartTotals(1);

            expect(result.subtotal).toBe(99.99);
            expect(result.tax).toBe(10); // 10% rounded
            expect(result.shipping).toBe(10); // Under $100
            expect(result.total).toBe(119.99);
        });

        it('should call database with correct cart ID', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ subtotal: '50.00' }]
            });

            await calculateCartTotals(42);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('cart_id'),
                [42]
            );
        });
    });

    describe('calculateItemsTotals', () => {
        it('should calculate totals from items array', () => {
            const items = [
                { quantity: 2, price: '10.00' },
                { quantity: 1, price: '30.00' }
            ];

            const result = calculateItemsTotals(items);

            expect(result.subtotal).toBe(50);
            expect(result.tax).toBe(5);
            expect(result.shipping).toBe(10);
            expect(result.total).toBe(65);
        });

        it('should handle empty items array', () => {
            const result = calculateItemsTotals([]);

            expect(result.subtotal).toBe(0);
            expect(result.tax).toBe(0);
            expect(result.total).toBe(10); // Just shipping
        });

        it('should handle single item', () => {
            const items = [{ quantity: 3, price: '25.00' }];

            const result = calculateItemsTotals(items);

            expect(result.subtotal).toBe(75);
            expect(result.tax).toBe(7.5);
            expect(result.shipping).toBe(10); // $75 is under $100, so $10 shipping
        });
    });

    describe('calculateShipping', () => {
        it('should return 0 for orders >= $100', () => {
            expect(calculateShipping(100)).toBe(0);
            expect(calculateShipping(150)).toBe(0);
        });

        it('should return 10 for orders < $100', () => {
            expect(calculateShipping(99.99)).toBe(10);
            expect(calculateShipping(50)).toBe(10);
        });

        it('should handle exactly $100', () => {
            expect(calculateShipping(100)).toBe(0);
        });
    });

    describe('TAX_RATE constant', () => {
        it('should be 0.1 (10%) by default', () => {
            expect(TAX_RATE).toBe(0.1);
        });
    });
});
