
const productService = require('./services/ProductService').default;
const { products } = require('./db/schema');

// Mock db to return a fake product with camelCase keys (as Drizzle would)
jest.mock('./db', () => ({
    db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockImplementation(() => {
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
        $dynamic: jest.fn().mockReturnThis(),
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

async function verify() {
    console.log('Verifying ProductService mapping...');
    const result = await productService.getProducts({});
    const product = result.data[0];

    const expectedKeys = [
        'id', 'name', 'slug', 'description', 'price', 'compare_at_price',
        'stock_quantity', 'sku', 'category_id', 'images', 'imageUrl',
        'specifications', 'is_active', 'created_at', 'updated_at',
        'category_name', 'category_slug'
    ];

    let missing = [];
    expectedKeys.forEach(key => {
        if (!(key in product)) missing.push(key);
    });

    if (missing.length === 0) {
        console.log('✅ getProducts mapping OK');
    } else {
        console.error('❌ getProducts mapping FAILED. Missing keys:', missing);
    }

    console.log('Verifying updateStock mapping...');
    const updated = await productService.updateStock(1, 50);
    if ('stock_quantity' in updated) {
        console.log('✅ updateStock mapping OK');
    } else {
        console.error('❌ updateStock mapping FAILED. Missing stock_quantity');
    }
}

verify().catch(console.error);
