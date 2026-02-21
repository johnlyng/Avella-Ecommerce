// Seed Avella AS employees with bcrypt-hashed password + work addresses
// Run AFTER 000_reset_and_reseed.sql
// Usage: node seed-employees.js
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const employees = [
    { firstName: 'Hallvard', lastName: 'Romstad', email: 'hallvard.romstad@avella.no', role: 'admin' },
    { firstName: 'Laila', lastName: 'Kynningsrud', email: 'laila.kynningsrud@avella.no', role: 'customer' },
    { firstName: 'Ina Kristin', lastName: 'Johnsen', email: 'ina.kristin.johnsen@avella.no', role: 'customer' },
    { firstName: 'Nina', lastName: 'Kroghrud', email: 'nina.kroghrud@avella.no', role: 'customer' },
    { firstName: 'Knut', lastName: 'Lerpold', email: 'knut.lerpold@avella.no', role: 'customer' },
    { firstName: 'John', lastName: 'Lyngstad', email: 'john.arne.lyngstad@avella.no', role: 'customer' },
    { firstName: 'Lars', lastName: 'Dehli', email: 'ldehli@gmail.com', role: 'customer' },
    { firstName: 'Thor', lastName: 'Ingham', email: 'thor.ingham@avella.no', role: 'customer' },
    { firstName: 'Tor Einar', lastName: 'Dørum', email: 'tor.einar.dorum@avella.no', role: 'customer' },
    { firstName: 'Michael', lastName: 'Glomnes', email: 'michael.glomnes@avella.no', role: 'customer' },
    { firstName: 'Krists Kristaps', lastName: 'Bergmanis', email: 'kristaps.bergmanis@avella.no', role: 'customer' },
    { firstName: 'Katrine', lastName: 'Arnesen', email: 'katrine.arnesen@avella.no', role: 'customer' },
    { firstName: 'Abu', lastName: 'Davis', email: 'abu.davis@avella.no', role: 'customer' },
    { firstName: 'Stig', lastName: 'Henriksen', email: 'stig.henriksen@avella.no', role: 'customer' },
    { firstName: 'Gerd Helen', lastName: 'Skalvik', email: 'gerd.helen.skalvik@avella.no', role: 'customer' },
    { firstName: 'Karoline', lastName: 'Mortensen', email: 'karoline.mortensen@avella.no', role: 'customer' },
    { firstName: 'Vibeke', lastName: 'Orsten', email: 'vibeke.orsten@avella.no', role: 'customer' },
];

const WORK_ADDRESS = {
    addressLine1: 'Dronningens gate',
    city: 'Oslo',
    postalCode: '0103',
    country: 'Norway',
    type: 'work',
    isDefault: true,
};

async function main() {
    const hash = await bcrypt.hash('Avella2026', 10);

    // Get Avella AS company id
    const { rows: [company] } = await pool.query("SELECT id FROM companies WHERE name = 'Avella AS'");
    if (!company) { console.error('ERROR: Company "Avella AS" not found — run 000_reset_and_reseed.sql first'); process.exit(1); }

    // Remove previous Avella AS employee users (cascade: addresses, orders, order_items)
    const emails = employees.map(e => e.email);
    const { rows: existingUsers } = await pool.query('SELECT id FROM users WHERE email = ANY($1)', [emails]);
    const existingIds = existingUsers.map(u => u.id);

    if (existingIds.length > 0) {
        await pool.query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ANY($1))', [existingIds]);
        await pool.query('DELETE FROM orders WHERE user_id = ANY($1)', [existingIds]);
        await pool.query('DELETE FROM addresses WHERE user_id = ANY($1)', [existingIds]);
        await pool.query('DELETE FROM users WHERE id = ANY($1)', [existingIds]);
    }

    let inserted = 0;
    for (const emp of employees) {
        const { rows: [user] } = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role, company_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [emp.email, hash, emp.firstName, emp.lastName, emp.role, company.id]
        );

        await pool.query(
            `INSERT INTO addresses (user_id, type, first_name, last_name, address_line1, city, postal_code, country, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [user.id, WORK_ADDRESS.type, emp.firstName, emp.lastName,
            WORK_ADDRESS.addressLine1, WORK_ADDRESS.city, WORK_ADDRESS.postalCode,
            WORK_ADDRESS.country, WORK_ADDRESS.isDefault]
        );

        console.log(`✅ ${emp.firstName} ${emp.lastName} <${emp.email}> [${emp.role}]`);
        inserted++;
    }

    console.log(`\n✔ Done — ${inserted} users inserted with work addresses.`);

    // ---------------------------------------------------------------
    // ORDERS — 3 sample orders for John Lyngstad
    // ---------------------------------------------------------------
    console.log('\nSeeding orders for John Lyngstad...');

    const { rows: [john] } = await pool.query("SELECT id FROM users WHERE email = 'john.arne.lyngstad@avella.no'");
    const { rows: [johnAddr] } = await pool.query("SELECT * FROM addresses WHERE user_id = $1 LIMIT 1", [john.id]);

    const addr = JSON.stringify({
        firstName: johnAddr.first_name,
        lastName: johnAddr.last_name,
        addressLine1: johnAddr.address_line1,
        city: johnAddr.city,
        postalCode: johnAddr.postal_code,
        country: johnAddr.country,
    });

    const getProduct = async (slug) => {
        const { rows: [p] } = await pool.query('SELECT id, name, sku, price FROM products WHERE slug = $1', [slug]);
        return p;
    };

    const orderDefs = [
        {
            status: 'delivered',
            interval: '62 days',
            shipping: 199.00,
            products: ['macbook-pro-16-m3-max', 'sony-wh-1000xm5'],
        },
        {
            status: 'shipped',
            interval: '10 days',
            shipping: 99.00,
            products: ['apple-watch-series-9', 'google-pixel-8-pro'],
        },
        {
            status: 'pending',
            interval: '0 days',
            shipping: 49.00,
            products: ['ipad-air-m2', 'gopro-hero12-black'],
        },
    ];

    for (const def of orderDefs) {
        const prods = await Promise.all(def.products.map(getProduct));
        const subtotal = prods.reduce((s, p) => s + parseFloat(p.price), 0);
        const tax = Math.round(subtotal * 0.25 * 100) / 100;
        const total = Math.round((subtotal + tax + def.shipping) * 100) / 100;

        const { rows: [order] } = await pool.query(
            `INSERT INTO orders (user_id, status, subtotal, tax, shipping, total, shipping_address, billing_address, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL '${def.interval}')
             RETURNING id, order_number`,
            [john.id, def.status, subtotal, tax, def.shipping, total, addr, addr]
        );

        for (const p of prods) {
            await pool.query(
                `INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price, total)
                 VALUES ($1, $2, $3, $4, 1, $5, $5)`,
                [order.id, p.id, p.name, p.sku, p.price]
            );
        }

        const itemNames = prods.map(p => p.name).join(' + ');
        console.log(`  ✅ ${order.order_number} [${def.status}] — ${itemNames} — NOK ${total.toLocaleString()}`);
    }

    console.log('\n✔ All seeding complete.');
    await pool.end();
}

main().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
