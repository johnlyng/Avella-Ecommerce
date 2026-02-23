-- ============================================================
-- Avella Ecommerce — Hard Reset
-- ============================================================
-- Truncates all tables so they can be re-seeded from scratch.
--
-- After running this, seed the database with:
--
--   docker exec avella-api node seed.js
--
-- Or locally:
--   node api/seed.js
-- ============================================================

TRUNCATE TABLE
    cart_items,
    order_items,
    carts,
    orders,
    addresses,
    inventory_levels,
    products,
    categories,
    users,
    companies
RESTART IDENTITY CASCADE;

-- Webhook tables (truncate only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'webhook_logs') THEN
        TRUNCATE TABLE webhook_logs RESTART IDENTITY CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'webhook_endpoints') THEN
        TRUNCATE TABLE webhook_endpoints RESTART IDENTITY CASCADE;
    END IF;
END $$;
