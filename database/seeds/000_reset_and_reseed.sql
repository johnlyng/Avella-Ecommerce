-- Full reset and reseed script
-- Clears stale data and re-seeds all 6 categories, 48 products, and inventory

-- Disable FK checks temporarily by truncating in reverse dependency order
TRUNCATE TABLE cart_items, order_items, carts, orders, inventory_levels, products, categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE companies RESTART IDENTITY CASCADE;

-- =========================================================
-- COMPANIES (5)
-- =========================================================
INSERT INTO companies (name, vat_number, registration_number) VALUES
  ('Avella AS',          'NO123456789MVA', 'NO-123456789'),
  ('TechNord Solutions', 'NO987654321MVA', 'NO-987654321'),
  ('Oslo Digital AS',    'NO456789123MVA', 'NO-456789123'),
  ('Nordic Gadgets AS',  'NO321654987MVA', 'NO-321654987'),
  ('Bergen Tech Group',  'NO654321789MVA', 'NO-654321789');

-- =========================================================
-- CATEGORIES (6)
-- =========================================================
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Laptops',      'laptops',      'High-performance laptops for work, gaming, and everyday use',       'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'),
  ('Smartphones',  'smartphones',  'Latest smartphones with cutting-edge technology',                   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'),
  ('Tablets',      'tablets',      'Portable tablets for entertainment and productivity',               'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'),
  ('Headphones',   'headphones',   'Premium headphones for immersive audio experience',                 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'),
  ('Smartwatches', 'smartwatches', 'Smart wearables to track fitness and stay connected',               'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
  ('Cameras',      'cameras',      'Professional cameras for photography enthusiasts',                  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800');

-- =========================================================
-- LAPTOPS (8)
-- =========================================================
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, images, specifications, is_active) VALUES
  ((SELECT id FROM categories WHERE slug='laptops'), 'MacBook Pro 16" M3 Max',           'macbook-pro-16-m3-max',           'Ultimate performance for professionals.',    3499.00, 3999.00, 'LAP-MBP-M3-001',   '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"]', '{"brand":"Apple","cpu":"Apple M3 Max","ram":"36GB","storage":"1TB SSD"}', true),
  ((SELECT id FROM categories WHERE slug='laptops'), 'Dell XPS 15 Developer Edition',     'dell-xps-15-developer',           'Premium ultrabook for developers.',          2299.00, 2599.00, 'LAP-DELL-XPS-002', '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]', '{"brand":"Dell","cpu":"Intel Core i9-13900H","ram":"32GB DDR5","storage":"1TB NVMe SSD"}', true),
  ((SELECT id FROM categories WHERE slug='laptops'), 'Lenovo ThinkPad X1 Carbon Gen 11', 'lenovo-thinkpad-x1-carbon-gen11', 'Business laptop perfected.',                 1899.00, 2199.00, 'LAP-LEN-X1C-003',  '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]', '{"brand":"Lenovo","cpu":"Intel Core i7-1365U","ram":"16GB LPDDR5","storage":"512GB SSD"}', true),
  ((SELECT id FROM categories WHERE slug='laptops'), 'ASUS ROG Zephyrus G16',             'asus-rog-zephyrus-g16',           'Gaming powerhouse in a sleek package.',      2499.00, 2799.00, 'LAP-ASUS-ZEP-004', '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"]', '{"brand":"ASUS","cpu":"Intel Core i9-13900H","ram":"32GB DDR5","gpu":"NVIDIA RTX 4070 8GB"}', true),
  ((SELECT id FROM categories WHERE slug='laptops'), 'HP Spectre x360 14',                'hp-spectre-x360-14',              'Convertible 2-in-1 with stunning design.',   1699.00, 1899.00, 'LAP-HP-SPX-005',   '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]', '{"brand":"HP","cpu":"Intel Core i7-1355U","ram":"16GB LPDDR4x","storage":"1TB SSD"}', true),
  ((SELECT id FROM categories WHERE slug='laptops'), 'Microsoft Surface Laptop 5',         'microsoft-surface-laptop-5',      'Perfect balance of style and performance.',  1299.00, 1499.00, 'LAP-MS-SL5-006',   '["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800"]', '{"brand":"Microsoft","cpu":"Intel Core i7-1255U","ram":"16GB LPDDR5x","storage":"512GB SSD"}', true),
  ((SELECT id FROM categories WHERE slug='laptops'), 'Acer Swift 3 OLED',                  'acer-swift-3-oled',               'Affordable excellence with OLED display.',    899.00, 1099.00, 'LAP-ACR-SW3-007',  '["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800"]', '{"brand":"Acer","cpu":"AMD Ryzen 7 7840U","ram":"16GB LPDDR5","storage":"512GB SSD"}', true),
  ((SELECT id FROM categories WHERE slug='laptops'), 'Razer Blade 14',                     'razer-blade-14',                  'Compact gaming beast.',                      2399.00, 2599.00, 'LAP-RZR-BLD-008',  '["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800"]', '{"brand":"Razer","cpu":"AMD Ryzen 9 7940HS","ram":"32GB DDR5","gpu":"NVIDIA RTX 4070 8GB"}', true);

-- =========================================================
-- SMARTPHONES (8)
-- =========================================================
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, images, specifications, is_active) VALUES
  ((SELECT id FROM categories WHERE slug='smartphones'), 'iPhone 15 Pro Max',           'iphone-15-pro-max',           'The ultimate iPhone with titanium design.',  1199.00, 1299.00, 'PHN-IP15-PM-001', '["https://images.unsplash.com/photo-1592286927505-2fd8ae2f92e9?w=800"]', '{"brand":"Apple","storage":"256GB","chip":"A17 Pro"}', true),
  ((SELECT id FROM categories WHERE slug='smartphones'), 'Samsung Galaxy S24 Ultra',    'samsung-galaxy-s24-ultra',    'Galaxy AI at your fingertips.',             1299.00, 1399.00, 'PHN-SAM-S24U-002','["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"]', '{"brand":"Samsung","storage":"512GB","chip":"Snapdragon 8 Gen 3"}', true),
  ((SELECT id FROM categories WHERE slug='smartphones'), 'Google Pixel 8 Pro',           'google-pixel-8-pro',          'Pure Google experience with AI magic.',       999.00, 1099.00, 'PHN-GOO-P8P-003', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"]', '{"brand":"Google","storage":"256GB","chip":"Google Tensor G3"}', true),
  ((SELECT id FROM categories WHERE slug='smartphones'), 'OnePlus 12',                  'oneplus-12',                  'Never Settle. Hasselblad camera system.',     799.00,  899.00, 'PHN-OPL-12-004',  '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"]', '{"brand":"OnePlus","storage":"256GB","chip":"Snapdragon 8 Gen 3"}', true),
  ((SELECT id FROM categories WHERE slug='smartphones'), 'Xiaomi 14 Pro',                'xiaomi-14-pro',               'Leica optics meet flagship power.',           899.00,  999.00, 'PHN-XIA-14P-005', '["https://images.unsplash.com/photo-1592750877163-37ff5f2e3e84?w=800"]', '{"brand":"Xiaomi","storage":"512GB","chip":"Snapdragon 8 Gen 3"}', true),
  ((SELECT id FROM categories WHERE slug='smartphones'), 'iPhone 15',                   'iphone-15',                   'Dynamic Island comes to iPhone 15.',          799.00,  899.00, 'PHN-IP15-ST-006', '["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800"]', '{"brand":"Apple","storage":"128GB","chip":"A16 Bionic"}', true),
  ((SELECT id FROM categories WHERE slug='smartphones'), 'Samsung Galaxy Z Fold5',       'samsung-galaxy-z-fold5',      'Unfold your world.',                         1799.00, 1899.00, 'PHN-SAM-ZF5-007', '["https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800"]', '{"brand":"Samsung","storage":"256GB","chip":"Snapdragon 8 Gen 2","form_factor":"Foldable"}', true),
  ((SELECT id FROM categories WHERE slug='smartphones'), 'Nothing Phone (2)',             'nothing-phone-2',             'Pure, instinctive, and personal.',            599.00,  699.00, 'PHN-NTH-PH2-008', '["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"]', '{"brand":"Nothing","storage":"256GB","chip":"Snapdragon 8+ Gen 1"}', true);

-- =========================================================
-- TABLETS (8)
-- =========================================================
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, images, specifications, is_active) VALUES
  ((SELECT id FROM categories WHERE slug='tablets'), 'iPad Pro 12.9" M2',            'ipad-pro-129-m2',              'The ultimate iPad experience.',             1099.00, 1199.00, 'TAB-IPP-129-001', '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"]', '{"brand":"Apple","chip":"Apple M2","storage":"256GB"}', true),
  ((SELECT id FROM categories WHERE slug='tablets'), 'Samsung Galaxy Tab S9 Ultra', 'samsung-galaxy-tab-s9-ultra',  'Work and play on the biggest canvas.',      1199.00, 1299.00, 'TAB-SAM-S9U-002', '["https://images.unsplash.com/photo-1585789575438-76ab58c5b551?w=800"]', '{"brand":"Samsung","chip":"Snapdragon 8 Gen 2","storage":"512GB"}', true),
  ((SELECT id FROM categories WHERE slug='tablets'), 'iPad Air M2',                  'ipad-air-m2',                  'Power and versatility.',                     599.00,  699.00, 'TAB-IPA-M2-003',  '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', '{"brand":"Apple","chip":"Apple M2","storage":"128GB"}', true),
  ((SELECT id FROM categories WHERE slug='tablets'), 'Microsoft Surface Pro 9',      'microsoft-surface-pro-9',      'Your portable PC.',                          999.00, 1099.00, 'TAB-MS-SP9-004',  '["https://images.unsplash.com/photo-1585783719744-23b0e589e88b?w=800"]', '{"brand":"Microsoft","cpu":"Intel Core i7-1255U","storage":"256GB SSD"}', true),
  ((SELECT id FROM categories WHERE slug='tablets'), 'Samsung Galaxy Tab S9',        'samsung-galaxy-tab-s9',        'Premium Android tablet.',                    799.00,  899.00, 'TAB-SAM-S9-005',  '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', '{"brand":"Samsung","chip":"Snapdragon 8 Gen 2","storage":"256GB"}', true),
  ((SELECT id FROM categories WHERE slug='tablets'), 'Lenovo Tab P12 Pro',            'lenovo-tab-p12-pro',           'Entertainment powerhouse.',                  699.00,  799.00, 'TAB-LEN-P12-006', '["https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800"]', '{"brand":"Lenovo","chip":"Snapdragon 870","storage":"256GB"}', true),
  ((SELECT id FROM categories WHERE slug='tablets'), 'iPad Mini 6',                   'ipad-mini-6',                  'Mega performance in a mini design.',          499.00,  549.00, 'TAB-IPM-6-007',   '["https://images.unsplash.com/photo-1544244015-9c72a5f3e164?w=800"]', '{"brand":"Apple","chip":"Apple A15 Bionic","storage":"64GB"}', true),
  ((SELECT id FROM categories WHERE slug='tablets'), 'Amazon Fire Max 11',            'amazon-fire-max-11',           'Best value tablet.',                          229.00,  279.00, 'TAB-AMZ-FM11-008','["https://images.unsplash.com/photo-1585790050230-5dd28404125b?w=800"]', '{"brand":"Amazon","chip":"MediaTek MT8188J","storage":"128GB"}', true);

-- =========================================================
-- HEADPHONES (8)
-- =========================================================
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, images, specifications, is_active) VALUES
  ((SELECT id FROM categories WHERE slug='headphones'), 'AirPods Max',              'airpods-max',              'Computational audio meets luxury design.',  549.00, 599.00, 'AUD-APM-MAX-001', '["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"]', '{"brand":"Apple","type":"Over-ear","battery":"Up to 20 hours"}', true),
  ((SELECT id FROM categories WHERE slug='headphones'), 'Sony WH-1000XM5',          'sony-wh-1000xm5',          'Industry-leading noise cancellation.',       399.00, 449.00, 'AUD-SNY-XM5-002', '["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"]', '{"brand":"Sony","type":"Over-ear","battery":"Up to 30 hours"}', true),
  ((SELECT id FROM categories WHERE slug='headphones'), 'Bose QuietComfort Ultra',   'bose-quietcomfort-ultra',  'Legendary silence.',                         429.00, 479.00, 'AUD-BOS-QCU-003', '["https://images.unsplash.com/photo-1545127398-14699f92334b?w=800"]', '{"brand":"Bose","type":"Over-ear","battery":"Up to 24 hours"}', true),
  ((SELECT id FROM categories WHERE slug='headphones'), 'Sennheiser Momentum 4',     'sennheiser-momentum-4',    'Audiophile excellence.',                     379.00, 429.00, 'AUD-SEN-MOM4-004','["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]', '{"brand":"Sennheiser","type":"Over-ear","battery":"Up to 60 hours"}', true),
  ((SELECT id FROM categories WHERE slug='headphones'), 'AirPods Pro (2nd Gen)',     'airpods-pro-2nd-gen',      'Pro-level listening.',                       249.00, 279.00, 'AUD-APP-2G-005',  '["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800"]', '{"brand":"Apple","type":"In-ear","battery":"Up to 6 hours"}', true),
  ((SELECT id FROM categories WHERE slug='headphones'), 'Sony WF-1000XM5',           'sony-wf-1000xm5',          'True wireless perfection.',                  299.00, 329.00, 'AUD-SNY-WF5-006', '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"]', '{"brand":"Sony","type":"In-ear","battery":"Up to 8 hours"}', true),
  ((SELECT id FROM categories WHERE slug='headphones'), 'Beats Studio Pro',          'beats-studio-pro',         'Personalized spatial audio.',                349.00, 399.00, 'AUD-BTS-STP-007', '["https://images.unsplash.com/photo-1577174881658-0f30157f5223?w=800"]', '{"brand":"Beats","type":"Over-ear","battery":"Up to 40 hours"}', true),
  ((SELECT id FROM categories WHERE slug='headphones'), 'Jabra Elite 10',             'jabra-elite-10',           'Smart earbuds redefined.',                   249.00, 279.00, 'AUD-JAB-E10-008', '["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"]', '{"brand":"Jabra","type":"In-ear","battery":"Up to 6 hours"}', true);

-- =========================================================
-- SMARTWATCHES (8)
-- =========================================================
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, images, specifications, is_active) VALUES
  ((SELECT id FROM categories WHERE slug='smartwatches'), 'Apple Watch Series 9',              'apple-watch-series-9',              'Your essential companion.',                    429.00, 479.00, 'WTH-AWS9-001',      '["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"]', '{"brand":"Apple","display":"Always-On Retina 45mm","battery":"Up to 18 hours"}', true),
  ((SELECT id FROM categories WHERE slug='smartwatches'), 'Samsung Galaxy Watch 6 Classic',    'samsung-galaxy-watch-6-classic',    'Classic design meets modern tech.',            399.00, 449.00, 'WTH-SAM-GW6C-002',  '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]', '{"brand":"Samsung","battery":"Up to 40 hours"}', true),
  ((SELECT id FROM categories WHERE slug='smartwatches'), 'Garmin Fenix 7X Sapphire Solar',    'garmin-fenix-7x-sapphire-solar',    'Ultimate outdoor GPS watch.',                  999.00,1099.00, 'WTH-GAR-F7X-003',   '["https://images.unsplash.com/photo-1617625802912-cde586faf331?w=800"]', '{"brand":"Garmin","battery":"Up to 37 days"}', true),
  ((SELECT id FROM categories WHERE slug='smartwatches'), 'Apple Watch Ultra 2',               'apple-watch-ultra-2',               'Adventure proof.',                             799.00, 849.00, 'WTH-AWU2-004',      '["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"]', '{"brand":"Apple","display":"Flat Sapphire 49mm","battery":"Up to 36 hours"}', true),
  ((SELECT id FROM categories WHERE slug='smartwatches'), 'Google Pixel Watch 2',              'google-pixel-watch-2',              'Smarter health insights.',                     349.00, 399.00, 'WTH-GOO-PW2-005',   '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"]', '{"brand":"Google","battery":"Up to 24 hours"}', true),
  ((SELECT id FROM categories WHERE slug='smartwatches'), 'Amazfit GTR 4',                     'amazfit-gtr-4',                     'Premium for less.',                            199.00, 249.00, 'WTH-AMZ-GTR4-006',  '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"]', '{"brand":"Amazfit","battery":"Up to 14 days"}', true),
  ((SELECT id FROM categories WHERE slug='smartwatches'), 'Fitbit Sense 2',                    'fitbit-sense-2',                    'Health and wellness hub.',                     299.00, 329.00, 'WTH-FIT-SEN2-007',  '["https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800"]', '{"brand":"Fitbit","battery":"Up to 6 days"}', true),
  ((SELECT id FROM categories WHERE slug='smartwatches'), 'Withings ScanWatch 2',              'withings-scanwatch-2',              'Hybrid smartwatch elegance.',                  349.00, 399.00, 'WTH-WIT-SW2-008',   '["https://images.unsplash.com/photo-1622434616539-71a5c86d45e7?w=800"]', '{"brand":"Withings","battery":"Up to 30 days"}', true);

