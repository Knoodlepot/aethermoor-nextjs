
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
    await page.waitForURL(`${BASE_URL}/game`, { timeout: 20000 });
    // Set age verification in localStorage so the game renders past the age gate
    await page.evaluate(() => {
      localStorage.setItem('aethermoor_age_verified', '1');
    });
    await page.context().storageState({ path: 'e2e/auth-state.json' });

    // Create a minimal save so tests start with a fully loaded game (player in town context)
    const meRes = await page.request.get(`${BASE_URL}/api/auth/me`);
    if (meRes.ok()) {
      const me = await meRes.json();
      const playerId = me.playerId;
      const player = {
        id: playerId,
        name: 'E2E Tester',
        class: 'Warrior',
        level: 1,
        hp: 10, maxHp: 10,
        str: 5, agi: 5, int: 5, wil: 5,
        gold: 100,
        location: 'Aethermoor Capital',
        reputation: 0,
        wantedLevel: 0,
        context: 'town',
        inventory: [],
        abilities: [],
        quests: [],
        equipped: {},
        knownNpcs: [],
        scheduledEvents: [],
        bestiary: [],
        unlockedSkills: [],
        joinedFactions: [],
        gameHour: 8,
        gameDay: 1,
        isAlive: true,
        canAct: true,
      };
      const worldSeed = {
        seed: 'e2e-seed',
        locations: ['Aethermoor Capital'],
        travelMatrix: { locationGrid: {}, edges: [] },
        mainQuestSeed: { villain: 'The Shadow', ally: 'The Elder', acts: [] },
        factionStandings: {},
        locationStandings: {},
      };
      await page.request.post(`${BASE_URL}/api/save`, {
        data: {
          player_json: JSON.stringify(player),
          seed_json: JSON.stringify(worldSeed),
          messages_json: JSON.stringify([]),
          narrative: 'You stand at the gates of Aethermoor Capital.',
          log_json: JSON.stringify([]),
          slot: 1,
        },
      });
    }
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
