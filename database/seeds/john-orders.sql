-- Create 3 orders for John Lyngstad

-- ORDER 1: Delivered (62 days ago) — MacBook Pro 16" M3 Max + Sony WH-1000XM5
WITH new_order AS (
    INSERT INTO orders (user_id, status, subtotal, tax, shipping, total, shipping_address, billing_address, created_at)
    SELECT
        u.id,
        'delivered',
        p1.price + p2.price,
        ROUND((p1.price + p2.price) * 0.25, 2),
        199.00,
        ROUND((p1.price + p2.price) * 1.25 + 199.00, 2),
        jsonb_build_object('firstName', u.first_name, 'lastName', u.last_name,
            'addressLine1', a.address_line1, 'city', a.city,
            'postalCode', a.postal_code, 'country', a.country),
        jsonb_build_object('firstName', u.first_name, 'lastName', u.last_name,
            'addressLine1', a.address_line1, 'city', a.city,
            'postalCode', a.postal_code, 'country', a.country),
        NOW() - INTERVAL '62 days'
    FROM users u
    JOIN addresses a ON a.user_id = u.id
    CROSS JOIN (SELECT price FROM products WHERE slug = 'macbook-pro-16-m3-max') p1
    CROSS JOIN (SELECT price FROM products WHERE slug = 'sony-wh-1000xm5') p2
    WHERE u.email = 'john.arne.lyngstad@avella.no'
    RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price, total)
SELECT o.id, p.id, p.name, p.sku, 1, p.price, p.price
FROM new_order o
CROSS JOIN (SELECT id, name, sku, price FROM products WHERE slug IN ('macbook-pro-16-m3-max','sony-wh-1000xm5')) p;

-- ORDER 2: Shipped (10 days ago) — Apple Watch Series 9 + Google Pixel 8 Pro
WITH new_order AS (
    INSERT INTO orders (user_id, status, subtotal, tax, shipping, total, shipping_address, billing_address, created_at)
    SELECT
        u.id,
        'shipped',
        p1.price + p2.price,
        ROUND((p1.price + p2.price) * 0.25, 2),
        99.00,
        ROUND((p1.price + p2.price) * 1.25 + 99.00, 2),
        jsonb_build_object('firstName', u.first_name, 'lastName', u.last_name,
            'addressLine1', a.address_line1, 'city', a.city,
            'postalCode', a.postal_code, 'country', a.country),
        jsonb_build_object('firstName', u.first_name, 'lastName', u.last_name,
            'addressLine1', a.address_line1, 'city', a.city,
            'postalCode', a.postal_code, 'country', a.country),
        NOW() - INTERVAL '10 days'
    FROM users u
    JOIN addresses a ON a.user_id = u.id
    CROSS JOIN (SELECT price FROM products WHERE slug = 'apple-watch-series-9') p1
    CROSS JOIN (SELECT price FROM products WHERE slug = 'google-pixel-8-pro') p2
    WHERE u.email = 'john.arne.lyngstad@avella.no'
    RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price, total)
SELECT o.id, p.id, p.name, p.sku, 1, p.price, p.price
FROM new_order o
CROSS JOIN (SELECT id, name, sku, price FROM products WHERE slug IN ('apple-watch-series-9','google-pixel-8-pro')) p;

-- ORDER 3: Pending (today) — iPad Air M2 + GoPro HERO12 Black
WITH new_order AS (
    INSERT INTO orders (user_id, status, subtotal, tax, shipping, total, shipping_address, billing_address, created_at)
    SELECT
        u.id,
        'pending',
        p1.price + p2.price,
        ROUND((p1.price + p2.price) * 0.25, 2),
        49.00,
        ROUND((p1.price + p2.price) * 1.25 + 49.00, 2),
        jsonb_build_object('firstName', u.first_name, 'lastName', u.last_name,
            'addressLine1', a.address_line1, 'city', a.city,
            'postalCode', a.postal_code, 'country', a.country),
        jsonb_build_object('firstName', u.first_name, 'lastName', u.last_name,
            'addressLine1', a.address_line1, 'city', a.city,
            'postalCode', a.postal_code, 'country', a.country),
        NOW()
    FROM users u
    JOIN addresses a ON a.user_id = u.id
    CROSS JOIN (SELECT price FROM products WHERE slug = 'ipad-air-m2') p1
    CROSS JOIN (SELECT price FROM products WHERE slug = 'gopro-hero12-black') p2
    WHERE u.email = 'john.arne.lyngstad@avella.no'
    RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price, total)
SELECT o.id, p.id, p.name, p.sku, 1, p.price, p.price
FROM new_order o
CROSS JOIN (SELECT id, name, sku, price FROM products WHERE slug IN ('ipad-air-m2','gopro-hero12-black')) p;

-- Verify
SELECT o.order_number, o.status, o.subtotal, o.tax, o.shipping, o.total,
       o.created_at::date AS date,
       string_agg(oi.product_name, ' + ') AS items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN users u ON o.user_id = u.id
WHERE u.email = 'john.arne.lyngstad@avella.no'
GROUP BY o.id, o.order_number, o.status, o.subtotal, o.tax, o.shipping, o.total, o.created_at
ORDER BY o.created_at;
