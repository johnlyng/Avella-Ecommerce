-- Seed Products for Electronics Ecommerce
-- Migration: 003_seed_products.sql
-- 48 products across 6 categories (8 products each)

-- Get category IDs (will be available after 002_seed_categories.sql runs)

-- LAPTOPS (8 products)
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications) VALUES
  (
    (SELECT id FROM categories WHERE slug = 'laptops'),
    'MacBook Pro 16" M3 Max',
    'macbook-pro-16-m3-max',
    'Ultimate performance for professionals. Features the powerful M3 Max chip, stunning Liquid Retina XDR display, and all-day battery life.',
    3499.00,
    3999.00,
    'LAP-MBP-M3-001',
    15,
    '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800"]',
    '{"brand": "Apple", "model": "MacBook Pro 16", "cpu": "Apple M3 Max", "ram": "36GB", "storage": "1TB SSD", "display": "16.2-inch Liquid Retina XDR", "gpu": "40-core GPU"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptops'),
    'Dell XPS 15 Developer Edition',
    'dell-xps-15-developer',
    'Premium ultrabook for developers. Intel Core i9, NVIDIA RTX 4060, and stunning 15.6" OLED display.',
    2299.00,
    2599.00,
    'LAP-DELL-XPS-002',
    22,
    '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
    '{"brand": "Dell", "model": "XPS 15 9530", "cpu": "Intel Core i9-13900H", "ram": "32GB DDR5", "storage": "1TB NVMe SSD", "display": "15.6-inch OLED 3.5K", "gpu": "NVIDIA RTX 4060 8GB"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptops'),
    'Lenovo ThinkPad X1 Carbon Gen 11',
    'lenovo-thinkpad-x1-carbon-gen11',
    'Business laptop perfected. Ultralight design with legendary ThinkPad keyboard and enterprise security.',
    1899.00,
    2199.00,
    'LAP-LEN-X1C-003',
    18,
    '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]',
    '{"brand": "Lenovo", "model": "ThinkPad X1 Carbon", "cpu": "Intel Core i7-1365U", "ram": "16GB LPDDR5", "storage": "512GB SSD", "display": "14-inch 2.8K OLED", "weight": "2.48 lbs"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptops'),
    'ASUS ROG Zephyrus G16',
    'asus-rog-zephyrus-g16',
    'Gaming powerhouse in a sleek package. RTX 4070, QHD+ 240Hz display, and RGB lighting.',
    2499.00,
    2799.00,
    'LAP-ASUS-ZEP-004',
    12,
    '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"]',
    '{"brand": "ASUS", "model": "ROG Zephyrus G16", "cpu": "Intel Core i9-13900H", "ram": "32GB DDR5", "storage": "1TB NVMe SSD", "display": "16-inch QHD+ 240Hz", "gpu": "NVIDIA RTX 4070 8GB"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptops'),
    'HP Spectre x360 14',
    'hp-spectre-x360-14',
    'Convertible 2-in-1 with stunning design. OLED touchscreen, Intel Evo platform, and gem-cut edges.',
    1699.00,
    1899.00,
    'LAP-HP-SPX-005',
    20,
    '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]',
    '{"brand": "HP", "model": "Spectre x360 14", "cpu": "Intel Core i7-1355U", "ram": "16GB LPDDR4x", "storage": "1TB SSD", "display": "13.5-inch 3K2K OLED Touch", "battery": "Up to 16 hours"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptops'),
    'Microsoft Surface Laptop 5',
    'microsoft-surface-laptop-5',
    'Perfect balance of style and performance. PixelSense touchscreen and premium Alcantara keyboard.',
    1299.00,
    1499.00,
    'LAP-MS-SL5-006',
    25,
    '["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800"]',
    '{"brand": "Microsoft", "model": "Surface Laptop 5", "cpu": "Intel Core i7-1255U", "ram": "16GB LPDDR5x", "storage": "512GB SSD", "display": "13.5-inch PixelSense Touch", "weight": "2.86 lbs"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptops'),
    'Acer Swift 3 OLED',
    'acer-swift-3-oled',
    'Affordable excellence. Stunning OLED display and all-day battery in a lightweight aluminum chassis.',
    899.00,
    1099.00,
    'LAP-ACR-SW3-007',
    30,
    '["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800"]',
    '{"brand": "Acer", "model": "Swift 3 OLED", "cpu": "AMD Ryzen 7 7840U", "ram": "16GB LPDDR5", "storage": "512GB SSD", "display": "14-inch 2.8K OLED", "battery": "Up to 12 hours"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptops'),
    'Razer Blade 14',
    'razer-blade-14',
    'Compact gaming beast. AMD Ryzen 9, RTX 4070, and vapor chamber cooling in 14-inch form factor.',
    2399.00,
    2599.00,
    'LAP-RZR-BLD-008',
    10,
    '["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800"]',
    '{"brand": "Razer", "model": "Blade 14", "cpu": "AMD Ryzen 9 7940HS", "ram": "32GB DDR5", "storage": "1TB SSD", "display": "14-inch QHD+ 240Hz", "gpu": "NVIDIA RTX 4070 8GB"}'
  );

