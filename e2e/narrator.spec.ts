import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Helper to ensure a valid save exists for the test user, using the correct playerId
async function ensureValidSave(request) {
  // eslint-disable-next-line no-console
  console.log('[E2E DEBUG] ensureValidSave called');
  // Fetch the authenticated user's playerId
  const meRes = await request.get('/api/auth/me');
  if (meRes.status() !== 200) {
    throw new Error('Failed to fetch /api/auth/me for playerId');
  }
  const me = await meRes.json();
  const playerId = me.playerId;
  // eslint-disable-next-line no-console
  console.log('[E2E DEBUG] playerId', playerId);

  // DEBUG: Log the GET /api/save response before posting a new save
  const res = await request.get('/api/save?playerId=' + playerId);
  const saveData = await res.json();
  // eslint-disable-next-line no-console
  console.log('[E2E DEBUG] /api/save GET response BEFORE POST:', JSON.stringify(saveData));
  // Minimal valid player and worldSeed
  const player = {
    id: playerId,
    name: 'E2E Tester',
    class: 'Warrior',
    level: 1,
    hp: 10,
    maxHp: 10,
    str: 5,
    agi: 5,
    int: 5,
    wil: 5,
    gold: 0,
    location: 'Aethermoor Capital',
    reputation: 0,
    wantedLevel: 0,
    context: 'explore',
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
  const worldSeed = { seed: 'e2e-seed' };
  const messages = [];
  const narrative = 'Test narrative: you stand at the gates.';
  const log = [];
  const postRes = await request.post('/api/save', {
    data: {
      player_json: JSON.stringify(player),
      seed_json: JSON.stringify(worldSeed),
      messages_json: JSON.stringify(messages),
      narrative,
      log_json: JSON.stringify(log),
    },
  });
  // eslint-disable-next-line no-console
  console.log('[E2E DEBUG] /api/save POST status:', postRes.status());
  try {
    const postJson = await postRes.json();
    console.log('[E2E DEBUG] /api/save POST response:', JSON.stringify(postJson));
  } catch (e) {
    console.log('[E2E DEBUG] /api/save POST response not JSON:', e);
  }
}

test.beforeEach(async ({ request }) => {
  await ensureValidSave(request);
});

test('should allow a player to submit a command and receive a narrator response', async ({ page, request }) => {
    // Capture and print all browser console logs
    page.on('console', msg => {
      // Print all console messages from the browser
      // eslint-disable-next-line no-console
      console.log(`[BROWSER LOG] [${msg.type()}]`, msg.text());
    });
  // Fetch and log /api/save after login, before navigating to /game
  const saveRes = await request.get('/api/save');
  const saveJson = await saveRes.json();
  // eslint-disable-next-line no-console
  console.log('[E2E DEBUG] /api/save after login:', JSON.stringify(saveJson));

  await page.goto(`${BASE_URL}/game`);
  // Wait for state to load
  await page.waitForTimeout(2000);
  const gameStateDump = await page.evaluate(() => {
    // @ts-ignore
    return window.gameState ? JSON.stringify(window.gameState) : 'window.gameState not set';
  });
  // eslint-disable-next-line no-console
  console.log('[E2E DEBUG] window.gameState:', gameStateDump);
  await expect(page.getByText('Loading your adventure…')).not.toBeVisible({ timeout: 10000 });
  const inputLocator = page.locator('input[placeholder="What do you do?"]');
  await expect(inputLocator).toBeVisible({ timeout: 7000 });
  await expect(inputLocator).toBeEnabled({ timeout: 7000 });
  try {
    await page.waitForSelector('[data-testid="narrative-panel"]', { timeout: 15000 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('[E2E DEBUG] Narrative panel not found, page HTML:', await page.content());
    throw e;
  }

  // Capture the intro text
  const introText = await page.locator('[data-testid="narrative-panel"]').textContent();

  // Submit a command to trigger the narrator
  await inputLocator.fill('look');
  await page.getByRole('button', { name: /▶/ }).click();

  // Wait for the narrative panel to update with a new message (not the intro)
  await page.waitForFunction((selector, prevText) => {
    const panel = document.querySelector(selector);
    if (!panel) return false;
    const text = panel.textContent || '';
    return text.trim().length > 0 && text !== prevText;
  }, '[data-testid="narrative-panel"]', introText, { timeout: 15000 });

  // Assert that the new message is different from the intro
  const narrativeText = await page.locator('[data-testid="narrative-panel"]').textContent();
  expect(narrativeText).toBeTruthy();
  expect(narrativeText).not.toBe(introText);
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ path: `test-fail-${testInfo.title.replace(/\s+/g, '_')}.png`, fullPage: true });
    const html = await page.content();
    require('fs').writeFileSync(`test-fail-${testInfo.title.replace(/\s+/g, '_')}.html`, html);
  }
});

