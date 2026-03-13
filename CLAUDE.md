# Aethermoor Next.js — Claude Standing Instructions

## Read First
Read `MEMORY.md` in the memory folder before starting any work. It contains full project context, architecture, line numbers, and session history. Do not rely on assumptions — always read files before editing them.

## Project Summary
AI-powered browser RPG. Next.js full-stack app (React frontend + Node backend unified). Deployed via Vercel + Railway (PostgreSQL). Source: `/c/Users/Knoodlepot/Desktop/aethermoor-nextjs`.

## Mandatory After Every Session
After completing any significant feature, fix, or change — **always update both**:

1. **`MEMORY.md`** (memory folder) — update "Latest Session Updates" and "Session History" table. Keep it accurate so future sessions have correct context.

2. **`CHANGELOG.md`** (Next.js root) — add entries to the `## [Unreleased]` section. Write in **player-facing language** (not dev jargon). Format: `### Added / ### Changed / ### Fixed`.

Do this without being asked. If the session only involved discussion (no code changes), skip the CHANGELOG but still note anything important in MEMORY.md.

## Key Rules
- Always enter plan mode for non-trivial features and get approval before coding
- Always read a file before editing it
- **Auto-commit and auto-push to GitHub after code changes** — no manual git needed
- No emojis in responses unless the user asks
- Concise responses
- No time/date estimates
- Patch notes must be player-facing, not developer jargon

## Architecture Reminders
- Server: `app/api/claude/route.ts` handles narrator AI calls with full `buildNarratorSystem()` logic
- Database: PostgreSQL on Railway with 8 tables (accounts, players, game_saves, etc.)
- Tags: Same JSON tag system as legacy code — extract, parse, handle, strip
- Player state: stored in DB (game_saves) on cloud save; localStorage fallback for demo
- Theme: 5 colorblind-safe themes via ThemeContext in `components/providers/ThemeProvider.tsx`
- Legacy naming note: there is no active root `index.html`/`index.hmtl` or `server.js` in this repo; treat mentions as migration/history references only.
