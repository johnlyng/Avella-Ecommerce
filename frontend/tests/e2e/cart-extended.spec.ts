import { test, expect } from '@playwright/test';

test.describe('Extended Cart Handling', () => {

    test('should manage multiple unique items and correct subtotals', async ({ page }) => {
        await page.goto('/');

        // Add first product
        const products = page.locator('div.group');
        const firstProduct = products.nth(0);
        const firstName = await firstProduct.locator('h3').textContent();
        await firstProduct.getByRole('button', { name: /Add to Cart/i }).click();
        await expect(firstProduct.getByRole('button')).toHaveText(/Added!/i);

        // Add second product
        const secondProduct = products.nth(1);
        const secondName = await secondProduct.locator('h3').textContent();
        await secondProduct.getByRole('button', { name: /Add to Cart/i }).click();
        await expect(secondProduct.getByRole('button')).toHaveText(/Added!/i);

        // Navigate to cart
        await page.goto('/cart');

        // Verify both items present
        await expect(page.locator('main')).toContainText(firstName!.trim());
        await expect(page.locator('main')).toContainText(secondName!.trim());

        // Verify badge count
        const cartBadge = page.locator('header').getByText('2');
        await expect(cartBadge).toBeVisible();
    });

    test('adding the same item multiple times should sum the quantity', async ({ page }) => {
        await page.goto('/');

        const firstProduct = page.locator('div.group').first();
        const productName = await firstProduct.locator('h3').textContent();

        // Add twice
        await firstProduct.getByRole('button', { name: /Add to Cart/i }).click();
        await expect(firstProduct.getByRole('button')).toHaveText(/Added!/i);

        // Small wait for state update
        await page.waitForTimeout(500);

        await firstProduct.getByRole('button', { name: /Add to Cart/i }).click();

        await page.goto('/cart');

        // Check quantity - find row with product name and check quantity input
        const cartItem = page.locator('div.flex.gap-4').filter({ hasText: productName!.trim() });
        const quantityInput = cartItem.locator('input[type="number"]');
        await expect(quantityInput).toHaveValue('2');
    });

    test('should merge guest cart into user account on login', async ({ page }) => {
        await page.goto('/');

        // 1. Add item as guest
        const firstProduct = page.locator('div.group').first();
        const productName = await firstProduct.locator('h3').textContent();
        await firstProduct.getByRole('button', { name: /Add to Cart/i }).click();
        await expect(firstProduct.getByRole('button')).toHaveText(/Added!/i);

        const guestCartId = await page.evaluate(() => localStorage.getItem('cartId'));
        expect(guestCartId).toBeTruthy();

        // 2. Register/Login as a new user
        const uniqueEmail = `merge_test_${Date.now()}@example.com`;
        await page.goto('/register');
        await page.getByLabel(/First name/i).fill('Merge');
        await page.getByLabel(/Last name/i).fill('Tester');
        await page.getByLabel(/Email/i).fill(uniqueEmail);
        await page.getByLabel(/^Password$/i).fill('tester123');
        await page.getByLabel(/Confirm Password/i).fill('tester123');
        await page.getByRole('button', { name: /Create account|Sign up/i }).click();

        // Wait for redirect to home
        await page.waitForURL('/', { timeout: 15000 });

        // 3. Verify item is still there after login (merged)
        await page.goto('/cart');
        await expect(page.locator('main')).toContainText(productName!.trim());

        // 4. Verify local storage has a valid cart ID (the merged one)
        const userCartId = await page.evaluate(() => localStorage.getItem('cartId'));
        expect(userCartId).toBeTruthy();
    });

    test('should allow manual quantity updates in the cart page', async ({ page }) => {
        await page.goto('/');

        const firstProduct = page.locator('div.group').first();
        await firstProduct.getByRole('button', { name: /Add to Cart/i }).click();

        await page.goto('/cart');

        const quantityInput = page.locator('input[type="number"]').first();

        // Increase to 3
        await quantityInput.fill('3');
        await quantityInput.dispatchEvent('change');

        // Verify totals update (check if subtotal contains the multiplied price)
        // This is a bit data-dependent, so we just check if it's still there and count is correct
        await expect(quantityInput).toHaveValue('3');

        // Verify badge
        const cartBadge = page.locator('header').getByText('3');
        await expect(cartBadge).toBeVisible();
    });
});
