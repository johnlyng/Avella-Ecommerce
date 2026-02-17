
import productService from '../../services/ProductService';

// Mock db
jest.mock('../../db', () => ({
    db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockImplementation(() => {
            return Promise.resolve([
                {
                    product: {
                        id: 1,
                        name: 'Test Product',
                        slug: 'test-product',
                        description: 'Test Description',
                        price: '99.99',
                        compareAtPrice: '120.00',
                        stockQuantity: 10,
                        sku: 'TEST-SKU',
                        categoryId: 1,
                        images: ['img1.jpg'],
                        specifications: {},
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    categoryName: 'Electronics',
                    categorySlug: 'electronics'
                }
            ]);
        }),
        then: jest.fn().mockImplementation((resolve) => {
            return Promise.resolve([{ count: 1 }]).then(resolve);
        }),
        $dynamic: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        returning: jest.fn().mockImplementation(() => {
            return Promise.resolve([{
                id: 1,
                name: 'Test Product',
                slug: 'test-product',
                description: 'Test Description',
                price: '99.99',
                compareAtPrice: '120.00',
                stockQuantity: 50,
                sku: 'TEST-SKU',
                categoryId: 1,
                images: ['img1.jpg'],
                specifications: {},
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
        })
    }
}));

describe('ProductService Mapping', () => {
    it('should return products with snake_case keys in getProducts', async () => {
        const result = await productService.getProducts({});
        const product = result.data[0];

        expect(product).toHaveProperty('stock_quantity', 10);
        expect(product).toHaveProperty('compare_at_price', 120);
        expect(product).toHaveProperty('category_id', 1);
        expect(product).toHaveProperty('is_active', true);
        expect(product).toHaveProperty('created_at');
        expect(product).toHaveProperty('updated_at');
        expect(product).toHaveProperty('imageUrl', 'img1.jpg');
    });

    it('should return updated product with snake_case keys in updateStock', async () => {
        const updated = await productService.updateStock(1, 50);
        expect(updated).toHaveProperty('stock_quantity', 50);
        expect(updated).toHaveProperty('compare_at_price', 120);
    });
});
