/**
 * Integration Tests for Phase 6a API Endpoints
 * POST /api/claude (narrator)
 * GET /api/save (load)
 * POST /api/save (save)
 */

import {
  makeRequest,
  createMockPlayer,
  createMockWorldSeed,
  assertStatus,
  assertHasField,
  assertEqual,
  waitForServer,
  printResults,
  TestResult,
} from './testHelpers';

const results: TestResult[] = [];

/**
 * ============================================================================
 * SETUP: Mock Authentication
 * ============================================================================
 */

// For these manual tests, we'll need valid JWTs
// In a real scenario, you'd register/login first or use a test account
const TEST_JWT =
  process.env.TEST_JWT ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJ0ZXN0LWFjY291bnQtMTIzIiwicGxheWVySWQiOiJ0ZXN0LXBsYXllci0xMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjk5OTk5OTk5OTksImV4cCI6OTk5OTk5OTk5OX0.placeholder';

/**
 * ============================================================================
 * TEST: POST /api/claude — Success Case
 * ============================================================================
 */
async function testClaudeSuccess(): Promise<void> {
  const testName = 'POST /api/claude — Success with valid JWT, messages, tokens';

  try {
    const response = await makeRequest(
      'POST',
      '/api/claude',
      {
        messages: [{ role: 'user', content: 'Hello, narrator!' }],
        systemType: 'NARRATOR',
        playerContext: createMockPlayer(),
        max_tokens: 500,
      },
      TEST_JWT
    );

    const result = assertStatus(response, 200, testName);
    results.push(result);

    if (result.passed) {
      // Verify response contains tokenBalance
      const hasBalance = assertHasField(response.data, 'tokenBalance', `${testName} — has tokenBalance`);
      results.push(hasBalance);
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: POST /api/claude — Auth Failure (No JWT)
 * ============================================================================
 */
async function testClaudeNoAuth(): Promise<void> {
  const testName = 'POST /api/claude — 401 Unauthorized (no JWT)';

  try {
    const response = await makeRequest('POST', '/api/claude', {
      messages: [{ role: 'user', content: 'Hello' }],
    });

    const result = assertStatus(response, 401, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: POST /api/claude — Invalid JWT
 * ============================================================================
 */
async function testClaudeInvalidJwt(): Promise<void> {
  const testName = 'POST /api/claude — 401 Unauthorized (invalid JWT)';

  try {
    const response = await makeRequest(
      'POST',
      '/api/claude',
      {
        messages: [{ role: 'user', content: 'Hello' }],
      },
      'Bearer invalid-token-xyz'
    );

    const result = assertStatus(response, 401, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: POST /api/claude — Missing Messages
 * ============================================================================
 */
async function testClaudeMissingMessages(): Promise<void> {
  const testName = 'POST /api/claude — 400 Bad Request (missing messages)';

  try {
    const response = await makeRequest(
      'POST',
      '/api/claude',
      {
        systemType: 'NARRATOR',
      },
      TEST_JWT
    );

    const result = assertStatus(response, 400, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: POST /api/claude — Empty Messages Array
 * ============================================================================
 */
async function testClaudeEmptyMessages(): Promise<void> {
  const testName = 'POST /api/claude — 400 Bad Request (empty messages array)';

  try {
    const response = await makeRequest(
      'POST',
      '/api/claude',
      {
        messages: [],
        systemType: 'NARRATOR',
      },
      TEST_JWT
    );

    const result = assertStatus(response, 400, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: GET /api/save — Success Case
 * ============================================================================
 */
async function testSaveGetSuccess(): Promise<void> {
  const testName = 'GET /api/save — Success with valid JWT';

  try {
    const response = await makeRequest('GET', '/api/save', undefined, TEST_JWT);

    // Expect either 200 (save exists) or 404 (no save) — both are valid
    const isValid = response.status === 200 || response.status === 404;
    results.push({
      name: testName,
      passed: isValid,
      error: isValid ? undefined : `Expected 200 or 404, got ${response.status}`,
      response: response.data,
    });
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: GET /api/save — Auth Failure (No JWT)
 * ============================================================================
 */
async function testSaveGetNoAuth(): Promise<void> {
  const testName = 'GET /api/save — 401 Unauthorized (no JWT)';

  try {
    const response = await makeRequest('GET', '/api/save');

    const result = assertStatus(response, 401, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: GET /api/save — Invalid JWT
 * ============================================================================
 */
async function testSaveGetInvalidJwt(): Promise<void> {
  const testName = 'GET /api/save — 401 Unauthorized (invalid JWT)';

  try {
    const response = await makeRequest('GET', '/api/save', undefined, 'Bearer bad-token');

    const result = assertStatus(response, 401, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: POST /api/save — Success Case
 * ============================================================================
 */
async function testSavePostSuccess(): Promise<void> {
  const testName = 'POST /api/save — Success with valid JWT and player/seed data';

  try {
    const response = await makeRequest(
      'POST',
      '/api/save',
      {
        player_json: JSON.stringify(createMockPlayer()),
        seed_json: JSON.stringify(createMockWorldSeed()),
        messages_json: JSON.stringify([]),
        narrative: 'Test narrative',
        log_json: JSON.stringify([]),
      },
      TEST_JWT
    );

    const result = assertStatus(response, 200, testName);
    results.push(result);

    if (result.passed) {
      const hasOk = assertHasField(response.data, 'ok', `${testName} — has ok: true`);
      results.push(hasOk);
    }
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: POST /api/save — Auth Failure (No JWT)
 * ============================================================================
 */
async function testSavePostNoAuth(): Promise<void> {
  const testName = 'POST /api/save — 401 Unauthorized (no JWT)';

  try {
    const response = await makeRequest('POST', '/api/save', {
      player_json: JSON.stringify(createMockPlayer()),
      seed_json: JSON.stringify(createMockWorldSeed()),
    });

    const result = assertStatus(response, 401, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: POST /api/save — Missing player_json
 * ============================================================================
 */
async function testSavePostMissingPlayerJson(): Promise<void> {
  const testName = 'POST /api/save — 400 Bad Request (missing player_json)';

  try {
    const response = await makeRequest(
      'POST',
      '/api/save',
      {
        seed_json: JSON.stringify(createMockWorldSeed()),
      },
      TEST_JWT
    );

    const result = assertStatus(response, 400, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: POST /api/save — Missing seed_json
 * ============================================================================
 */
async function testSavePostMissingSeedJson(): Promise<void> {
  const testName = 'POST /api/save — 400 Bad Request (missing seed_json)';

  try {
    const response = await makeRequest(
      'POST',
      '/api/save',
      {
        player_json: JSON.stringify(createMockPlayer()),
      },
      TEST_JWT
    );

    const result = assertStatus(response, 400, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * TEST: POST /api/save — Invalid JWT
 * ============================================================================
 */
async function testSavePostInvalidJwt(): Promise<void> {
  const testName = 'POST /api/save — 401 Unauthorized (invalid JWT)';

  try {
    const response = await makeRequest(
      'POST',
      '/api/save',
      {
        player_json: JSON.stringify(createMockPlayer()),
        seed_json: JSON.stringify(createMockWorldSeed()),
      },
      'Bearer invalid'
    );

    const result = assertStatus(response, 401, testName);
    results.push(result);
  } catch (error: any) {
    results.push({
      name: testName,
      passed: false,
      error: error.message,
    });
  }
}

/**
 * ============================================================================
 * MAIN TEST RUNNER
 * ============================================================================
 */
async function runAllTests(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('Phase 6a API Endpoint Integration Tests');
  console.log('='.repeat(60) + '\n');

  // Wait for dev server
  console.log('Checking dev server availability...');
  const serverReady = await waitForServer();

  if (!serverReady) {
    console.error(
      'ERROR: Dev server not ready. Please run "npm run dev" in another terminal.'
    );
    process.exit(1);
  }

  console.log('\nRunning tests...\n');

  // POST /api/claude tests
  console.log('--- POST /api/claude Tests ---');
  await testClaudeSuccess();
  await testClaudeNoAuth();
  await testClaudeInvalidJwt();
  await testClaudeMissingMessages();
  await testClaudeEmptyMessages();

  // GET /api/save tests
  console.log('--- GET /api/save Tests ---');
  await testSaveGetSuccess();
  await testSaveGetNoAuth();
  await testSaveGetInvalidJwt();

  // POST /api/save tests
  console.log('--- POST /api/save Tests ---');
  await testSavePostSuccess();
  await testSavePostNoAuth();
  await testSavePostMissingPlayerJson();
  await testSavePostMissingSeedJson();
  await testSavePostInvalidJwt();

  // Print results
  printResults(results);

  // Exit with appropriate code
  const failed = results.filter((r) => !r.passed).length;
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
