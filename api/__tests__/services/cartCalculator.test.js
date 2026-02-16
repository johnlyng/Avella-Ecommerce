// Cart Calculator Service Unit Tests
// Testing cart totals, tax, and shipping calculations

const {
    calculateCartTotals,
    calculateItemsTotals,
    calculateShipping,
    TAX_RATE
} = require('../../services/cartCalculator');

// Mock database
jest.mock('../../config/database');
const db = require('../../config/database');

describe('Cart Calculator Service', () => {

    describe('calculateCartTotals', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should calculate totals with correct tax rate', async () => {
            // Arrange
            const cartId = 1;
            const mockSubtotal = 100;
            db.query.mockResolvedValue({
                rows: [{ subtotal: mockSubtotal.toString() }]
            });

            // Act
            const result = await calculateCartTotals(cartId);

            // Assert
            expect(result.subtotal).toBe(100);
            expect(result.tax).toBe(100 * TAX_RATE);
            expect(result.total).toBe(100 + (100 * TAX_RATE));
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SUM(ci.quantity * ci.price)'),
                [cartId]
            );
        });

        it('should handle empty cart (zero subtotal)', async () => {
            // Arrange
            db.query.mockResolvedValue({
                rows: [{ subtotal: null }]
            });

            // Act
            const result = await calculateCartTotals(1);

            // Assert
            expect(result.subtotal).toBe(0);
            expect(result.tax).toBe(0);
            expect(result.total).toBe(0);
        });

        it('should handle decimal subtotals correctly', async () => {
            // Arrange - $19.99 subtotal
            db.query.mockResolvedValue({
                rows: [{ subtotal: '19.99' }]
            });

            // Act
            const result = await calculateCartTotals(1);

            // Assert
            expect(result.subtotal).toBe(19.99);
            expect(result.tax).toBeCloseTo(1.999, 2); // 10% of 19.99
            expect(result.total).toBeCloseTo(21.989, 2);
        });

        it('should call database with correct cart ID', async () => {
            // Arrange
            const cartId = 42;
            db.query.mockResolvedValue({
                rows: [{ subtotal: '50' }]
            });

            // Act
            await calculateCartTotals(cartId);

            // Assert
            expect(db.query).toHaveBeenCalledWith(
                expect.any(String),
                [cartId]
            );
        });
    });

    describe('calculateItemsTotals', () => {
        it('should calculate totals from items array', () => {
            // Arrange
            const items = [
                { price: '10.00', quantity: 2 },  // $20
                { price: '15.50', quantity: 1 },  // $15.50
                { price: '7.25', quantity: 3 }    // $21.75
            ];

            // Act
            const result = calculateItemsTotals(items);

            // Assert
            expect(result.subtotal).toBe(57.25);
            expect(result.tax).toBeCloseTo(5.725, 2);
            expect(result.total).toBeCloseTo(62.975, 2);
        });

        it('should handle empty items array', () => {
            // Act
            const result = calculateItemsTotals([]);

            // Assert
            expect(result.subtotal).toBe(0);
            expect(result.tax).toBe(0);
            expect(result.total).toBe(0);
        });

        it('should handle single item', () => {
            // Arrange
            const items = [{ price: '100', quantity: 1 }];

            // Act
            const result = calculateItemsTotals(items);

            // Assert
            expect(result.subtotal).toBe(100);
            expect(result.tax).toBe(10);
            expect(result.total).toBe(110);
        });
    });

    describe('calculateShipping', () => {
        it('should return 0 for orders >= $100', () => {
            expect(calculateShipping(100)).toBe(0);
            expect(calculateShipping(150)).toBe(0);
            expect(calculateShipping(1000)).toBe(0);
        });

        it('should return 10 for orders < $100', () => {
            expect(calculateShipping(99.99)).toBe(10);
            expect(calculateShipping(50)).toBe(10);
            expect(calculateShipping(0.01)).toBe(10);
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