-- SMARTPHONES (8 products)
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications) VALUES
  (
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    'iPhone 15 Pro Max',
    'iphone-15-pro-max',
    'The ultimate iPhone with titanium design, A17 Pro chip, and revolutionary 5x optical zoom camera.',
    1199.00,
    1299.00,
    'PHN-IP15-PM-001',
    40,
    '["https://images.unsplash.com/photo-1592286927505-2fd8ae2f92e9?w=800"]',
    '{"brand": "Apple", "model": "iPhone 15 Pro Max", "storage": "256GB", "display": "6.7-inch Super Retina XDR", "chip": "A17 Pro", "camera": "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto", "battery": "Up to 29 hours video"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    'Samsung Galaxy S24 Ultra',
    'samsung-galaxy-s24-ultra',
    'Galaxy AI at your fingertips. 200MP camera, S Pen, and stunning 6.8" Dynamic AMOLED display.',
    1299.00,
    1399.00,
    'PHN-SAM-S24U-002',
    35,
    '["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"]',
    '{"brand": "Samsung", "model": "Galaxy S24 Ultra", "storage": "512GB", "display": "6.8-inch Dynamic AMOLED 2X", "chip": "Snapdragon 8 Gen 3", "camera": "200MP Main + 12MP Ultra Wide + 10MP 3x + 50MP 5x", "s_pen": "Included"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    'Google Pixel 8 Pro',
    'google-pixel-8-pro',
    'Pure Google experience with AI magic. Best-in-class computational photography and 7 years of updates.',
    999.00,
    1099.00,
    'PHN-GOO-P8P-003',
    28,
    '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"]',
    '{"brand": "Google", "model": "Pixel 8 Pro", "storage": "256GB", "display": "6.7-inch LTPO OLED 120Hz", "chip": "Google Tensor G3", "camera": "50MP Main + 48MP Ultra Wide + 48MP 5x Telephoto", "features": "Magic Editor, Best Take"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    'OnePlus 12',
    'oneplus-12',
    'Never Settle. Hasselblad camera system, 100W fast charging, and flagship Snapdragon performance.',
    799.00,
    899.00,
    'PHN-OPL-12-004',
    32,
    '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"]',
    '{"brand": "OnePlus", "model": "OnePlus 12", "storage": "256GB", "display": "6.82-inch LTPO AMOLED 120Hz", "chip": "Snapdragon 8 Gen 3", "camera": "50MP Main + 48MP Ultra Wide + 64MP 3x Periscope", "charging": "100W SuperVOOC"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    'Xiaomi 14 Pro',
    'xiaomi-14-pro',
    'Leica optics meet flagship power. Professional photography tools and lightning-fast 120W charging.',
    899.00,
    999.00,
    'PHN-XIA-14P-005',
    25,
    '["https://images.unsplash.com/photo-1592750877163-37ff5f2e3e84?w=800"]',
    '{"brand": "Xiaomi", "model": "14 Pro", "storage": "512GB", "display": "6.73-inch LTPO AMOLED 120Hz", "chip": "Snapdragon 8 Gen 3", "camera": "50MP Leica Main + 50MP Ultra Wide + 50MP 3.2x Telephoto", "charging": "120W HyperCharge"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    'iPhone 15',
    'iphone-15',
    'Dynamic Island comes to iPhone 15. A16 Bionic, advanced camera system, and all-day battery life.',
    799.00,
    899.00,
    'PHN-IP15-ST-006',
    50,
    '["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800"]',
    '{"brand": "Apple", "model": "iPhone 15", "storage": "128GB", "display": "6.1-inch Super Retina XDR", "chip": "A16 Bionic", "camera": "48MP Main + 12MP Ultra Wide", "features": "Dynamic Island, USB-C"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    'Samsung Galaxy Z Fold5',
    'samsung-galaxy-z-fold5',
    'Unfold your world. Foldable innovation with flagship specs, S Pen support, and multitasking mastery.',
    1799.00,
    1899.00,
    'PHN-SAM-ZF5-007',
    15,
    '["https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800"]',
    '{"brand": "Samsung", "model": "Galaxy Z Fold5", "storage": "256GB", "display": "7.6-inch Main + 6.2-inch Cover", "chip": "Snapdragon 8 Gen 2", "camera": "50MP Main + 12MP Ultra Wide + 10MP 3x Telephoto", "form_factor": "Foldable"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartphones'),
    'Nothing Phone (2)',
    'nothing-phone-2',
    'Pure, instinctive, and personal. Unique Glyph interface and clean Android experience.',
    599.00,
    699.00,
    'PHN-NTH-PH2-008',
    22,
    '["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"]',
    '{"brand": "Nothing", "model": "Phone (2)", "storage": "256GB", "display": "6.7-inch LTPO OLED 120Hz", "chip": "Snapdragon 8+ Gen 1", "camera": "50MP Main + 50MP Ultra Wide", "features": "Glyph Interface, Nothing OS"}'
  );

