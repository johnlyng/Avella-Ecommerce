// Test setup file
// Global test configuration and utilities

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.TAX_RATE = '0.1';

// Increase test timeout for integration tests
jest.setTimeout(10000);

// Global test utilities can be added here
global.testUtils = {
    // Helper to create mock database result
    mockDbResult: (rows) => ({ rows, rowCount: rows.length }),

    // Helper to create mock request/response
    mockExpressReq: (data = {}) => ({
        body: data.body || {},
        params: data.params || {},
        query: data.query || {},
        headers: data.headers || {}
    }),

    mockExpressRes: () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        return res;
    }
};
