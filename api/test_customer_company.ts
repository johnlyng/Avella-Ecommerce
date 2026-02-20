import 'dotenv/config';
import customerService from './services/CustomerService';

async function verify() {
    console.log('--- 1. Testing Customer Creation WITHOUT Company ---');
    try {
        const c1 = await customerService.createCustomer({
            email: `no-company-${Date.now()}@test.com`,
            firstName: 'Regular',
            lastName: 'Customer',
            passwordHash: 'dummyhash'
        });
        console.log('Success! Created customer without company. ID:', c1.id, '| CompanyId:', c1.companyId);
    } catch (e) {
        console.error('Failed to create regular customer:', (e as Error).message);
    }

    console.log('\n--- 2. Testing Customer Creation WITH Company ---');
    try {
        const c2 = await customerService.createCustomer({
            email: `with-company-${Date.now()}@test.com`,
            firstName: 'B2B',
            lastName: 'User',
            passwordHash: 'dummyhash',
            company: {
                name: 'ACME Corp ' + Date.now(),
                vatNumber: '123456789',
                registrationNumber: 'REG987654'
            }
        });
        console.log('Success! Created B2B customer. ID:', c2.id, '| CompanyId:', c2.companyId);

        console.log('\n--- 3. Testing getCustomers with join ---');
        const res = await customerService.getCustomers({ email: c2.email });
        console.log('Fetched created customer:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('Failed to create B2B customer:', (e as Error).message);
    }
}

verify().then(() => process.exit(0)).catch(() => process.exit(1));
