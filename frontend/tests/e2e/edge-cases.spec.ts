import { test, expect } from '@playwright/test';

test.describe('Edge Cases & Resilience', () => {
    test('should handle out of stock items if present', async ({ page }) => {
        await page.goto('/');

        const outOfStockCard = page.locator('div.group').filter({ hasText: /Out of Stock/i });

        if (await outOfStockCard.count() > 0) {
            const button = outOfStockCard.first().getByRole('button');
            await expect(button).toBeDisabled();
            await expect(button).toHaveText(/Out of Stock/i);
        } else {
            test.skip(); // Skip if no out-of-stock items are currently in the featured list
        }
    });

    test('should show empty cart state', async ({ page }) => {
        await page.goto('/cart');
        await expect(page.getByText(/your cart is empty/i)).toBeVisible();
        await expect(page.getByRole('link', { name: /Shop Now|All Products/i })).toBeVisible();
    });

    test('should recover from stale cart session (Self-Healing)', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            localStorage.setItem('cartId', '99999999-9999-9999-9999-999999999999');
        });

        await page.reload();

        const firstProduct = page.locator('div.group').first();
        const addToCartButton = firstProduct.getByRole('button', { name: /Add to Cart/i });
        await addToCartButton.click();

        // Verify self-healing - using a generous timeout for the retry logic
        await expect(addToCartButton).toHaveText(/Added!/i, { timeout: 15000 });

        const newCartId = await page.evaluate(() => localStorage.getItem('cartId'));
        expect(newCartId).not.toBe('99999999-9999-9999-9999-999999999999');
        expect(newCartId).toBeTruthy();
    });
});
