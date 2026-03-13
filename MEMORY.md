# Aethermoor - Project Memory
<!--
  HOW TO USE THIS FILE:
  At the start of any new AI session, say:
    "Please read MEMORY.md in the Aethermoor project folder before we start."
  The AI will read this file and have full context to continue work seamlessly.
  Always ask the AI to UPDATE this file when new features are completed.
-->

## Project Overview
AI-powered browser RPG built on Next.js.
- **Game**: https://aethermoor-nextjs.vercel.app/
- **Backend**: Next.js API routes (same deployment)
- **GitHub**: https://github.com/Knoodlepot/aethermoor-game
- **Local files**: `C:\Users\Knoodlepot\Desktop\aethermoor-nextjs\`
- **Legacy file note**: This repo does not use root `index.html` or `server.js`; any mentions are migration references only.

## Quick Start (For New Sessions)
1. Read this file top-to-bottom once.
2. Treat Next.js server routes/runtime as source of truth for secrets and protected logic.
3. Keep player-facing patch notes in `CHANGELOG.md`.
4. Keep this file updated after meaningful implementation changes.

## Key Files
| File | Purpose |
|------|---------|
| `MEMORY.md` | Persistent project context and session history |
| `CHANGELOG.md` | Player-facing patch notes (Keep a Changelog format) |
| `CLAUDE.md` | Standing workflow and architecture instructions |
| `aethermoor-admin-panel.html` | Admin utility panel |
| `aethermoor-support-dashboard.html` | Support dashboard utility |

## User Preferences
- Surgical, minimal changes - do not rewrite working code
- Always read files before editing
- Enter plan mode for non-trivial features and get approval before coding
- Auto-commit Next.js changes after implementation and validation when a git repository is available; no time/date estimates in plans
- Patch notes should be player-facing, game-style (not dev jargon)
- MEMORY.md should stay current so future sessions can continue without drift

---

## Latest Session Updates (2026-03-13)
- **Full 8/8 verification passed**: All runtime security checks pass against live Railway DB — auth, save ownership, cookie session, and ephemeral real-login flow are all confirmed.
- **DB schema patched**: `players` table on Railway was missing `account_id` column (created before migration was added); column added via one-time migration script.
- **Verifier flow hardened**: Runtime verifier now uses real cookie sessions for tamper-save checks and reports DB connectivity/setup issues as blocked checks with actionable hints.
- **Verifier usability improved**: Runtime verifier now auto-loads `.env.local` and can test a real cookie-backed session with ephemeral account registration when `TEST_EMAIL`/`TEST_PASSWORD` are not set.
- **Env template aligned**: `.env.example` now reflects the actual variables used by the current Next.js app, including `NEXT_PUBLIC_URL` and `DISCORD_REDIRECT_URI`, with minimum-vs-optional sections.
- **Verification tooling added**: Added a reusable server-side narration state helper plus manual verification scripts for local runtime auth checks and mock narrator-state testing without Anthropic/Postgres.
- **Local checklist added**: Added a minimal `.env.local` runtime checklist and npm shortcuts for `verify:runtime` and `verify:mock-state`.
- **Cookie session migration**: Auth flows now set/clear HttpOnly auth cookies and protected API routes accept cookie-backed sessions by default.
- **Client token storage removed from active flow**: Frontend auth hooks and account modals now use cookie-authenticated requests instead of localStorage bearer tokens.
- **Server-side tag authority**: `/api/claude` now parses tags, applies state transitions server-side, and persists canonical progression state before returning results.
- **Server-authoritative narrator context**: `/api/claude` now prefers canonical player/world state from cloud save when building narrator system prompts, reducing client-side state tampering impact.
- **Cloud save ownership validation**: `/api/save` now validates JSON payloads and enforces that saved `playerId` matches the authenticated account.
- **Admin auth hardening**: Admin routes now support header-based secrets (`x-admin-secret` or bearer token) and treat URL/body secrets as legacy compatibility paths.
- **Docs alignment pass**: Cross-checked MEMORY.md, CLAUDE.md, and CHANGELOG.md to keep architecture notes consistent.
- **Legacy filename status clarified**: Confirmed no root `index.html`/`index.hmtl` or `server.js` files exist in this Next.js workspace.
- **Memory baseline migrated**: Removed legacy architecture guidance that still described the deprecated monolithic frontend/backend file layout and replaced it with a Next.js-first project overview.
- **URL corrected**: Primary game URL updated to `https://aethermoor-nextjs.vercel.app/`.
- **Legacy references purged**: Removed old line-number maps and instruction blocks tied to the retired legacy file structure.
- **Workflow preference updated**: Replaced the old no-auto-commit rule with an auto-commit preference for Next.js changes (when a git repo is present).
- **Readability pass**: Added a short Quick Start section to speed up handoff and reduce repeated context parsing.

### Previous Session (2026-03-12)
- World Geography and Location Grid, Keeper of the Kiln, `goldChange` tag, Theft RULE, time refinement, max_tokens fix, screener fix, admin panel updates, Email -> Resend, suggestions truncation fix, Player ID button, `repChange` tag.

---

