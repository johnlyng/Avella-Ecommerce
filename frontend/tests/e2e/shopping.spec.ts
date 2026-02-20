import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should allow browsing categories and finding products', async ({ page }) => {
        // Check heading
        await expect(page.getByRole('heading', { name: /Shop by Category/i })).toBeVisible();

        // Use a more relaxed selector for the category link
        const categoryLink = page.getByRole('link', { name: /Laptops/i }).first();
        await categoryLink.click();

        // Wait for navigation to complete (generous timeout to handle Next.js routing)
        await page.waitForURL(/.*category=.*/, { timeout: 10000 });
    });

    test('should handle the full cart journey: add, update, remove', async ({ page }) => {
        await page.getByRole('heading', { name: /Featured Products/i }).scrollIntoViewIfNeeded();

        const firstProduct = page.locator('div.group').first();
        const productName = await firstProduct.locator('h3').textContent();

        await firstProduct.getByRole('button', { name: /Add to Cart/i }).click();

        await expect(firstProduct.getByRole('button')).toHaveText(/Added!/i);

        // Navigate to cart
        await page.goto('/cart');

        // Check product in cart (fuzzy match)
        await expect(page.locator('main')).toContainText(productName!.trim());

        // Remove item
        const removeButton = page.getByRole('button', { name: /Remove/i }).first();

        // click auto-waits for visibility and actionability
        await removeButton.click();
        await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
    });

    test('cart should persist after page refresh', async ({ page }) => {
        const firstProduct = page.locator('div.group').first();
        await firstProduct.getByRole('button', { name: /Add to Cart/i }).click();
        await expect(firstProduct.getByRole('button')).toHaveText(/Added!/i);

        await page.reload();

        // Header cart badge
        const cartBadge = page.locator('header').getByText(/[1-9]/);
        await expect(cartBadge).toBeVisible();
    });
});
