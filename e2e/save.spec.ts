import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Save Flow', () => {
  test('should allow player to save progress', async ({ page }) => {
    // Assumes session is already authenticated via storageState
    await page.goto(`${BASE_URL}/game`);
    // Wait for the Save button (only visible when player is loaded)
    await expect(page.getByRole('button', { name: /💾 Save/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /💾 Save/i }).click();
    // SaveSlotModal opens — verify it appeared
    await expect(page.getByText('SAVE GAME')).toBeVisible({ timeout: 5000 });
    // Click slot 1 to save (current slot)
    await page.getByText('SLOT 1').click();
    // Modal should close after saving
    await expect(page.getByText('SAVE GAME')).not.toBeVisible({ timeout: 5000 });
  });
});