-- TABLETS (8 products)
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications) VALUES
  (
    (SELECT id FROM categories WHERE slug = 'tablets'),
    'iPad Pro 12.9" M2',
    'ipad-pro-129-m2',
    'The ultimate iPad experience. M2 chip, Liquid Retina XDR display, and Apple Pencil hover support.',
    1099.00,
    1199.00,
    'TAB-IPP-129-001',
    20,
    '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"]',
    '{"brand": "Apple", "model": "iPad Pro 12.9", "chip": "Apple M2", "storage": "256GB", "display": "12.9-inch Liquid Retina XDR", "camera": "12MP Wide + 10MP Ultra Wide", "features": "ProMotion, Apple Pencil 2 support"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'tablets'),
    'Samsung Galaxy Tab S9 Ultra',
    'samsung-galaxy-tab-s9-ultra',
    'Work and play on the biggest canvas. 14.6" Dynamic AMOLED display and included S Pen.',
    1199.00,
    1299.00,
    'TAB-SAM-S9U-002',
    15,
    '["https://images.unsplash.com/photo-1585789575438-76ab58c5b551?w=800"]',
    '{"brand": "Samsung", "model": "Galaxy Tab S9 Ultra", "chip": "Snapdragon 8 Gen 2", "storage": "512GB", "display": "14.6-inch Dynamic AMOLED 2X 120Hz", "s_pen": "Included", "features": "DeX mode, IP68 water resistant"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'tablets'),
    'iPad Air M2',
    'ipad-air-m2',
    'Power and versatility. M2 performance in an incredibly portable design with all-day battery.',
    599.00,
    699.00,
    'TAB-IPA-M2-003',
    30,
    '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]',
    '{"brand": "Apple", "model": "iPad Air", "chip": "Apple M2", "storage": "128GB", "display": "10.9-inch Liquid Retina", "camera": "12MP Wide", "features": "Touch ID, Apple Pencil 2 support"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'tablets'),
    'Microsoft Surface Pro 9',
    'microsoft-surface-pro-9',
    'Your portable PC. Intel Evo platform with detachable keyboard and Surface Pen support.',
    999.00,
    1099.00,
    'TAB-MS-SP9-004',
    18,
    '["https://images.unsplash.com/photo-1585783719744-23b0e589e88b?w=800"]',
    '{"brand": "Microsoft", "model": "Surface Pro 9", "cpu": "Intel Core i7-1255U", "storage": "256GB SSD", "display": "13-inch PixelSense 120Hz", "ram": "16GB", "features": "Windows 11, Thunderbolt 4"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'tablets'),
    'Samsung Galaxy Tab S9',
    'samsung-galaxy-tab-s9',
    'Premium Android tablet. Stunning 11" display, S Pen included, and IP68 water resistance.',
    799.00,
    899.00,
    'TAB-SAM-S9-005',
    25,
    '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]',
    '{"brand": "Samsung", "model": "Galaxy Tab S9", "chip": "Snapdragon 8 Gen 2", "storage": "256GB", "display": "11-inch Dynamic AMOLED 2X 120Hz", "s_pen": "Included", "features": "DeX mode, IP68"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'tablets'),
    'Lenovo Tab P12 Pro',
    'lenovo-tab-p12-pro',
    'Entertainment powerhouse. Dolby Atmos speakers, OLED display, and precision pen support.',
    699.00,
    799.00,
    'TAB-LEN-P12-006',
    22,
    '["https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800"]',
    '{"brand": "Lenovo", "model": "Tab P12 Pro", "chip": "Snapdragon 870", "storage": "256GB", "display": "12.6-inch AMOLED 120Hz", "speakers": "8x JBL with Dolby Atmos", "features": "Lenovo Precision Pen 3"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'tablets'),
    'iPad Mini 6',
    'ipad-mini-6',
    'Mega performance in a mini design. A15 Bionic chip and 8.3" all-screen display.',
    499.00,
    549.00,
    'TAB-IPM-6-007',
    28,
    '["https://images.unsplash.com/photo-1544244015-9c72a5f3e164?w=800"]',
    '{"brand": "Apple", "model": "iPad Mini 6", "chip": "Apple A15 Bionic", "storage": "64GB", "display": "8.3-inch Liquid Retina", "camera": "12MP Wide", "features": "Touch ID, Apple Pencil 2 support"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'tablets'),
    'Amazon Fire Max 11',
    'amazon-fire-max-11',
    'Best value tablet. Crisp 11" display, long battery life, and access to millions of apps.',
    229.00,
    279.00,
    'TAB-AMZ-FM11-008',
    40,
    '["https://images.unsplash.com/photo-1585790050230-5dd28404125b?w=800"]',
    '{"brand": "Amazon", "model": "Fire Max 11", "chip": "MediaTek MT8188J", "storage": "128GB", "display": "11-inch 2K LCD", "battery": "Up to 14 hours", "features": "Alexa built-in, expandable storage"}'
  );

