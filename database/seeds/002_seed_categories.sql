-- Seed Categories for Electronics Ecommerce
-- Migration: 002_seed_categories.sql

INSERT INTO categories (name, slug, description, image_url) VALUES
  (
    'Laptops',
    'laptops',
    'High-performance laptops for work, gaming, and everyday use',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
  ),
  (
    'Smartphones',
    'smartphones',
    'Latest smartphones with cutting-edge technology',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'
  ),
  (
    'Tablets',
    'tablets',
    'Portable tablets for entertainment and productivity',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'
  ),
  (
    'Headphones',
    'headphones',
    'Premium headphones for immersive audio experience',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
  ),
  (
    'Smartwatches',
    'smartwatches',
    'Smart wearables to track fitness and stay connected',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
  ),
  (
    'Cameras',
    'cameras',
    'Professional cameras for photography enthusiasts',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'
  );
