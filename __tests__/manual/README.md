# Phase 6a API Endpoint Integration Tests

Manual integration tests for the three core Phase 6a API endpoints:
- `POST /api/claude` — Narrator AI endpoint
- `GET /api/save` — Load game save
- `POST /api/save` — Save game state

## Prerequisites

1. **Dev server running**: `npm run dev` in the project root
2. **Database ready**: PostgreSQL on Railway with proper schema
3. **Valid JWT token** (optional): Set `TEST_JWT` environment variable, or edit testEndpoints.ts

## How to Run

### Option 1: Using tsx (recommended)

```bash
# Install tsx globally or as dev dependency
npm install --save-dev tsx

# Run tests
npx tsx __tests__/manual/testEndpoints.ts
```

### Option 2: Using ts-node

```bash
# Install ts-node globally or as dev dependency
npm install --save-dev ts-node

# Run tests
npx ts-node __tests__/manual/testEndpoints.ts
```

### Option 3: Using bun (if installed)

```bash
bun run __tests__/manual/testEndpoints.ts
```

## Environment Variables

Set these to customize test behavior:

```bash
TEST_BASE_URL="http://localhost:3000"  # Default
TEST_JWT="eyJhbGc..."                   # Valid JWT token (optional)
```

## Test Coverage

### POST /api/claude (7 tests)

- ✅ **Success case**: Valid JWT, messages, sufficient tokens → 200
- ❌ **No JWT**: Missing auth header → 401
- ❌ **Invalid JWT**: Bad token format → 401
- ❌ **Missing messages**: Empty body → 400
- ❌ **Empty messages**: Empty array → 400
- (TODO) Rate limit: 10+ calls/min → 429
- (TODO) No tokens: Balance = 0 → 402

### GET /api/save (3 tests)

- ✅ **Success**: Valid JWT → 200 or 404 (depending on save exists)
- ❌ **No JWT**: Missing auth header → 401
- ❌ **Invalid JWT**: Bad token → 401

### POST /api/save (5 tests)

- ✅ **Success**: Valid JWT + player_json + seed_json → 200 { ok: true }
- ❌ **No JWT**: Missing auth header → 401
- ❌ **Missing player_json**: Only seed_json → 400
- ❌ **Missing seed_json**: Only player_json → 400
- ❌ **Invalid JWT**: Bad token → 401

## Reading Results

Test output format:

```
============================================================
RESULTS: 12/15 passed, 3 failed
============================================================
✅ POST /api/claude — Success with valid JWT...
✅ POST /api/claude — 401 Unauthorized (no JWT)
❌ POST /api/claude — Rate limit exceeded
   Error: Expected status 429, got 503
...
============================================================
```

Green checkmarks (✅) = PASSED
Red X marks (❌) = FAILED

## Troubleshooting

### "Dev server not ready"

Make sure the dev server is running in another terminal:

```bash
npm run dev
```

### "Invalid JWT"

If tests fail with 401 on valid requests, check:
1. JWT_SECRET matches between client and server
2. Token has not expired
3. payloads.json is correctly formatted

### "No token balance"

Ensure the test player has tokens:
1. Create test account via `/api/auth/register`
2. Add tokens via `/api/admin/tokens` (if available)
3. Or buy tokens via Stripe

## Notes

- Tests are NOT isolated — they run sequentially against a shared dev server
- No automatic cleanup (removes test saves from database)
- Rate limit tests (429) require multiple rapid calls — run manually if needed
- Token refund tests require simulated Anthropic API errors
