const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'SESSION_SECRET', 'ANTHROPIC_API_KEY'];

type CheckResult = {
  name: string;
  status: 'pass' | 'fail' | 'blocked';
  details: string;
};

async function main() {
  const results: CheckResult[] = [];

  results.push(checkEnvChecklist());

  const health = await checkHealth();
  results.push(health);

  if (health.status === 'pass') {
    results.push(await checkUnauthorized('GET /api/auth/me', '/api/auth/me'));
    results.push(await checkUnauthorized('GET /api/save', '/api/save'));
    results.push(await checkUnauthorizedClaude());
    results.push(await checkCookieLogout());
    results.push(await checkTamperedSave());
  } else {
    results.push(blocked('GET /api/auth/me', 'Blocked: local dev server is not reachable. Start `npm run dev` first.'));
    results.push(blocked('GET /api/save', 'Blocked: local dev server is not reachable. Start `npm run dev` first.'));
    results.push(blocked('POST /api/claude (anonymous)', 'Blocked: local dev server is not reachable. Start `npm run dev` first.'));
    results.push(blocked('POST /api/auth/logout (cookie session)', 'Blocked: local dev server is not reachable. Start `npm run dev` first.'));
    results.push(blocked('POST /api/save rejects mismatched playerId', 'Blocked: local dev server is not reachable. Start `npm run dev` first.'));
  }

  const credentialsAvailable = !!process.env.TEST_EMAIL && !!process.env.TEST_PASSWORD;
  if (credentialsAvailable) {
    results.push(await checkRealLoginFlow());
  } else {
    results.push(
      blocked('Real login flow', 'Skipped: set TEST_EMAIL and TEST_PASSWORD to exercise a real login session.')
    );
  }

  printResults(results);

  const failed = results.filter((result) => result.status === 'fail');
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

function checkEnvChecklist(): CheckResult {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  return missing.length === 0
    ? passed('Env checklist', 'Required env vars are present for full end-to-end checks.')
    : blocked('Env checklist', `Missing: ${missing.join(', ')}. Partial runtime verification still runs.`);
}

async function checkHealth(): Promise<CheckResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    return response.status === 200
      ? passed('GET /api/health', `Status ${response.status}`)
      : fail('GET /api/health', `Expected 200, got ${response.status}`);
  } catch (error) {
    return blocked('GET /api/health', error instanceof Error ? error.message : 'Local dev server not reachable');
  }
}

async function checkUnauthorized(name: string, path: string): Promise<CheckResult> {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.status === 401
      ? passed(name, `Status ${response.status}`)
      : fail(name, `Expected 401, got ${response.status}`);
  } catch (error) {
    return failure(name, error);
  }
}

async function checkUnauthorizedClaude(): Promise<CheckResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/claude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'look around' }],
        player: { name: 'Test' },
        worldSeed: {},
      }),
    });
    return response.status === 401
      ? passed('POST /api/claude (anonymous)', `Status ${response.status}`)
      : fail('POST /api/claude (anonymous)', `Expected 401, got ${response.status}`);
  } catch (error) {
    return failure('POST /api/claude (anonymous)', error);
  }
}

async function checkCookieLogout(): Promise<CheckResult> {
  try {
    const token = createTestJwt();
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: `aethermoor_auth=${token}`,
      },
    });
    const setCookie = response.headers.get('set-cookie') || '';
    const ok = response.status === 200 && setCookie.includes('aethermoor_auth=') && setCookie.includes('HttpOnly');
    return ok
      ? passed('POST /api/auth/logout (cookie session)', `Status ${response.status}; Set-Cookie=${setCookie || '(missing)'}`)
      : fail('POST /api/auth/logout (cookie session)', `Status ${response.status}; Set-Cookie=${setCookie || '(missing)'}`);
  } catch (error) {
    return failure('POST /api/auth/logout (cookie session)', error);
  }
}

async function checkTamperedSave(): Promise<CheckResult> {
  try {
    const token = createTestJwt();
    const response = await fetch(`${BASE_URL}/api/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `aethermoor_auth=${token}`,
      },
      body: JSON.stringify({
        player_json: JSON.stringify({ playerId: 'other-player', name: 'Tamper' }),
        seed_json: JSON.stringify({}),
        messages_json: JSON.stringify([]),
        narrative: 'tamper',
        log_json: JSON.stringify([]),
      }),
    });
    const body = await response.text();
    return response.status === 403
      ? passed('POST /api/save rejects mismatched playerId', `Status ${response.status}; Body=${body}`)
      : fail('POST /api/save rejects mismatched playerId', `Status ${response.status}; Body=${body}`);
  } catch (error) {
    return failure('POST /api/save rejects mismatched playerId', error);
  }
}

async function checkRealLoginFlow(): Promise<CheckResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PASSWORD,
      }),
    });

    const setCookie = response.headers.get('set-cookie') || '';
    return response.status === 200 && setCookie.includes('aethermoor_auth=')
      ? passed('POST /api/auth/login (real credentials)', `Status ${response.status}; cookie=present`)
      : fail('POST /api/auth/login (real credentials)', `Status ${response.status}; cookie=${setCookie ? 'present' : 'missing'}`);
  } catch (error) {
    return failure('POST /api/auth/login (real credentials)', error);
  }
}

function createTestJwt(): string {
  const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');
  return jwt.sign(
    {
      accountId: 'acct-test',
      playerId: 'player-test',
      email: 'test@example.com',
    },
    process.env.JWT_SECRET || 'dev-secret-change-in-production',
    { expiresIn: '90d' }
  );
}

function failure(name: string, error: unknown): CheckResult {
  return fail(name, error instanceof Error ? error.message : 'Unknown error');
}

function passed(name: string, details: string): CheckResult {
  return { name, status: 'pass', details };
}

function fail(name: string, details: string): CheckResult {
  return { name, status: 'fail', details };
}

function blocked(name: string, details: string): CheckResult {
  return { name, status: 'blocked', details };
}

function printResults(results: CheckResult[]) {
  const passedCount = results.filter((result) => result.status === 'pass').length;
  const blockedCount = results.filter((result) => result.status === 'blocked').length;
  console.log(`\nRuntime verification: ${passedCount}/${results.length} passed, ${blockedCount} blocked\n`);
  for (const result of results) {
    const label = result.status === 'pass' ? 'PASS' : result.status === 'blocked' ? 'BLOCK' : 'FAIL';
    console.log(`${label} ${result.name}`);
    console.log(`  ${result.details}`);
  }
}

void main();