/**
 * End-to-end narrator turn test.
 * Registers an ephemeral account, starts a game, sends a narrator command,
 * verifies the response shape, then cleans up.
 *
 * Usage: node __tests__/manual/narratorTurnTest.cjs
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load .env.local
const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
for (const line of raw.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq <= 0) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim();
  if (!process.env[k]) process.env[k] = v;
}

const BASE = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const tag = Date.now();
const email = `narrator-test-${tag}@example.com`;
const password = 'Narr@t0rTest!';

let sessionCookie = '';
let playerId = '';
let passed = 0;
let failed = 0;

function ok(label, detail) { console.log(`PASS ${label}${detail ? '\n  ' + detail : ''}`); passed++; }
function fail(label, detail) { console.error(`FAIL ${label}${detail ? '\n  ' + detail : ''}`); failed++; }

async function fetchJ(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (sessionCookie) headers['Cookie'] = sessionCookie;
  const r = await fetch(`${BASE}${path}`, { ...opts, headers });
  const body = await r.text();
  let json;
  try { json = JSON.parse(body); } catch { json = body; }
  return { status: r.status, headers: r.headers, json };
}

async function extractCookie(headers) {
  const sc = headers.get('set-cookie') || '';
  const parts = sc.split(';').map(s => s.trim());
  const tok = parts.find(p => p.startsWith('aethermoor_auth='));
  if (tok) sessionCookie = tok;
}

// Minimal player state matching what the game initializes on new game
function makeInitialSave() {
  playerId = `player_narrator_test_${tag}`;
  const player = {
    id: playerId,
    name: 'Aethen',
    class: 'Warrior',
    level: 1,
    hp: 30,
    maxHp: 30,
    gold: 10,
    tokens: 5,
    xp: 0,
    xpToNext: 100,
    attack: 8,
    defense: 5,
    speed: 5,
    statPoints: 0,
    inventory: [],
    quests: [],
    completedQuests: [],
    factions: {},
    reputation: {},
    kills: {},
    skills: [],
    ngPlus: 0,
    permaDead: false,
    location: 'Thornhaven',
    day: 1,
    hour: 8,
    inDungeon: false,
    wantedLevel: 0,
    villain: false,
    traits: [],
    companions: [],
    lastNarrative: '',
    log: [],
  };

  const seed = {
    worldName: 'Verdania',
    biome: 'Forest',
    travelTimes: { 'Thornhaven-Millhaven': 2 },
    worldEvents: [],
    npcs: [],
    geography: { harbourTowns: [] },
  };

  return { player, seed };
}

(async () => {
  console.log(`\nNarrator Turn Test — ${BASE}\n`);

  // 1. Register
  const reg = await fetchJ('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await extractCookie(reg.headers);
  if (reg.status === 200 && sessionCookie) {
    ok('Register + cookie set', `email=${email}`);
  } else {
    fail('Register', `status=${reg.status} body=${JSON.stringify(reg.json)}`);
    process.exit(1);
  }

  // 2. Cloud save — write initial state
  const { player, seed } = makeInitialSave();
  const save = await fetchJ('/api/save', {
    method: 'POST',
    body: JSON.stringify({
      playerId: player.id,
      player_json: JSON.stringify(player),
      seed_json: JSON.stringify(seed),
      messages_json: JSON.stringify([]),
      narrative: '',
      log_json: JSON.stringify([]),
    }),
  });
  if (save.status === 200) {
    ok('Cloud save (initial state written)');
  } else {
    fail('Cloud save', `status=${save.status} body=${JSON.stringify(save.json)}`);
  }

  // 3. Send a narrator turn
  const turn = await fetchJ('/api/claude', {
    method: 'POST',
    body: JSON.stringify({
      player,
      worldSeed: seed,
      messages: [{ role: 'user', content: 'Look around.' }],
      suggestions: [],
    }),
  });

  if (turn.status === 200) {
    const b = turn.json;
    const hasNarrative = typeof b.narrative === 'string' && b.narrative.length > 0;
    const hasPlayer    = b.player && typeof b.player.id === 'string';
    const hasSuggestions = Array.isArray(b.suggestions);
    if (hasNarrative && hasPlayer && hasSuggestions) {
      ok('Narrator turn', `narrative="${b.narrative.slice(0, 80)}..."`);
      ok('Response shape', `player.id=${b.player.id} suggestions=${b.suggestions.length}`);
    } else {
      fail('Narrator turn response shape', JSON.stringify({ hasNarrative, hasPlayer, hasSuggestions }));
    }
  } else {
    fail('Narrator turn', `status=${turn.status} body=${JSON.stringify(turn.json).slice(0, 300)}`);
  }

  // 4. Cleanup — delete the ephemeral account from DB
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const acct = await client.query(`SELECT id FROM accounts WHERE email=$1`, [email]);
    if (acct.rows.length) {
      await client.query(`DELETE FROM accounts WHERE email=$1`, [email]);
      ok('Cleanup', `Deleted ephemeral account ${email}`);
    }
  } finally {
    client.release();
    await pool.end();
  }

  // Summary
  console.log(`\nNarrator turn test: ${passed}/${passed + failed} passed\n`);
  if (failed > 0) process.exit(1);
})().catch((e) => {
  console.error('Uncaught error:', e.message);
  process.exit(1);
});