-- HEADPHONES (8 products)
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications) VALUES
  (
    (SELECT id FROM categories WHERE slug = 'headphones'),
    'AirPods Max',
    'airpods-max',
    'Computational audio meets luxury design. Active Noise Cancellation and spatial audio excellence.',
    549.00,
    599.00,
    'AUD-APM-MAX-001',
    25,
    '["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"]',
    '{"brand": "Apple", "model": "AirPods Max", "type": "Over-ear", "features": "Active Noise Cancellation, Spatial Audio, Transparency Mode", "battery": "Up to 20 hours", "chip": "Apple H1"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'headphones'),
    'Sony WH-1000XM5',
    'sony-wh-1000xm5',
    'Industry-leading noise cancellation. Award-winning sound quality with AI-powered features.',
    399.00,
    449.00,
    'AUD-SNY-XM5-002',
    35,
    '["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"]',
    '{"brand": "Sony", "model": "WH-1000XM5", "type": "Over-ear", "features": "Premium ANC, LDAC support, Speak-to-Chat", "battery": "Up to 30 hours", "drivers": "30mm"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'headphones'),
    'Bose QuietComfort Ultra',
    'bose-quietcomfort-ultra',
    'Legendary silence. Bose Immersive Audio and world-class noise cancellation technology.',
    429.00,
    479.00,
    'AUD-BOS-QCU-003',
    30,
    '["https://images.unsplash.com/photo-1545127398-14699f92334b?w=800"]',
    '{"brand": "Bose", "model": "QuietComfort Ultra", "type": "Over-ear", "features": "CustomTune, Immersive Audio, Aware Mode", "battery": "Up to 24 hours", "connectivity": "Bluetooth 5.3"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'headphones'),
    'Sennheiser Momentum 4',
    'sennheiser-momentum-4',
    'Audiophile excellence. Exceptional sound quality with 60-hour battery life.',
    379.00,
    429.00,
    'AUD-SEN-MOM4-004',
    20,
    '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]',
    '{"brand": "Sennheiser", "model": "Momentum 4", "type": "Over-ear", "features": "Adaptive ANC, aptX Adaptive, Sound Personalization", "battery": "Up to 60 hours", "drivers": "42mm"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'headphones'),
    'AirPods Pro (2nd Gen)',
    'airpods-pro-2nd-gen',
    'Pro-level listening. Adaptive Audio, Personalized Spatial Audio, and USB-C charging.',
    249.00,
    279.00,
    'AUD-APP-2G-005',
    50,
    '["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800"]',
    '{"brand": "Apple", "model": "AirPods Pro 2", "type": "In-ear", "features": "Adaptive Audio, ANC, Transparency Mode, Personalized Spatial Audio", "battery": "Up to 6 hours (30 with case)", "chip": "Apple H2"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'headphones'),
    'Sony WF-1000XM5',
    'sony-wf-1000xm5',
    'True wireless perfection. Best-in-class ANC in compact, premium earbuds.',
    299.00,
    329.00,
    'AUD-SNY-WF5-006',
    40,
    '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"]',
    '{"brand": "Sony", "model": "WF-1000XM5", "type": "In-ear", "features": "Premium ANC, LDAC, DSEE Extreme", "battery": "Up to 8 hours (24 with case)", "drivers": "Dynamic Driver X"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'headphones'),
    'Beats Studio Pro',
    'beats-studio-pro',
    'Personalized spatial audio. Lossless audio via USB-C and all-day comfort.',
    349.00,
    399.00,
    'AUD-BTS-STP-007',
    28,
    '["https://images.unsplash.com/photo-1577174881658-0f30157f5223?w=800"]',
    '{"brand": "Beats", "model": "Studio Pro", "type": "Over-ear", "features": "Personalized Spatial Audio, Lossless USB-C, ANC", "battery": "Up to 40 hours", "compatibility": "iOS and Android"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'headphones'),
    'Jabra Elite 10',
    'jabra-elite-10',
    'Smart earbuds redefined. Dolby Atmos, multipoint connectivity, and superior call quality.',
    249.00,
    279.00,
    'AUD-JAB-E10-008',
    32,
    '["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"]',
    '{"brand": "Jabra", "model": "Elite 10", "type": "In-ear", "features": "Advanced ANC, Dolby Atmos, Multipoint", "battery": "Up to 6 hours (27 with case)", "certification": "IP57"}'
  );

