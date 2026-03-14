import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Login Flow', () => {
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
      await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    }
  });
});
    test('should show login page and allow login', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      // Check for main heading (all caps)
      await expect(page.getByText(/AETHERMOOR/i)).toBeVisible();
      // Only check for the SIGN IN button to avoid strict mode violation
      await expect(page.getByRole('button', { name: /SIGN IN/i })).toBeVisible();
      // Optionally fill in login form if test credentials are set
      if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
        const emailInput = page.locator('input[type="email"]');
        await emailInput.first().waitFor({ state: 'visible' });
        await emailInput.first().fill(process.env.TEST_EMAIL);
        const passwordInput = page.locator('input[type="password"]');
        await passwordInput.first().waitFor({ state: 'visible' });
        await passwordInput.first().fill(process.env.TEST_PASSWORD);
        await page.getByRole('button', { name: /SIGN IN/i }).click();
        // Wait for a unique element that only appears after login (Logout button)
        await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
      }
    });
