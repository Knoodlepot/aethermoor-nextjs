# Aethermoor - Project Memory
<!--
  HOW TO USE THIS FILE:
  At the start of any new AI session, say:
    "Please read MEMORY.md in the Aethermoor project folder before we start."
  The AI will read this file and have full context to continue work seamlessly.
  Always ask the AI to UPDATE this file when new features are completed.
-->

## !! AUTO-COMMIT RULE — READ THIS FIRST !!
After **every** code change, automatically run:
```
git add -A && git commit -m "<short description of change>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" && git push
```
Do this without being asked. Never leave the user to commit manually.

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
- **Mini Map**: New `MiniMap` component in right sidebar, below Side Quest Panel, filling the previously empty space.
  - Renders the world map as a compact ~178px tall canvas (uses existing `MapView inline` prop — no side panels, no zoom controls, no travel popup).
  - Gold "WORLD MAP" label above; subtle hover border/glow.
  - Clicking anywhere on it opens the full Map screen (`ui.setMapOpen(true)`).
  - Only 2 files changed: new `components/ui/MiniMap.tsx`, minor addition to `components/GameView.tsx`.

- **Side Quest Panel**: New `SideQuestPanel` component sits below `MainQuestPanel` in the right sidebar.
  - Shows up to 5 tracked active quests (side, faction, contract types all included).
  - Empty state displays flavour text: "No roads taken yet, wanderer..."
  - Each row: truncated title (click → opens Quest Log pre-expanded on that quest), track toggle (👁 eye icon), give-up button (✕ with confirm step).
  - If >5 tracked quests, shows "+N more — view all" link to open the log.
- **Quest Log: Main Quest tab**: First tab in QuestLogScreen shows an act-by-act narrative timeline.
  - Acts I–V with dot/line visual, completed/in-progress/locked states.
  - Each completed act shows a summary sentence; current act shows objective hint.
  - Villain revealed at Act II+, ally revealed when `allyRevealed`, betrayal noted.
  - Victory banner at completion.
  - Data sourced entirely from `worldSeed` — no new storage needed.
- **Quest Log: Faction tab**: Dedicated tab listing active faction quests grouped by faction name.
  - Same track toggle and give-up button as Side tab.
  - Side tab now shows only `side`/`contract` quests; faction quests moved to Faction tab.
- **Track toggle system**: New `tracked?: boolean` field on `Quest` (defaults true for backward compat).
  - Toggled via deterministic `toggle_quest_track:<id>` handler in `useGameLoop.ts`.
  - Untracked quests stay in Quest Log but vanish from the sidebar panel.
- **Abandon quest**: Deterministic `abandon_quest:<id>` handler sets quest to `failed` status with no narrator call. Confirm step prevents accidental clicks.
- **Quest Log deep-link**: `useUI` now has `questLogInitialId`, `openQuestLogAt(id)`, `clearQuestLogInitialId()` so the sidebar can open the log pre-scrolled to a specific quest.

### Previous Session
- **Character creation screen**: Pressing New Game now shows a "Forge Your Hero" screen before entering the world.
  - Players enter their name, select a class (Warrior, Rogue, Mage, Cleric) from a 2×2 grid with stats displayed.
  - A "ℹ Class Details" button opens ClassInfoModal for full class info.
  - On submit: world is generated procedurally, narrator delivers an opening scene, save is created.
  - New file `lib/worldgen.ts` — full port of world/quest generation from legacy: `generateProceduralWorld`, `buildTravelMatrix`, `generateMainQuestSeed`, `generateWorldSeed`, `initFactionStandings`, `initLocationStandings`, `INIT_PLAYER`.
  - New file `components/screens/CharacterCreationScreen.tsx` — the "Forge Your Hero" UI.
  - `GameView.tsx` now gates on `isLoaded && !player` to show `CharacterCreationScreen`.

### Previous Session
- **Fast travel system**: Players can open the map and click any previously-visited location in the left panel to fast-travel there.
  - Travel popup shows method options: On Foot (free), Your Horse (free if mounted) / Hire Horse (15g), River Barge (if both nodes have river access), Sea Vessel (if both have harbour).
  - Travel time is calculated from locationGrid coordinates (distance × 1.5h foot; horse 2.5× faster, barge 3×, boat 4×).
  - `fast_travel:<dest>:<method>:<cost>` is a deterministic command handler in `useGameLoop.ts` — no narrator call.
  - Validates: enough gold, not in combat/dungeon, not already at destination.
  - Deducts gold, advances `gameHour`/`gameDay` by calculated hours, sets `location`, adds to `exploredLocations`, sets `context = 'explore'`, saves.
- **Mount slot**: New `mount` equip slot added to `EQUIP_SLOTS`. `Horse` item added to `ITEM_INFO` (type: Mount).
  - `getItemSlotEx` in `helpers.ts` now handles `Mount` type → `mount` slot.
  - InventoryScreen auto-renders the mount slot (reads from `EQUIP_SLOTS`).
  - Narrator HORSE RULE: when player buys/acquires a horse, emit `{"grant":{"item":"Horse"}}`.
- **MapView left panel**: Modal map view now shows a 200px scrollable left panel listing explored locations; click → travel popup below the canvas.
- **Farm POI system**, **legacy map style**, **ContextBar travel/dungeon/poi/farm contexts**, **player card two-column layout** all completed in prior sub-sessions.

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
| current | Mini Map in right sidebar below Side Quest Panel — click to open full map |
| current-prev | Side Quest Panel in right sidebar; Main Quest tab in Quest Log (act timeline); Faction quest tab; track toggle on all quests; abandon quest with confirm |
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