-- SMARTWATCHES (8 products)
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications) VALUES
  (
    (SELECT id FROM categories WHERE slug = 'smartwatches'),
    'Apple Watch Series 9',
    'apple-watch-series-9',
    'Your essential companion. S9 chip, double tap gesture, and comprehensive health tracking.',
    429.00,
    479.00,
    'WTH-AWS9-001',
    45,
    '["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"]',
    '{"brand": "Apple", "model": "Watch Series 9", "display": "Always-On Retina 45mm", "chip": "S9 SiP", "features": "Double Tap, Blood Oxygen, ECG, Crash Detection", "battery": "Up to 18 hours", "water_resistance": "50m"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartwatches'),
    'Samsung Galaxy Watch 6 Classic',
    'samsung-galaxy-watch-6-classic',
    'Classic design meets modern tech. Rotating bezel, advanced sleep tracking, and Galaxy AI.',
    399.00,
    449.00,
    'WTH-SAM-GW6C-002',
    30,
    '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]',
    '{"brand": "Samsung", "model": "Galaxy Watch 6 Classic", "display": "1.5-inch Super AMOLED", "chip": "Exynos W930", "features": "Rotating Bezel, Body Composition, Sleep Coaching", "battery": "Up to 40 hours", "water_resistance": "5ATM + IP68"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartwatches'),
    'Garmin Fenix 7X Sapphire Solar',
    'garmin-fenix-7x-sapphire-solar',
    'Ultimate outdoor GPS watch. Solar charging, topographic maps, and expedition-grade battery life.',
    999.00,
    1099.00,
    'WTH-GAR-F7X-003',
    15,
    '["https://images.unsplash.com/photo-1617625802912-cde586faf331?w=800"]',
    '{"brand": "Garmin", "model": "Fenix 7X Sapphire Solar", "display": "1.4-inch MIP", "features": "Solar Charging, TopoActive Maps, Multi-GNSS", "battery": "Up to 37 days smartwatch mode", "water_resistance": "10ATM", "sports": "100+ sport modes"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartwatches'),
    'Apple Watch Ultra 2',
    'apple-watch-ultra-2',
    'Adventure proof. Titanium case, 100m water resistance, and precision dual-frequency GPS.',
    799.00,
    849.00,
    'WTH-AWU2-004',
    20,
    '["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"]',
    '{"brand": "Apple", "model": "Watch Ultra 2", "display": "Flat Sapphire 49mm", "chip": "S9 SiP", "features": "Action Button, Siren, Depth Gauge, Dual-Frequency GPS", "battery": "Up to 36 hours", "water_resistance": "100m"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartwatches'),
    'Google Pixel Watch 2',
    'google-pixel-watch-2',
    'Smarter health insights. Fitbit integration, stress management, and pure Wear OS experience.',
    349.00,
    399.00,
    'WTH-GOO-PW2-005',
    25,
    '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"]',
    '{"brand": "Google", "model": "Pixel Watch 2", "display": "1.2-inch AMOLED", "chip": "Qualcomm SW5100", "features": "Fitbit Premium, Stress Management, Safety Check", "battery": "Up to 24 hours", "water_resistance": "5ATM"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartwatches'),
    'Amazfit GTR 4',
    'amazfit-gtr-4',
    'Premium for less. Dual-band GPS, 150+ sports modes, and 14-day battery life.',
    199.00,
    249.00,
    'WTH-AMZ-GTR4-006',
    35,
    '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"]',
    '{"brand": "Amazfit", "model": "GTR 4", "display": "1.43-inch AMOLED", "features": "Dual-Band GPS, Alexa Built-in, 150+ Sports Modes", "battery": "Up to 14 days", "water_resistance": "5ATM", "sensors": "BioTracker 4.0"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartwatches'),
    'Fitbit Sense 2',
    'fitbit-sense-2',
    'Health and wellness hub. Continuous EDA scanning, stress management tools, and sleep insights.',
    299.00,
    329.00,
    'WTH-FIT-SEN2-007',
    28,
    '["https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800"]',
    '{"brand": "Fitbit", "model": "Sense 2", "display": "1.58-inch AMOLED", "features": "cEDA Stress Sensor, ECG, Sleep Stages", "battery": "Up to 6 days", "water_resistance": "5ATM", "subscription": "Fitbit Premium included"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'smartwatches'),
    'Withings ScanWatch 2',
    'withings-scanwatch-2',
    'Hybrid smartwatch elegance. Medical-grade ECG, SpO2, and 30-day battery in classic design.',
    349.00,
    399.00,
    'WTH-WIT-SW2-008',
    22,
    '["https://images.unsplash.com/photo-1622434616539-71a5c86d45e7?w=800"]',
    '{"brand": "Withings", "model": "ScanWatch 2", "display": "Analog + Digital PMOLED", "features": "Medical-Grade ECG, SpO2, Temperature Sensor", "battery": "Up to 30 days", "water_resistance": "10ATM", "certification": "FDA cleared"}'
  );

