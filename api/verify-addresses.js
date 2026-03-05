const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function runTests() {
    console.log('--- Starting Address API Tests ---');
    try {
        // 1. Authenticate / Register a test user
        const uniqueEmail = `testuser_${Date.now()}@example.com`;
        console.log(`Registering user ${uniqueEmail}...`);

        let token = '';
        let userId = '';

        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                email: uniqueEmail,
                password: 'password123',
                firstName: 'Test',
                lastName: 'User'
            });
            token = regRes.data.data.token;
            userId = regRes.data.data.user.id;
            console.log(`User registered successfully with ID: ${userId}`);
        } catch (err) {
            console.error('Failed to register user:', err.response?.data || err.message);
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Create a new address (Shipping)
        console.log('Creating a new shipping address...');
        const createRes = await axios.post(`${API_URL}/addresses`, {
            type: 'shipping',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '123 Main St',
            city: 'New York',
            postalCode: '10001',
            country: 'USA'
        }, { headers });

        const shippingAddressId = createRes.data.data.id;
        console.log(`Shipping Address created with ID: ${shippingAddressId}`);

        // 3. Create a new address (Billing) - Set as default
        console.log('Creating a new billing address and setting as default...');
        const createRes2 = await axios.post(`${API_URL}/addresses`, {
            type: 'billing',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '456 Business Ave',
            city: 'New York',
            postalCode: '10002',
            country: 'USA',
            isDefault: true
        }, { headers });

        const billingAddressId = createRes2.data.data.id;
        console.log(`Billing Address created with ID: ${billingAddressId}`);

        // 4. Fetch looking up by type 'shipping'
        console.log('Fetching addresses by type "shipping"...');
        const typeRes = await axios.get(`${API_URL}/addresses/type/shipping`, { headers });
        console.log(`Found ${typeRes.data.data.length} shipping addresses.`);
        if (typeRes.data.data[0].id !== shippingAddressId) {
            throw new Error('Shipping address lookup failed validation.');
        }

        // 5. Fetch the default address
        console.log('Fetching the default address...');
        const defaultRes = await axios.get(`${API_URL}/addresses/default`, { headers });
        console.log(`Default address ID: ${defaultRes.data.data?.id}`);
        if (defaultRes.data.data?.id !== billingAddressId) {
            throw new Error('Default address lookup failed validation.');
        }

        // 6. Delete the addresses
        console.log(`Deleting shipping address ${shippingAddressId}...`);
        await axios.delete(`${API_URL}/addresses/${shippingAddressId}`, { headers });

        console.log(`Deleting billing/default address ${billingAddressId}...`);
        await axios.delete(`${API_URL}/addresses/${billingAddressId}`, { headers });

        console.log('Validating deletion...');
        try {
            await axios.get(`${API_URL}/addresses/${shippingAddressId}`, { headers });
            throw new Error('Shipping address still exists!');
        } catch (err) {
            if (err.response?.status === 404) {
                console.log('Shipping address successfully deleted (404).');
            } else {
                throw err;
            }
        }

        console.log('--- All Tests Passed Successfully! ---');

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

runTests();
