const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3001/api';
// We need a valid JWT token for testing. Assuming a test user exists or we can login.
// For simplicity in this script, you might need to provide a TOKEN manually or 
// we assume a 'test-token' if the dev environment allows easy bypass, but better to use a real login.

async function verifyAddressManagement() {
    console.log('--- Starting Address Management Verification ---\n');

    try {
        // Step 1: Login to get token (assuming credentials from .env or default)
        // Since I don't have user credentials, I'll expect the user to provide a token or 
        // I can try to register/login a test user.
        console.log('1. Logging in as test user...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@avella.com', // Using admin for now as it's likely to exist
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('   Login successful!\n');

        // Step 2: Create a new address
        console.log('2. Creating a new address...');
        const newAddress = {
            firstName: 'Verification',
            lastName: 'Test',
            addressLine1: '123 Test Lane',
            city: 'Testville',
            state: 'TS',
            postalCode: '12345',
            country: 'Testland',
            phoneNumber: '555-0000',
            isDefault: true
        };
        const createRes = await axios.post(`${API_URL}/addresses`, newAddress, config);
        const addressId = createRes.data.data.id;
        console.log(`   Address created with ID: ${addressId}\n`);

        // Step 3: List addresses
        console.log('3. Listing addresses...');
        const listRes = await axios.get(`${API_URL}/addresses`, config);
        console.log(`   Found ${listRes.data.data.length} addresses.\n`);

        // Step 4: Update address
        console.log('4. Updating address...');
        const updateRes = await axios.put(`${API_URL}/addresses/${addressId}`, {
            city: 'Updated Testville'
        }, config);
        console.log(`   Update successful: ${updateRes.data.data.city}\n`);

        // Step 5: Delete address
        console.log('5. Deleting address...');
        await axios.delete(`${API_URL}/addresses/${addressId}`, config);
        console.log('   Deletion successful!\n');

        console.log('--- Verification Completed Successfully! ---');
    } catch (error) {
        console.error('Core Verification Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

verifyAddressManagement();
