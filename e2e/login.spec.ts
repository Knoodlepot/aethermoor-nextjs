import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Login Flow', () => {
  // Use a fresh unauthenticated context so we actually see the login page
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should show login page and allow login', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    await expect(page.getByText(/AETHERMOOR/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /SIGN IN/i })).toBeVisible();
    if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
      const emailInput = page.locator('input[type="email"]');
      await emailInput.first().waitFor({ state: 'visible' });
      await emailInput.first().fill(process.env.TEST_EMAIL);
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.first().waitFor({ state: 'visible' });
      await passwordInput.first().fill(process.env.TEST_PASSWORD);
      await page.getByRole('button', { name: /SIGN IN/i }).click();
      // After login, redirected to /game — pass age gate then check logout button
      await page.waitForURL(`${BASE_URL}/game`, { timeout: 15000 });
      const ageGateBtn = page.getByRole('button', { name: /I am 18 or older/i });
      if (await ageGateBtn.isVisible()) {
        await ageGateBtn.click();
      }
      await expect(page.getByRole('button', { name: /Logout/i })).toBeVisible({ timeout: 15000 });
    }
  });
});
