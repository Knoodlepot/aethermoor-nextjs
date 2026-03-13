# Local Runtime Checklist

Use this when you want to verify the security hardening locally.

## Minimal .env.local Checklist

Create `.env.local` in the project root with at least these values:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-32-plus-character-secret
SESSION_SECRET=replace-with-32-plus-character-secret
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_URL=http://localhost:3000
```

This minimum is enough for:

- cookie/session auth verification
- protected-route auth rejection checks
- save ownership/tamper checks

Add this as well if you want real narrator turns to work:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

Optional for broader coverage:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@example.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
REDIS_URL=redis://localhost:6379
```

## Start The App

```powershell
npm run dev
```

## Runtime Verification Scripts

Partial runtime verification against a live local server:

```powershell
npx tsx __tests__/manual/verifyRuntime.ts
```

Server-side narrator state transition harness without Anthropic or Postgres:

```powershell
npx tsx __tests__/manual/mockClaudeStateHarness.ts
```

## Optional End-To-End Session Test Inputs

Set these before running the runtime verifier if you want it to test a real login:

```powershell
$env:TEST_EMAIL = "your-test-account@example.com"
$env:TEST_PASSWORD = "your-test-password"
```

With those set, the runtime verifier can additionally confirm:

- login returns `200`
- auth cookie is issued on successful login

## Expected Outcomes

- Public health route returns `200`
- Anonymous protected routes return `401`
- Cookie-based logout returns `200` and clears `aethermoor_auth`
- Tampered save payload with mismatched `playerId` returns `403`
- Mock state harness reports item grant, gold change, context, and suggestions applied server-side

## Notes

- The runtime verifier intentionally degrades gracefully if required env vars are missing.
- The mock harness reuses the same shared server-side state transition helper used by `/api/claude`.