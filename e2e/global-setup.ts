
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load .env.local if present
const dotenvPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
}

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function globalSetup() {
  if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
    throw new Error(
      '\n\nE2E TEST SETUP ERROR: TEST_EMAIL and TEST_PASSWORD must be set in your environment or .env.local for Playwright E2E tests to run.\n' +
      'Set these to a valid test user and try again.\n\n'
    );
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/auth`);
  try {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.first().waitFor({ state: 'visible' });
    await emailInput.first().fill(process.env.TEST_EMAIL);
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.first().waitFor({ state: 'visible' });
    await passwordInput.first().fill(process.env.TEST_PASSWORD);
    await page.getByRole('button', { name: /SIGN IN/i }).click();
    await page.waitForSelector('text=/logout|main quest|adventurer/i', { timeout: 20000 });
    await page.context().storageState({ path: 'e2e/auth-state.json' });
  } catch (err) {
    const html = await page.content();
    fs.writeFileSync('e2e/debug-auth.html', html);
    console.error('\n[Playwright global-setup] Could not find EMAIL label. Dumped page HTML to e2e/debug-auth.html.');
    throw err;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