-- =========================================================
-- CAMERAS (8)
-- =========================================================
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, images, specifications, is_active) VALUES
  ((SELECT id FROM categories WHERE slug='cameras'), 'Sony A7 IV',             'sony-a7-iv',             'The hybrid king.',                           2499.00, 2699.00, 'CAM-SNY-A7IV-001', '["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800"]', '{"brand":"Sony","sensor":"33MP Full-Frame CMOS","video":"4K 60p 10-bit"}', true),
  ((SELECT id FROM categories WHERE slug='cameras'), 'Canon EOS R6 Mark II',   'canon-eos-r6-mark-ii',   'Speed demon.',                               2499.00, 2799.00, 'CAM-CAN-R6M2-002', '["https://images.unsplash.com/photo-1606933248010-ef7784e97898?w=800"]', '{"brand":"Canon","sensor":"24MP Full-Frame CMOS","video":"6K RAW, 4K 60p"}', true),
  ((SELECT id FROM categories WHERE slug='cameras'), 'Nikon Z8',                'nikon-z8',                'Flagship performance, compact body.',          3999.00, 4299.00, 'CAM-NIK-Z8-003',   '["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"]', '{"brand":"Nikon","sensor":"45MP Stacked Full-Frame","video":"8K 60p N-RAW"}', true),
  ((SELECT id FROM categories WHERE slug='cameras'), 'Fujifilm X-T5',           'fujifilm-x-t5',           'Retro meets cutting-edge.',                   1699.00, 1899.00, 'CAM-FUJ-XT5-004',  '["https://images.unsplash.com/photo-1606933303933-3eda5653f293?w=800"]', '{"brand":"Fujifilm","sensor":"40MP X-Trans CMOS 5","video":"6.2K 30p"}', true),
  ((SELECT id FROM categories WHERE slug='cameras'), 'Panasonic Lumix S5 II',   'panasonic-lumix-s5-ii',   'Hybrid excellence.',                          1999.00, 2199.00, 'CAM-PAN-S5II-005', '["https://images.unsplash.com/photo-1502920514313-52581002a659?w=800"]', '{"brand":"Panasonic","sensor":"24MP Full-Frame CMOS","video":"6K 30p"}', true),
  ((SELECT id FROM categories WHERE slug='cameras'), 'DJI Osmo Action 4',       'dji-osmo-action-4',       'Action reimagined.',                           399.00,  449.00, 'CAM-DJI-OA4-006',  '["https://images.unsplash.com/photo-1606933248010-ef7784e97898?w=800"]', '{"brand":"DJI","video":"4K 120fps","waterproof":"18m"}', true),
  ((SELECT id FROM categories WHERE slug='cameras'), 'GoPro HERO12 Black',      'gopro-hero12-black',      'The adventure camera.',                        399.00,  449.00, 'CAM-GOP-H12-007',  '["https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800"]', '{"brand":"GoPro","video":"5.3K 60fps","waterproof":"10m"}', true),
  ((SELECT id FROM categories WHERE slug='cameras'), 'Insta360 X3',             'insta360-x3',             '360 degree creativity unleashed.',              449.00,  499.00, 'CAM-IN3-X3-008',   '["https://images.unsplash.com/photo-1606918801925-e2c914c4b503?w=800"]', '{"brand":"Insta360","video":"5.7K 360 30fps","waterproof":"10m"}', true);

