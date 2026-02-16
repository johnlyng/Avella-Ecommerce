const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock services
jest.mock('../../services/OrderService', () => ({
    default: {
        createExternalOrder: jest.fn(),
        updateOrderStatus: jest.fn()
    }
}));
jest.mock('../../services/CustomerService', () => ({
    default: {
        getCustomers: jest.fn(),
        createCustomer: jest.fn()
    }
}));
jest.mock('../../services/ProductService', () => ({
    default: {
        createProduct: jest.fn(),
        updateProduct: jest.fn(),
        deleteProduct: jest.fn(),
        updateStock: jest.fn(),
        getProducts: jest.fn(),
        getProductBySlug: jest.fn()
    }
}));

const orderService = require('../../services/OrderService').default;
const customerService = require('../../services/CustomerService').default;
const productService = require('../../services/ProductService').default;

const app = express();
app.use(bodyParser.json());

// Set API Key for tests
process.env.API_KEY = 'test-api-key';

// Import and use routes
app.use('/api/orders', require('../../routes/orders'));
app.use('/api/customers', require('../../routes/customers'));
app.use('/api/products', require('../../routes/products'));

describe('API External Integration Endpoints', () => {
    describe('Authentication', () => {
        it('should return 401 if x-api-key is missing', async () => {
            const res = await request(app).get('/api/customers');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Unauthorized');
        });

        it('should return 401 if x-api-key is invalid', async () => {
            const res = await request(app)
                .get('/api/customers')
                .set('x-api-key', 'wrong-key');
            expect(res.status).toBe(401);
        });
    });

    describe('Customer Management', () => {
        it('should list customers', async () => {
            customerService.getCustomers.mockResolvedValue({ data: [{ id: 1, email: 'test@example.com' }] });

            const res = await request(app)
                .get('/api/customers')
                .set('x-api-key', 'test-api-key');

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });

        it('should create a customer', async () => {
            const newCustomer = { email: 'new@example.com', firstName: 'John' };
            customerService.createCustomer.mockResolvedValue({ id: 2, ...newCustomer });

            const res = await request(app)
                .post('/api/customers')
                .set('x-api-key', 'test-api-key')
                .send(newCustomer);

            expect(res.status).toBe(201);
            expect(res.body.data.email).toBe(newCustomer.email);
        });
    });

    describe('Order Management', () => {
        it('should create an external order', async () => {
            const orderData = { customerId: 1, items: [{ productId: 1, quantity: 1 }] };
            orderService.createExternalOrder.mockResolvedValue({ id: 101, orderNumber: 'EXT-101' });

            const res = await request(app)
                .post('/api/orders/external')
                .set('x-api-key', 'test-api-key')
                .send(orderData);

            expect(res.status).toBe(201);
            expect(res.body.data.orderNumber).toBe('EXT-101');
        });

        it('should update order status', async () => {
            orderService.updateOrderStatus.mockResolvedValue({ id: 101, status: 'shipped' });

            const res = await request(app)
                .patch('/api/orders/101/status')
                .set('x-api-key', 'test-api-key')
                .send({ status: 'shipped' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('shipped');
        });
    });

    describe('Product Management', () => {
        it('should update product inventory', async () => {
            productService.updateStock.mockResolvedValue({ id: 1, stockQuantity: 50 });

            const res = await request(app)
                .patch('/api/products/1/inventory')
                .set('x-api-key', 'test-api-key')
                .send({ quantity: 50 });

            expect(res.status).toBe(200);
            expect(res.body.data.stockQuantity).toBe(50);
        });

        it('should create a product', async () => {
            const productData = { name: 'New Gadget', price: '99.99', sku: 'GAD-001' };
            productService.createProduct.mockResolvedValue({ id: 5, ...productData });

            const res = await request(app)
                .post('/api/products')
                .set('x-api-key', 'test-api-key')
                .send(productData);

            expect(res.status).toBe(201);
            expect(res.body.data.sku).toBe('GAD-001');
        });
    });
});
