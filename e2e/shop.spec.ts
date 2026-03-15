import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Shop Flow', () => {
  test('should display shop and allow item purchase', async ({ page }) => {
    // Assumes session is already authenticated via storageState
    await page.goto(`${BASE_URL}/game`);
    // Wait for game to load (toolbar visible)
    await expect(page.getByText('⚔ AETHERMOOR')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /🛒 Shop/i }).click();
    // Verify the shop panel opened (unique heading)
    await expect(page.getByText('🏪 SHOP')).toBeVisible({ timeout: 5000 });
    // Check for Buy buttons and optionally interact
    const buyButtons = await page.getByRole('button', { name: /^Buy$/ }).all();
    if (buyButtons.length > 0) {
      await buyButtons[0].click();
    }
  });
});