-- =========================================================
-- INVENTORY LEVELS (one row per product, default 25 units)
-- =========================================================
INSERT INTO inventory_levels (product_id, quantity)
SELECT id, 25 FROM products;

-- Spot-update key quantities to match original seed values
UPDATE inventory_levels SET quantity = 15  WHERE product_id = (SELECT id FROM products WHERE slug='macbook-pro-16-m3-max');
UPDATE inventory_levels SET quantity = 22  WHERE product_id = (SELECT id FROM products WHERE slug='dell-xps-15-developer');
UPDATE inventory_levels SET quantity = 18  WHERE product_id = (SELECT id FROM products WHERE slug='lenovo-thinkpad-x1-carbon-gen11');
UPDATE inventory_levels SET quantity = 12  WHERE product_id = (SELECT id FROM products WHERE slug='asus-rog-zephyrus-g16');
UPDATE inventory_levels SET quantity = 10  WHERE product_id = (SELECT id FROM products WHERE slug='razer-blade-14');
UPDATE inventory_levels SET quantity = 40  WHERE product_id = (SELECT id FROM products WHERE slug='iphone-15-pro-max');
UPDATE inventory_levels SET quantity = 35  WHERE product_id = (SELECT id FROM products WHERE slug='samsung-galaxy-s24-ultra');
UPDATE inventory_levels SET quantity = 50  WHERE product_id = (SELECT id FROM products WHERE slug='iphone-15');
UPDATE inventory_levels SET quantity = 15  WHERE product_id = (SELECT id FROM products WHERE slug='samsung-galaxy-z-fold5');
UPDATE inventory_levels SET quantity = 45  WHERE product_id = (SELECT id FROM products WHERE slug='apple-watch-series-9');
UPDATE inventory_levels SET quantity = 15  WHERE product_id = (SELECT id FROM products WHERE slug='garmin-fenix-7x-sapphire-solar');
UPDATE inventory_levels SET quantity = 18  WHERE product_id = (SELECT id FROM products WHERE slug='sony-a7-iv');
UPDATE inventory_levels SET quantity = 12  WHERE product_id = (SELECT id FROM products WHERE slug='nikon-z8');

-- =========================================================
-- USERS & ADDRESSES
-- =========================================================
-- Users require bcrypt password hashing which cannot be done in plain SQL.
-- After running this script, seed employees by running:
--
--   docker cp seed-employees.js avella-api:/app/seed-employees.js
--   docker exec avella-api node seed-employees.js
--
-- This creates 17 Avella AS users (password: Avella2026) with work addresses
-- at Dronningens gate, 0103 Oslo, Norway.