## Active Systems Snapshot
- AI narrator with safety screening and moderation workflow
- Auth and account flows (email/password + OAuth)
- Save/load and progression systems
- Quests, factions, standings, reputation, and wanted/villain tracks
- Combat, dungeon progression, leaderboard, and rewards
- Economy, shop/barter flow, and token-based usage model
- Admin and support tools (separate dashboards)

## Architecture Notes (Current)
- Treat Next.js server runtime and API routes as the source of truth for secrets, provider calls, and protected logic.
- Keep client bundles free of sensitive configuration, provider keys, and internal-only prompt content.
- For any narrator/action tag pipeline changes, update parser, handler, stripping, and prompt rules together so behavior remains consistent.
- Preserve backward compatibility for persisted save state when adding new fields.

## Data and State Notes
- Player state tracks character core stats, progression, inventory, quests, factions, NPC relationships, time, combat state, and meta progression.
- World state tracks travel graph, world events, and long-lived global narrative flags.
- Persisted saves should continue to support migration from older schemas where practical.

## JSON Tag System Reminder
Tags are embedded in narrator prose, parsed by client logic, and stripped from displayed text.
- **Critical**: Any new tag requires end-to-end coverage:
1. Extraction/parsing
2. State handler application
3. Display-strip logic
4. Narrator/prompt rule updates
5. Any new persisted state fields and migration handling

---

## Versioning
- Keep version and patch-note metadata aligned between in-game patch notes and `CHANGELOG.md`.
- Patch notes must remain player-facing.

## Roadmap (High Level)
- Core content expansion (biomes, classes, events)
- Progression depth (skills, companions, endgame loops)
- Stability and scaling (observability, caching, reliability)
- Long-term live-ops features (seasonal content, world events)

---

## Session History (most recent first)
| Session | Work Done |
|---------|-----------|
| 2026-03-13 | Full 8/8 runtime verification passed against live Railway DB; patched missing account_id column on players table |
| 2026-03-13 | Updated runtime verifier to use real authenticated cookies for tamper-save checks and classify DB/setup failures as blocked with guidance |
| 2026-03-13 | Improved runtime verifier to auto-load `.env.local` and added ephemeral register/login fallback for real cookie session checks when test credentials are absent |
| 2026-03-13 | Aligned `.env.example` and local checklist with the repo's actual runtime variables and verification prerequisites |
| 2026-03-13 | Added local verification tooling: env checklist, runtime verifier, mock narrator-state harness, and shared server-side narration transition helper |
| 2026-03-13 | Implemented HttpOnly cookie auth sessions across login/register/OAuth/verify and switched protected routes to cookie-aware auth checks; moved tag parse/apply pipeline into `/api/claude` with canonical server persistence |
| 2026-03-13 | Security hardening pass: narrator prompt context now uses canonical server save state; cloud save validates ownership; admin routes moved to header-first secret auth with compatibility fallback |
| 2026-03-13 | Cross-checked MEMORY/CLAUDE/CHANGELOG and documented that `index.html`/`index.hmtl` and `server.js` are legacy references, not active root files |
| 2026-03-13 | Tidied MEMORY.md for faster scanning; added Quick Start; updated preference to allow auto-commits for Next.js work when git is available |
| 2026-03-13 | Updated MEMORY.md to a Next.js-first baseline; removed deprecated legacy file references and updated game URL |
| 2026-03-13 | Removed dead client narrator block; moved live geography/road/dungeon prompt templates into backend task types; admin auth shifted to header-first session secret checks |
| 2026-03-13 | Security hardening: support dashboard moved behind backend route; admin secret now session-only + header-based (no query-string secrets) |
| 2026-03-12 | Location Grid + World Geography (coord-based routing, all settlements + POIs, harbour flags) |
| 2026-03-12 | Keeper of the Kiln NPC; `goldChange` + `repChange` tags; Theft RULE; time refinement (rest=8h, camp=7h) |
| 2026-03-12 | max_tokens raised; screener fix; suggestions truncation fix; Player ID button |
| 2026-03-12 | Admin: Recently Active, Clear Flags, live changelog; Email -> Resend API |
| 2026-03-11 | Updated title/create UX: Begin Journey box, Load Game slots, Vision presets modal, class detail popups |
| 2026-03-11 | Added `{"remove":{"item":"..."}}` tag support for player-to-NPC item transfers |
| 2026-03-11 | Added yellow/red moderation card system + admin incident visibility/copy support |
| 2026-03-11 | Hardened AI safety filters (pre/post moderation, fallback response, refund on blocked output) |
| 2026-03-11 | Added Redis Phase 1 (optional cache + JWT blocklist check) |
| 2026-03-11 | Travel Matrix - AI-generated locked travel times/geography per new game |
| 2026-03-11 | Merged Claude + Copilot memory files into unified project MEMORY.md |
| 2026-03-11 | Implemented Skill Tree system - 36 skills, 4 classes, 3 tiers each |
| 2026-03-11 | Added Patch Notes screen with Discord webhook posting; created CHANGELOG.md |
| 2026-03-11 | Added 12 enemy variants x 10 base archetypes = 120 bestiary entries |
| Earlier | Implemented Bestiary (kill tracking, UI, server prompt integration) |
| Earlier | Implemented cloud saves (persisted saves, authenticated sync) |
| Earlier | Implemented main quest acts, faction systems, NPC travel, time systems, NG+, death systems |
