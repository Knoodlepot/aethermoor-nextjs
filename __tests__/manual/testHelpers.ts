/**
 * Integration Test Helpers
 * Manual test utilities for endpoint validation
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  response?: any;
}

export interface TestOptions {
  verbose?: boolean;
  timeout?: number;
}

/**
 * Make authenticated HTTP request
 */
export async function makeRequest(
  method: string,
  path: string,
  body?: any,
  token?: string,
  options: TestOptions = {}
): Promise<{ status: number; data: any; headers: Headers }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path}`;
  const timeout = options.timeout || 10000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, headers: response.headers };
  } catch (error: any) {
    throw new Error(`Request failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Create mock player data
 */
export function createMockPlayer(overrides: any = {}) {
  return {
    name: 'TestAdventurer',
    class: 'warrior',
    level: 1,
    xp: 0,
    hp: 20,
    maxHp: 20,
    gold: 100,
    inventory: [],
    location: 'Amberhold Capital',
    reputation: 0,
    statPoints: 0,
    str: 10,
    agi: 10,
    int: 10,
    wil: 10,
    ...overrides,
  };
}

/**
 * Create mock world seed
 */
export function createMockWorldSeed(overrides: any = {}) {
  return {
    seed: 12345,
    startingLocation: 'Amberhold Capital',
    mainQuestActSeen: [1],
    currentAct: 1,
    mainQuestComplete: false,
    questTitle: 'The Road North',
    settlements: [],
    worldEvents: {},
    travelMatrix: {},
    villainAllied: false,
    ...overrides,
  };
}

/**
 * Assert status code
 */
export function assertStatus(
  result: { status: number; data: any },
  expectedStatus: number,
  testName: string
): TestResult {
  if (result.status === expectedStatus) {
    return { name: testName, passed: true, response: result.data };
  }

  return {
    name: testName,
    passed: false,
    error: `Expected status ${expectedStatus}, got ${result.status}. Response: ${JSON.stringify(result.data).slice(0, 200)}`,
    response: result.data,
  };
}

/**
 * Assert response field exists
 */
export function assertHasField(
  data: any,
  field: string,
  testName: string
): TestResult {
  if (field in data) {
    return { name: testName, passed: true, response: data };
  }

  return {
    name: testName,
    passed: false,
    error: `Expected field '${field}' in response: ${JSON.stringify(data).slice(0, 200)}`,
    response: data,
  };
}

/**
 * Assert response field value
 */
export function assertEqual(
  actual: any,
  expected: any,
  testName: string
): TestResult {
  if (actual === expected) {
    return { name: testName, passed: true };
  }

  return {
    name: testName,
    passed: false,
    error: `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  };
}

/**
 * Wait for dev server to be ready
 */
export async function waitForServer(maxAttempts: number = 30): Promise<boolean> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`, { method: 'GET' });
      if (response.ok) {
        console.log('✓ Dev server is ready');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * Print test results
 */
export function printResults(results: TestResult[]): void {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n' + '='.repeat(60));
  console.log(`RESULTS: ${passed}/${results.length} passed, ${failed} failed`);
  console.log('='.repeat(60));

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('='.repeat(60) + '\n');
}
