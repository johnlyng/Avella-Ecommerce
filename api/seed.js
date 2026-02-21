/**
 * Avella Ecommerce — Full Database Seed
 * ======================================
 * Resets and seeds all data in one pass.
 *
 * Usage (from project root, with Docker running):
 *   docker cp seed.js avella-api:/app/seed.js
 *   docker exec avella-api node seed.js
 *
 * Or locally (requires DATABASE_URL in .env):
 *   node seed.js
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
    process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : { host: 'localhost', port: 5433, user: 'avella_user', password: process.env.DB_PASSWORD, database: 'avella' }
);

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const COMPANIES = [
    { name: 'Avella AS', vatNumber: 'NO123456789MVA', registrationNumber: 'NO-123456789' },
    { name: 'TechNord Solutions', vatNumber: 'NO987654321MVA', registrationNumber: 'NO-987654321' },
    { name: 'Oslo Digital AS', vatNumber: 'NO456789123MVA', registrationNumber: 'NO-456789123' },
    { name: 'Nordic Gadgets AS', vatNumber: 'NO321654987MVA', registrationNumber: 'NO-321654987' },
    { name: 'Bergen Tech Group', vatNumber: 'NO654321789MVA', registrationNumber: 'NO-654321789' },
];

const CATEGORIES = [
    { name: 'Laptops', slug: 'laptops', description: 'High-performance laptops for work, gaming, and everyday use', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800' },
    { name: 'Smartphones', slug: 'smartphones', description: 'Latest smartphones with cutting-edge technology', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800' },
    { name: 'Tablets', slug: 'tablets', description: 'Portable tablets for entertainment and productivity', imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800' },
    { name: 'Headphones', slug: 'headphones', description: 'Premium headphones for immersive audio experience', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' },
    { name: 'Smartwatches', slug: 'smartwatches', description: 'Smart wearables to track fitness and stay connected', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' },
    { name: 'Cameras', slug: 'cameras', description: 'Professional cameras for photography enthusiasts', imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800' },
];

// Products: [category_slug, name, slug, description, price, compare_at_price, sku, images_json, specs_json, stock]
const PRODUCTS = [
    // LAPTOPS
    ['laptops', 'MacBook Pro 16" M3 Max', 'macbook-pro-16-m3-max', 'Ultimate performance for professionals.', 3499, 3999, 'LAP-MBP-M3-001', '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"]', '{"brand":"Apple","cpu":"Apple M3 Max","ram":"36GB","storage":"1TB SSD"}', 15],
    ['laptops', 'Dell XPS 15 Developer Edition', 'dell-xps-15-developer', 'Premium ultrabook for developers.', 2299, 2599, 'LAP-DELL-XPS-002', '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]', '{"brand":"Dell","cpu":"Intel Core i9-13900H","ram":"32GB DDR5"}', 22],
    ['laptops', 'Lenovo ThinkPad X1 Carbon Gen 11', 'lenovo-thinkpad-x1-carbon-gen11', 'Business laptop perfected.', 1899, 2199, 'LAP-LEN-X1C-003', '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]', '{"brand":"Lenovo","cpu":"Intel Core i7-1365U","ram":"16GB LPDDR5"}', 18],
    ['laptops', 'ASUS ROG Zephyrus G16', 'asus-rog-zephyrus-g16', 'Gaming powerhouse in a sleek package.', 2499, 2799, 'LAP-ASUS-ZEP-004', '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"]', '{"brand":"ASUS","cpu":"Intel Core i9-13900H","gpu":"NVIDIA RTX 4070 8GB"}', 12],
    ['laptops', 'HP Spectre x360 14', 'hp-spectre-x360-14', 'Convertible 2-in-1 with stunning design.', 1699, 1899, 'LAP-HP-SPX-005', '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]', '{"brand":"HP","cpu":"Intel Core i7-1355U","storage":"1TB SSD"}', 25],
    ['laptops', 'Microsoft Surface Laptop 5', 'microsoft-surface-laptop-5', 'Perfect balance of style and performance.', 1299, 1499, 'LAP-MS-SL5-006', '["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800"]', '{"brand":"Microsoft","cpu":"Intel Core i7-1255U","storage":"512GB SSD"}', 25],
    ['laptops', 'Acer Swift 3 OLED', 'acer-swift-3-oled', 'Affordable excellence with OLED display.', 899, 1099, 'LAP-ACR-SW3-007', '["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800"]', '{"brand":"Acer","cpu":"AMD Ryzen 7 7840U","storage":"512GB SSD"}', 30],
    ['laptops', 'Razer Blade 14', 'razer-blade-14', 'Compact gaming beast.', 2399, 2599, 'LAP-RZR-BLD-008', '["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800"]', '{"brand":"Razer","cpu":"AMD Ryzen 9 7940HS","gpu":"NVIDIA RTX 4070 8GB"}', 10],
    // SMARTPHONES
    ['smartphones', 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'The ultimate iPhone with titanium design.', 1199, 1299, 'PHN-IP15-PM-001', '["https://images.unsplash.com/photo-1592286927505-2fd8ae2f92e9?w=800"]', '{"brand":"Apple","storage":"256GB","chip":"A17 Pro"}', 40],
    ['smartphones', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Galaxy AI at your fingertips.', 1299, 1399, 'PHN-SAM-S24U-002', '["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"]', '{"brand":"Samsung","storage":"512GB","chip":"Snapdragon 8 Gen 3"}', 35],
    ['smartphones', 'Google Pixel 8 Pro', 'google-pixel-8-pro', 'Pure Google experience with AI magic.', 999, 1099, 'PHN-GOO-P8P-003', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"]', '{"brand":"Google","storage":"256GB","chip":"Google Tensor G3"}', 25],
    ['smartphones', 'OnePlus 12', 'oneplus-12', 'Never Settle. Hasselblad cameras.', 799, 899, 'PHN-OPL-12-004', '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"]', '{"brand":"OnePlus","storage":"256GB","chip":"Snapdragon 8 Gen 3"}', 25],
    ['smartphones', 'Xiaomi 14 Pro', 'xiaomi-14-pro', 'Leica optics meet flagship power.', 899, 999, 'PHN-XIA-14P-005', '["https://images.unsplash.com/photo-1592750877163-37ff5f2e3e84?w=800"]', '{"brand":"Xiaomi","storage":"512GB","chip":"Snapdragon 8 Gen 3"}', 25],
    ['smartphones', 'iPhone 15', 'iphone-15', 'Dynamic Island comes to iPhone 15.', 799, 899, 'PHN-IP15-ST-006', '["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800"]', '{"brand":"Apple","storage":"128GB","chip":"A16 Bionic"}', 50],
    ['smartphones', 'Samsung Galaxy Z Fold5', 'samsung-galaxy-z-fold5', 'Unfold your world.', 1799, 1899, 'PHN-SAM-ZF5-007', '["https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800"]', '{"brand":"Samsung","chip":"Snapdragon 8 Gen 2","form":"Foldable"}', 15],
    ['smartphones', 'Nothing Phone (2)', 'nothing-phone-2', 'Pure, instinctive, and personal.', 599, 699, 'PHN-NTH-PH2-008', '["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"]', '{"brand":"Nothing","storage":"256GB","chip":"Snapdragon 8+ Gen 1"}', 25],
    // TABLETS
    ['tablets', 'iPad Pro 12.9" M2', 'ipad-pro-129-m2', 'The ultimate iPad experience.', 1099, 1199, 'TAB-IPP-129-001', '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"]', '{"brand":"Apple","chip":"Apple M2","storage":"256GB"}', 25],
    ['tablets', 'Samsung Galaxy Tab S9 Ultra', 'samsung-galaxy-tab-s9-ultra', 'Work and play on the biggest canvas.', 1199, 1299, 'TAB-SAM-S9U-002', '["https://images.unsplash.com/photo-1585789575438-76ab58c5b551?w=800"]', '{"brand":"Samsung","chip":"Snapdragon 8 Gen 2","storage":"512GB"}', 25],
    ['tablets', 'iPad Air M2', 'ipad-air-m2', 'Power and versatility.', 599, 699, 'TAB-IPA-M2-003', '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', '{"brand":"Apple","chip":"Apple M2","storage":"128GB"}', 30],
    ['tablets', 'Microsoft Surface Pro 9', 'microsoft-surface-pro-9', 'Your portable PC.', 999, 1099, 'TAB-MS-SP9-004', '["https://images.unsplash.com/photo-1585783719744-23b0e589e88b?w=800"]', '{"brand":"Microsoft","cpu":"Intel Core i7-1255U","storage":"256GB"}', 18],
    ['tablets', 'Samsung Galaxy Tab S9', 'samsung-galaxy-tab-s9', 'Premium Android tablet.', 799, 899, 'TAB-SAM-S9-005', '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', '{"brand":"Samsung","chip":"Snapdragon 8 Gen 2","storage":"256GB"}', 25],
    ['tablets', 'Lenovo Tab P12 Pro', 'lenovo-tab-p12-pro', 'Entertainment powerhouse.', 699, 799, 'TAB-LEN-P12-006', '["https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800"]', '{"brand":"Lenovo","chip":"Snapdragon 870","storage":"256GB"}', 25],
    ['tablets', 'iPad Mini 6', 'ipad-mini-6', 'Mega performance in a mini design.', 499, 549, 'TAB-IPM-6-007', '["https://images.unsplash.com/photo-1544244015-9c72a5f3e164?w=800"]', '{"brand":"Apple","chip":"Apple A15 Bionic","storage":"64GB"}', 25],
    ['tablets', 'Amazon Fire Max 11', 'amazon-fire-max-11', 'Best value tablet.', 229, 279, 'TAB-AMZ-FM11-008', '["https://images.unsplash.com/photo-1585790050230-5dd28404125b?w=800"]', '{"brand":"Amazon","chip":"MediaTek MT8188J","storage":"128GB"}', 25],
    // HEADPHONES
    ['headphones', 'AirPods Max', 'airpods-max', 'Computational audio meets luxury design.', 549, 599, 'AUD-APM-MAX-001', '["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"]', '{"brand":"Apple","type":"Over-ear","battery":"Up to 20 hours"}', 25],
    ['headphones', 'Sony WH-1000XM5', 'sony-wh-1000xm5', 'Industry-leading noise cancellation.', 399, 449, 'AUD-SNY-XM5-002', '["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"]', '{"brand":"Sony","type":"Over-ear","battery":"Up to 30 hours"}', 35],
    ['headphones', 'Bose QuietComfort Ultra', 'bose-quietcomfort-ultra', 'Legendary silence.', 429, 479, 'AUD-BOS-QCU-003', '["https://images.unsplash.com/photo-1545127398-14699f92334b?w=800"]', '{"brand":"Bose","type":"Over-ear","battery":"Up to 24 hours"}', 25],
    ['headphones', 'Sennheiser Momentum 4', 'sennheiser-momentum-4', 'Audiophile excellence.', 379, 429, 'AUD-SEN-MOM4-004', '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]', '{"brand":"Sennheiser","type":"Over-ear","battery":"Up to 60 hours"}', 25],
    ['headphones', 'AirPods Pro (2nd Gen)', 'airpods-pro-2nd-gen', 'Pro-level listening.', 249, 279, 'AUD-APP-2G-005', '["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800"]', '{"brand":"Apple","type":"In-ear","battery":"Up to 6 hours"}', 25],
    ['headphones', 'Sony WF-1000XM5', 'sony-wf-1000xm5', 'True wireless perfection.', 299, 329, 'AUD-SNY-WF5-006', '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"]', '{"brand":"Sony","type":"In-ear","battery":"Up to 8 hours"}', 25],
    ['headphones', 'Beats Studio Pro', 'beats-studio-pro', 'Personalized spatial audio.', 349, 399, 'AUD-BTS-STP-007', '["https://images.unsplash.com/photo-1577174881658-0f30157f5223?w=800"]', '{"brand":"Beats","type":"Over-ear","battery":"Up to 40 hours"}', 25],
    ['headphones', 'Jabra Elite 10', 'jabra-elite-10', 'Smart earbuds redefined.', 249, 279, 'AUD-JAB-E10-008', '["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"]', '{"brand":"Jabra","type":"In-ear","battery":"Up to 6 hours"}', 25],
    // SMARTWATCHES
    ['smartwatches', 'Apple Watch Series 9', 'apple-watch-series-9', 'Your essential companion.', 429, 479, 'WTH-AWS9-001', '["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"]', '{"brand":"Apple","display":"Always-On Retina 45mm","battery":"18h"}', 45],
    ['smartwatches', 'Samsung Galaxy Watch 6 Classic', 'samsung-galaxy-watch-6-classic', 'Classic design meets modern tech.', 399, 449, 'WTH-SAM-GW6C-002', '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]', '{"brand":"Samsung","battery":"Up to 40 hours"}', 25],
    ['smartwatches', 'Garmin Fenix 7X Sapphire Solar', 'garmin-fenix-7x-sapphire-solar', 'Ultimate outdoor GPS watch.', 999, 1099, 'WTH-GAR-F7X-003', '["https://images.unsplash.com/photo-1617625802912-cde586faf331?w=800"]', '{"brand":"Garmin","battery":"Up to 37 days"}', 15],
    ['smartwatches', 'Apple Watch Ultra 2', 'apple-watch-ultra-2', 'Adventure proof.', 799, 849, 'WTH-AWU2-004', '["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"]', '{"brand":"Apple","display":"Flat Sapphire 49mm","battery":"36h"}', 25],
    ['smartwatches', 'Google Pixel Watch 2', 'google-pixel-watch-2', 'Smarter health insights.', 349, 399, 'WTH-GOO-PW2-005', '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"]', '{"brand":"Google","battery":"Up to 24 hours"}', 25],
    ['smartwatches', 'Amazfit GTR 4', 'amazfit-gtr-4', 'Premium for less.', 199, 249, 'WTH-AMZ-GTR4-006', '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"]', '{"brand":"Amazfit","battery":"Up to 14 days"}', 25],
    ['smartwatches', 'Fitbit Sense 2', 'fitbit-sense-2', 'Health and wellness hub.', 299, 329, 'WTH-FIT-SEN2-007', '["https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800"]', '{"brand":"Fitbit","battery":"Up to 6 days"}', 25],
    ['smartwatches', 'Withings ScanWatch 2', 'withings-scanwatch-2', 'Hybrid smartwatch elegance.', 349, 399, 'WTH-WIT-SW2-008', '["https://images.unsplash.com/photo-1622434616539-71a5c86d45e7?w=800"]', '{"brand":"Withings","battery":"Up to 30 days"}', 25],
    // CAMERAS
    ['cameras', 'Sony A7 IV', 'sony-a7-iv', 'The hybrid king.', 2499, 2699, 'CAM-SNY-A7IV-001', '["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800"]', '{"brand":"Sony","sensor":"33MP Full-Frame","video":"4K 60p"}', 18],
    ['cameras', 'Canon EOS R6 Mark II', 'canon-eos-r6-mark-ii', 'Speed demon.', 2499, 2799, 'CAM-CAN-R6M2-002', '["https://images.unsplash.com/photo-1606933248010-ef7784e97898?w=800"]', '{"brand":"Canon","sensor":"24MP Full-Frame","video":"6K RAW"}', 15],
    ['cameras', 'Nikon Z8', 'nikon-z8', 'Flagship performance, compact body.', 3999, 4299, 'CAM-NIK-Z8-003', '["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"]', '{"brand":"Nikon","sensor":"45MP Stacked","video":"8K 60p"}', 12],
    ['cameras', 'Fujifilm X-T5', 'fujifilm-x-t5', 'Retro meets cutting-edge.', 1699, 1899, 'CAM-FUJ-XT5-004', '["https://images.unsplash.com/photo-1606933303933-3eda5653f293?w=800"]', '{"brand":"Fujifilm","sensor":"40MP X-Trans","video":"6.2K 30p"}', 25],
    ['cameras', 'Panasonic Lumix S5 II', 'panasonic-lumix-s5-ii', 'Hybrid excellence.', 1999, 2199, 'CAM-PAN-S5II-005', '["https://images.unsplash.com/photo-1502920514313-52581002a659?w=800"]', '{"brand":"Panasonic","sensor":"24MP Full-Frame","video":"6K 30p"}', 25],
    ['cameras', 'DJI Osmo Action 4', 'dji-osmo-action-4', 'Action reimagined.', 399, 449, 'CAM-DJI-OA4-006', '["https://images.unsplash.com/photo-1606933248010-ef7784e97898?w=800"]', '{"brand":"DJI","video":"4K 120fps","waterproof":"18m"}', 25],
    ['cameras', 'GoPro HERO12 Black', 'gopro-hero12-black', 'The adventure camera.', 399, 449, 'CAM-GOP-H12-007', '["https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800"]', '{"brand":"GoPro","video":"5.3K 60fps","waterproof":"10m"}', 25],
    ['cameras', 'Insta360 X3', 'insta360-x3', '360 degree creativity unleashed.', 449, 499, 'CAM-IN3-X3-008', '["https://images.unsplash.com/photo-1606918801925-e2c914c4b503?w=800"]', '{"brand":"Insta360","video":"5.7K 360 30fps","waterproof":"10m"}', 25],
];

const EMPLOYEES = [
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

const JOHN_ORDERS = [
    { status: 'delivered', interval: '62 days', shipping: 199, products: ['macbook-pro-16-m3-max', 'sony-wh-1000xm5'] },
    { status: 'shipped', interval: '10 days', shipping: 99, products: ['apple-watch-series-9', 'google-pixel-8-pro'] },
    { status: 'pending', interval: '0 days', shipping: 49, products: ['ipad-air-m2', 'gopro-hero12-black'] },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const log = (msg) => console.log(msg);
const q = (text, params) => pool.query(text, params);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
    log('🌱 Avella full database seed starting...\n');

    // ── 1. RESET ──────────────────────────────────────────────────────────────
    log('🗑  Resetting all tables...');
    await q(`TRUNCATE TABLE cart_items, order_items, carts, orders, addresses,
                            inventory_levels, products, categories, users, companies
             RESTART IDENTITY CASCADE`);
    log('   ✔ All tables cleared.\n');

    // ── 2. COMPANIES ──────────────────────────────────────────────────────────
    log('🏢 Seeding companies...');
    for (const c of COMPANIES) {
        await q('INSERT INTO companies (name, vat_number, registration_number) VALUES ($1,$2,$3)',
            [c.name, c.vatNumber, c.registrationNumber]);
    }
    log(`   ✔ ${COMPANIES.length} companies inserted.\n`);

    // ── 3. CATEGORIES ─────────────────────────────────────────────────────────
    log('📂 Seeding categories...');
    for (const c of CATEGORIES) {
        await q('INSERT INTO categories (name, slug, description, image_url) VALUES ($1,$2,$3,$4)',
            [c.name, c.slug, c.description, c.imageUrl]);
    }
    log(`   ✔ ${CATEGORIES.length} categories inserted.\n`);

    // ── 4. PRODUCTS + INVENTORY ───────────────────────────────────────────────
    log('📦 Seeding products & inventory...');
    for (const [catSlug, name, slug, desc, price, compareAt, sku, images, specs, stock] of PRODUCTS) {
        const { rows: [{ id: productId }] } = await q(
            `INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, images, specifications, is_active)
             VALUES ((SELECT id FROM categories WHERE slug=$1), $2,$3,$4,$5,$6,$7,$8,$9,true) RETURNING id`,
            [catSlug, name, slug, desc, price, compareAt, sku, images, specs]
        );
        await q('INSERT INTO inventory_levels (product_id, quantity) VALUES ($1,$2)', [productId, stock]);
    }
    log(`   ✔ ${PRODUCTS.length} products + inventory inserted.\n`);

    // ── 5. USERS (bcrypt) + ADDRESSES ────────────────────────────────────────
    log('👥 Seeding Avella AS employees...');
    const hash = await bcrypt.hash('Avella2026', 10);
    const { rows: [company] } = await q("SELECT id FROM companies WHERE name='Avella AS'");

    const userIds = {};
    for (const emp of EMPLOYEES) {
        const { rows: [user] } = await q(
            `INSERT INTO users (email, password_hash, first_name, last_name, role, company_id)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
            [emp.email, hash, emp.firstName, emp.lastName, emp.role, company.id]
        );
        userIds[emp.email] = user.id;

        await q(
            `INSERT INTO addresses (user_id, type, first_name, last_name, address_line1, city, postal_code, country, is_default)
             VALUES ($1,'work',$2,$3,'Dronningens gate','Oslo','0103','Norway',true)`,
            [user.id, emp.firstName, emp.lastName]
        );
    }
    log(`   ✔ ${EMPLOYEES.length} users inserted with work addresses.\n`);

    // ── 6. ORDERS (John Lyngstad) ─────────────────────────────────────────────
    log('🛒 Seeding orders for John Lyngstad...');
    const johnId = userIds['john.arne.lyngstad@avella.no'];
    const { rows: [johnAddr] } = await q('SELECT * FROM addresses WHERE user_id=$1 LIMIT 1', [johnId]);
    const addrJson = JSON.stringify({
        firstName: johnAddr.first_name, lastName: johnAddr.last_name,
        addressLine1: johnAddr.address_line1, city: johnAddr.city,
        postalCode: johnAddr.postal_code, country: johnAddr.country,
    });

    for (const def of JOHN_ORDERS) {
        const prods = await Promise.all(def.products.map(async slug => {
            const { rows: [p] } = await q('SELECT id,name,sku,price FROM products WHERE slug=$1', [slug]);
            return p;
        }));

        const subtotal = prods.reduce((s, p) => s + parseFloat(p.price), 0);
        const tax = Math.round(subtotal * 0.25 * 100) / 100;
        const total = Math.round((subtotal + tax + def.shipping) * 100) / 100;

        const { rows: [order] } = await q(
            `INSERT INTO orders (user_id, status, subtotal, tax, shipping, total, shipping_address, billing_address, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW() - INTERVAL '${def.interval}') RETURNING id, order_number`,
            [johnId, def.status, subtotal, tax, def.shipping, total, addrJson, addrJson]
        );

        for (const p of prods) {
            await q(`INSERT INTO order_items (order_id,product_id,product_name,product_sku,quantity,price,total)
                     VALUES ($1,$2,$3,$4,1,$5,$5)`,
                [order.id, p.id, p.name, p.sku, p.price]);
        }
        log(`   ✅ ${order.order_number} [${def.status}] — ${prods.map(p => p.name).join(' + ')}`);
    }

    log('\n✅ All seeding complete!');
    log(`   • ${COMPANIES.length} companies`);
    log(`   • ${CATEGORIES.length} categories`);
    log(`   • ${PRODUCTS.length} products + inventory`);
    log(`   • ${EMPLOYEES.length} users (Avella AS) + work addresses`);
    log(`   • 3 orders for John Lyngstad`);
    await pool.end();
}

main().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); });
