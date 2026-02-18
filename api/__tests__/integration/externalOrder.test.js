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

const orderService = require('../../services/OrderService').default;

const app = express();
app.use(bodyParser.json());

// Set API Key for tests
process.env.API_KEY = 'test-api-key';

// Import and use routes
app.use('/api/orders', require('../../routes/orders'));

describe('External Order API Integration', () => {

    // Clear mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/orders/external', () => {

        it('should return 401 if x-api-key is missing', async () => {
            const res = await request(app)
                .post('/api/orders/external')
                .send({ customerId: 1, items: [] });
            expect(res.status).toBe(401);
        });

        it('should return 400 if customerId is missing', async () => {
            const res = await request(app)
                .post('/api/orders/external')
                .set('x-api-key', 'test-api-key')
                .send({
                    // Missing customerId
                    items: [{ productSlug: 'laptop', quantity: 1 }],
                    shippingAddress: { street: '123 Main St' }
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Bad Request');
            expect(res.body.message).toBe('customerId is required');
            expect(orderService.createExternalOrder).not.toHaveBeenCalled();
        });

        it('should return 201 and create order if customerId is provided', async () => {
            const mockOrderResponse = {
                id: 101,
                orderNumber: 'EXT-123',
                userId: 1,
                items: []
            };
            orderService.createExternalOrder.mockResolvedValue(mockOrderResponse);

            const payload = {
                customerId: 1,
                items: [{ productSlug: 'laptop', quantity: 1 }],
                shippingAddress: { street: '123 Main St' }
            };

            const res = await request(app)
                .post('/api/orders/external')
                .set('x-api-key', 'test-api-key')
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body.data).toEqual(mockOrderResponse);
            expect(orderService.createExternalOrder).toHaveBeenCalledWith(payload);
        });

        it('should return 400 if OrderService throws "not found" (e.g. invalid customerId)', async () => {
            orderService.createExternalOrder.mockRejectedValue(new Error('Customer with ID 999 not found'));

            const payload = {
                customerId: 999,
                items: [{ productSlug: 'laptop', quantity: 1 }],
                shippingAddress: { street: '123 Main St' }
            };

            const res = await request(app)
                .post('/api/orders/external')
                .set('x-api-key', 'test-api-key')
                .send(payload);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Customer with ID 999 not found');
        });
    });
});
