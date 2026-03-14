import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Save Flow', () => {
  test('should allow player to save progress', async ({ page }) => {
    // Assumes session is already authenticated via storageState
    await page.goto(`${BASE_URL}/game`);
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/progress saved|game saved|success/i, { exact: false })).toBeVisible();
  });
});
    test('should allow player to save progress', async ({ page }) => {
      // Assumes session is already authenticated via storageState
      await page.goto(`${BASE_URL}/game`);
      const saveButton = page.getByRole('button', { name: /save/i });
      await expect(saveButton).toBeVisible();
      await saveButton.click();
      // Wait for a unique confirmation, e.g., a toast or alert with "saved"
      const confirmation = page.locator('[data-testid="save-confirmation"], .Toastify__toast, [class*=Toast]');
      await expect(confirmation).toContainText(/saved|success/i, { timeout: 5000 });
    });
