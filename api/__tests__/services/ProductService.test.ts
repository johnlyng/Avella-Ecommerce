import productService from '../../services/ProductService';
import { db } from '../../db';

// Mock the db client
jest.mock('../../db', () => {
    // Create base mock builder inside factory
    const mockQueryBuilder: any = {};

    mockQueryBuilder.select = jest.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.from = jest.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.leftJoin = jest.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.where = jest.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.limit = jest.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.offset = jest.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.orderBy = jest.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.$dynamic = jest.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.then = jest.fn().mockImplementation((resolve) => Promise.resolve([{ count: 1 }]).then(resolve));

    return {
        db: {
            select: jest.fn(() => mockQueryBuilder)
        }
    };
});

describe('ProductService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProducts', () => {
        it('should return paginated products with default settings', async () => {
            const mockData = [
                {
                    product: { id: 1, name: 'Test Product', price: '10.00' },
                    categoryName: 'Electronics',
                    categorySlug: 'electronics'
                }
            ];

            // Mock main query result
            const mockQueryBuilder = (db.select as jest.Mock)();
            mockQueryBuilder.offset.mockResolvedValueOnce(mockData);

            // Mock count query result
            // Since we need different return values for the second select call (count),
            // we need to adjust the mock or spy on the execution

            // To handle multiple disparate calls, we can mock implementation of db.select
            (db.select as jest.Mock)
                .mockReturnValueOnce(mockQueryBuilder) // First call (main query)
                .mockReturnValueOnce({ // Second call (count query)
                    ...mockQueryBuilder,
                    where: jest.fn().mockResolvedValueOnce([{ count: 1 }])
                });

            const result = await productService.getProducts({});

            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toHaveProperty('category_name', 'Electronics');
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.limit).toBe(20);
        });

        it('should apply price filters', async () => {
            const params = { minPrice: 10, maxPrice: 100 };

            // Setup chain mocks to capture calls
            const whereSpy = jest.fn().mockReturnThis();
            (db.select as jest.Mock)
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    leftJoin: jest.fn().mockReturnThis(),
                    $dynamic: jest.fn().mockReturnThis(),
                    where: whereSpy,
                    orderBy: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockReturnThis(),
                    offset: jest.fn().mockResolvedValueOnce([])
                })
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnThis(),
                    leftJoin: jest.fn().mockReturnThis(),
                    where: jest.fn().mockResolvedValueOnce([{ count: 0 }])
                });

            await productService.getProducts(params);

            expect(whereSpy).toHaveBeenCalled();
            // In a real integration test we'd check the SQL, but here we check logic flow
        });
    });

    describe('getProductBySlug', () => {
        it('should return product details if found', async () => {
            const mockRow = {
                product: { id: 1, name: 'Slug Product', slug: 'slug-product' },
                categoryName: 'Tools',
                categorySlug: 'tools'
            };

            const limitSpy = jest.fn().mockResolvedValueOnce([mockRow]);

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                limit: limitSpy
            });

            const result = await productService.getProductBySlug('slug-product');

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Slug Product');
            expect(result?.category_name).toBe('Tools');
        });

        it('should return null if not found', async () => {
            const limitSpy = jest.fn().mockResolvedValueOnce([]);

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                limit: limitSpy
            });

            const result = await productService.getProductBySlug('non-existent');

            expect(result).toBeNull();
        });
    });
});
