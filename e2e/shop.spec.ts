import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Shop Flow', () => {
  test('should display shop and allow item purchase', async ({ page }) => {
    // Assumes session is already authenticated via storageState
    await page.goto(`${BASE_URL}/game`);
    await page.getByRole('button', { name: /shop/i }).click();
    await expect(page.getByText(/shop|buy|item|token/i, { exact: false })).toBeVisible();
    const buyButtons = await page.getByRole('button', { name: /buy/i }).all();
    if (buyButtons.length > 0) {
      await buyButtons[0].click();
      await expect(page.getByText(/purchased|success|thank you|tokens/i, { exact: false })).toBeVisible();
    }
  });
});
    test('should display shop and allow item purchase', async ({ page }) => {
      // Assumes session is already authenticated via storageState
      await page.goto(`${BASE_URL}/game`);
      await page.getByRole('button', { name: /shop/i }).click();
      // Wait for a unique shop heading or panel
      await expect(page.getByText(/shop/i)).toBeVisible();
      const buyButtons = await page.getByRole('button', { name: /buy/i }).all();
      if (buyButtons.length > 0) {
        await buyButtons[0].click();
        // Wait for a unique purchase confirmation (toast, alert, etc.)
        const confirmation = page.locator('[data-testid="purchase-confirmation"], .Toastify__toast, [class*=Toast]');
        await expect(confirmation).toContainText(/purchased|success|thank you|tokens/i, { timeout: 5000 });
      }
    });