-- CAMERAS (8 products)
INSERT INTO products (category_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, specifications) VALUES
  (
    (SELECT id FROM categories WHERE slug = 'cameras'),
    'Sony A7 IV',
    'sony-a7-iv',
    'The hybrid king. 33MP full-frame sensor, 10fps burst, and professional 4K 60p video.',
    2499.00,
    2699.00,
    'CAM-SNY-A7IV-001',
    18,
    '["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800"]',
    '{"brand": "Sony", "model": "Alpha 7 IV", "sensor": "33MP Full-Frame CMOS", "video": "4K 60p 10-bit", "autofocus": "759-point AF", "burst": "10 fps", "stabilization": "5-axis IBIS", "mount": "Sony E"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'cameras'),
    'Canon EOS R6 Mark II',
    'canon-eos-r6-mark-ii',
    'Speed demon. 24MP sensor with 40fps burst, advanced subject tracking, and 6K video.',
    2499.00,
    2799.00,
    'CAM-CAN-R6M2-002',
    15,
    '["https://images.unsplash.com/photo-1606933248010-ef7784e97898?w=800"]',
    '{"brand": "Canon", "model": "EOS R6 Mark II", "sensor": "24MP Full-Frame CMOS", "video": "6K RAW, 4K 60p", "autofocus": "Dual Pixel CMOS AF II", "burst": "40 fps electronic", "stabilization": "5-axis IBIS", "mount": "Canon RF"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'cameras'),
    'Nikon Z8',
    'nikon-z8',
    'Flagship performance, compact body. 45MP stacked sensor, 8K video, and pro-grade durability.',
    3999.00,
    4299.00,
    'CAM-NIK-Z8-003',
    12,
    '["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"]',
    '{"brand": "Nikon", "model": "Z8", "sensor": "45MP Stacked Full-Frame", "video": "8K 60p N-RAW", "autofocus": "493-point 3D-tracking", "burst": "20 fps RAW", "stabilization": "5-axis VR", "mount": "Nikon Z"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'cameras'),
    'Fujifilm X-T5',
    'fujifilm-x-t5',
    'Retro meets cutting-edge. 40MP X-Trans sensor, film simulations, and classic control dials.',
    1699.00,
    1899.00,
    'CAM-FUJ-XT5-004',
    20,
    '["https://images.unsplash.com/photo-1606933303933-3eda5653f293?w=800"]',
    '{"brand": "Fujifilm", "model": "X-T5", "sensor": "40MP X-Trans CMOS 5", "video": "6.2K 30p", "autofocus": "425-point AF", "burst": "15 fps", "stabilization": "5-axis IBIS", "features": "19 Film Simulations"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'cameras'),
    'Panasonic Lumix S5 II',
    'panasonic-lumix-s5-ii',
    'Hybrid excellence. Phase-detect AF, unlimited recording, and exceptional value.',
    1999.00,
    2199.00,
    'CAM-PAN-S5II-005',
    16,
    '["https://images.unsplash.com/photo-1502920514313-52581002a659?w=800"]',
    '{"brand": "Panasonic", "model": "Lumix S5 II", "sensor": "24MP Full-Frame CMOS", "video": "6K 30p, 4K 60p 10-bit", "autofocus": "Phase Detect AF", "burst": "9 fps", "stabilization": "5-axis Dual I.S. 2", "mount": "L-Mount"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'cameras'),
    'DJI Osmo Action 4',
    'dji-osmo-action-4',
    'Action reimagined. 4K 120fps, 18m waterproof, and exceptional low-light performance.',
    399.00,
    449.00,
    'CAM-DJI-OA4-006',
    30,
    '["https://images.unsplash.com/photo-1606933248010-ef7784e97898?w=800"]',
    '{"brand": "DJI", "model": "Osmo Action 4", "sensor": "1/1.3-inch CMOS", "video": "4K 120fps", "stabilization": "RockSteady 3.0+", "battery": "Up to 160 min", "features": "Dual Touchscreens, 18m Waterproof", "lowlight": "D-Log M, 10-bit"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'cameras'),
    'GoPro HERO12 Black',
    'gopro-hero12-black',
    'The adventure camera. 5.3K 60fps, HyperSmooth 6.0, and rugged design.',
    399.00,
    449.00,
    'CAM-GOP-H12-007',
    28,
    '["https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800"]',
    '{"brand": "GoPro", "model": "HERO12 Black", "sensor": "1/1.9-inch", "video": "5.3K 60fps", "stabilization": "HyperSmooth 6.0", "features": "10-bit Color, HDR Video, Voice Control", "waterproof": "10m (33ft)", "battery": "Up to 70 min"}'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'cameras'),
    'Insta360 X3',
    'insta360-x3',
    '360° creativity unleashed. 5.7K 360 capture, invisible selfie stick, and AI editing.',
    449.00,
    499.00,
    'CAM-IN3-X3-008',
    25,
    '["https://images.unsplash.com/photo-1606918801925-e2c914c4b503?w=800"]',
    '{"brand": "Insta360", "model": "X3", "video": "5.7K 360° 30fps, 4K Single-Lens", "stabilization": "FlowState", "features": "Invisible Selfie Stick, AI Editing, Me Mode", "waterproof": "10m (IPX8)", "touchscreen": "2.29-inch"}'
  );
