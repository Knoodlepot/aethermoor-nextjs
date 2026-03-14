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


## Latest Session Updates (current)
- **ShopScreen sell fixes**: Protected items (faction gifts, rank gear, quest keys) filtered from the sell tab — cannot be sold. Sell prices for tiered gear now use canonical prices (Enchanted Blade 280g → 140g sell) instead of 10g fallback. Shop stock now re-evaluates on level-up so tiered gear appears without travelling.
- **Sell handler protection**: `sell:` short-circuit in `useGameLoop.ts` now rejects protected items before removing from inventory.
- **Deterministic command handlers**: Added short-circuit handlers in `hooks/useGameLoop.ts` for all UI-driven commands that previously sent to narrator but never changed state: `join_faction:`, `decline_faction:`, `rival_faction:`, `buy:`, `sell:`, `equip:`, `unequip:`, `drop:`, `craft:`, `dismiss_quest:`. These now apply state changes immediately without a narrator call.
- **Equip slot fix**: Replaced `getItemSlotEx` in `lib/helpers.ts` with a proper implementation using a static item-to-slot map, TIERED_GEAR lookup, and type-based fallback. Previously all Armour-type items incorrectly resolved to the "offhand" slot; now body armour, helmets, and boots resolve to their correct slots.
- **Faction join**: Joining a faction now grants the correct gift item, applies +50 starting XP to the joined faction, -30 XP to the rival faction, and clears any pending offer.
- **Faction decline**: Declining 2+ factions now correctly triggers The Forgotten's offer. Rival-faction rejections apply a -50 standing penalty.
- **Craft handler**: Validates crafting level, consumes all required ingredients (case-insensitive), produces results, and awards crafting XP.
- **Skill tree fixes (P0)**: Fixed three Tier III skill IDs: Warrior `last_stand` → `unbreakable`; Rogue `phantom` → `ghost_walk`; Cleric `avatar` → `avatar_divine`.
- **Canonical factions (P1)**: Replaced 8 placeholder factions with 10 canonical factions. FACTIONS and FACTION_JOIN_OFFERS exported from `lib/constants.ts`.
- **Tiered gear (P2)**: Added `TIERED_GEAR` constant (13 items, tier 2–4) to `lib/constants.ts`. Updated `generateShopStock` with level-based injection.
- **Faction gear sets (P3)**: Added `FACTION_SETS`, `FACTION_RANK_GEAR`, `CONCEALED_ITEMS`, `PROTECTED_ITEMS` to `lib/constants.ts`.

### Previous Session (2026-03-13)
- Added verify:all script, GitHub Actions for CI, and email gating in dev; production narrator smoke pass complete (5/5)

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
| current | Deterministic command handlers for buy/sell/equip/unequip/drop/craft/join-faction/decline-faction/dismiss-quest; equip slot map fix for body armour, helmets, and boots |
| current-prev | Legacy comparison pass: fixed 3 skill IDs (unbreakable/ghost_walk/avatar_divine), ported 10 canonical factions with rich join offers, added tiered gear shop system, faction gear sets, rank gear, protected/concealed item lists |
| 2026-03-13 | Production narrator smoke pass complete (5/5) and new `verify:narrator` / `verify:narrator:prod` scripts added |
| 2026-03-13 | DB schema migrations applied (9 missing columns across 5 tables); migrateDb() now self-heals on startup; temp scripts removed |
| 2026-03-13 | Full 8/8 runtime verification passed against live Railway DB; patched missing account_id column on players table |
| 2026-03-13 | Updated runtime verifier to use real authenticated cookies for tamper-save checks and classify DB/setup failures as blocked with guidance |
| 2026-03-13 | Improved runtime verifier to auto-load `.env.local` and added ephemeral register/login fallback for real cookie session checks when test credentials are absent |
| 2026-03-13 | Aligned `.env.example` and local checklist with the repo's actual runtime variables and verification prerequisites |
| 2026-03-13 | Added local verification tooling: env checklist, runtime verifier, mock narrator-state harness, and shared server-side narration transition helper |
| 2026-03-13 | Implemented HttpOnly cookie auth sessions across login/register/OAuth/verify and switched protected routes to cookie-aware auth checks; moved tag parse/apply pipeline into `/api/claude` with canonical server persistence |
| 2026-03-13 | Security hardening pass: narrator prompt context now uses canonical server save state; cloud save validates ownership; admin routes moved to header-first secret auth with compatibility fallback |
| 2026-03-13 | Cross-checked MEMORY/CLAUDE/CHANGELOG and documented that `index.html`/`index.hmtl` and `server.js` are legacy references, not active root files |
<!-- Archived session history: see previous versions for full details -->
