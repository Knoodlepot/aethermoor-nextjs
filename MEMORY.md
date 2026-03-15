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


## Latest Session Updates
- **Bestiary tag pipeline**: Fully implemented. Narrator now emits `{"bestiary":{"archetypeId":"...","name":"...","icon":"...","tier":1}}` on every kill. `lib/tagParsers.ts` has `extractBestiaryTag()`, `ParsedTags.bestiary`, `parseAllTags` entry, `processParsedTags` handler (upserts by `archetypeId`, increments `timesKilled`, sets `firstKilledDay`/`lastKilledDay`). `stripContextTag` regex added. `app/api/claude/route.ts` narrator rule added after XP rule.
- **Map worldSeed migration**: Old saves missing `travelMatrix.routes` now auto-migrate on load. `migrateWorldSeed()` in `lib/worldgen.ts` re-runs world generation without replacing quest/narrative data.
- **Seed string recovery**: `useStorage.ts` persists `worldSeed.seed` separately as `rpg-seed-str-slot{n}`.
- **MapView React key fix**: Falls back to `questTitle` instead of `’no-seed’` for stable remounting.
- **Canonical state contamination fixes**: New game `finalPlayer`/`finalSeed` merges lock identity fields; cloud save awaited before narrator call.
- **Organic terrain**: MapView uses bezier blob shapes for terrain patches instead of rectangles.
- **Shop context guard**: `buy:`/`sell:` handlers require `context === ‘town’ || ‘npc’`.
- **DB SSL fix**: `lib/db.ts` always uses `ssl: { rejectUnauthorized: false }`.

| Date       | Summary                                                      |
|------------|--------------------------------------------------------------|
| 2026-03-15 | Bestiary kill tracking pipeline (narrator rule + full tag pipeline) |
| 2026-03-15 | Map worldSeed migration, seed string recovery, MapView key fix, DB SSL fix, canonical state fixes, organic terrain, shop context guard |

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
- **XP and Level-Up System**: XP now granted on enemy kills and quest completions via `{"xpGain":N}` narrator tag. Level-up applies class-specific maxHp gains, +3 statPoints, +1 skillPoints per level.
  - `lib/helpers.ts`: Added `XP_TABLE` (20 levels), `xpToLevel(xp)`, `HP_PER_LEVEL` record (Warrior:10, Cleric:7, Rogue:5, Mage:3)
  - `lib/types.ts`: Added `skillPoints: number` to Player interface
  - `lib/tagParsers.ts`: Added `extractXpGainTag`, `xpGain` in ParsedTags, wired into `parseAllTags`, level-up logic in `processParsedTags`, strip regex in `stripContextTag`
  - `app/api/claude/route.ts`: Narrator rule to emit `{"xpGain":N}` on kills/quest completions (tiered: minion 15–25, standard 30–50, tough 60–90, elite 100–140, boss 200–350)
  - `hooks/useGameLoop.ts`: Level-up detection (compare level before/after narrator call); calls `ui.setLevelUpMsg` if leveled up
  - `lib/worldgen.ts`, test helpers: Added `skillPoints: 0` to new player objects

- **Enemy Level Scaling**: Enemies now scale with player level. New `buildEnemyScalingBlock(level)` function computes concrete HP and damage for 5 enemy tiers and injects them into the narrator system prompt alongside player stat rules.
  - Minion (wolves, cultists): baseHp 20, baseStr 4 — scales +5 HP and +1 dmg per 2 levels
  - Standard (bandits, skeletons): baseHp 28, baseStr 5
  - Tough (zombies, soldiers, beasts): baseHp 40, baseStr 7
  - Elite (drakes, assassins): baseHp 60, baseStr 9
  - Boss (named/dungeon lords): baseHp 80, baseStr 10
  - Veteran/named prefix = ×1.4; Boss tier = ×2. Narrator told to announce bloodied state (≤30% HP) and not one-shot from full health.
  - Base values match `ENEMY_ARCHETYPES` in `lib/constants.ts`.

- **Permadeath Death Screen**: When a player's HP hits 0, a fullscreen death screen replaces the game.
  - `components/screens/DeathScreen.tsx`: Dark gothic screen with 10 random tragic verse endings, the final narrator prose excerpt (what killed them), character obituary (name/class/level/day survived), and a "Begin Anew" button.
  - `hooks/useUI.ts`: Added `'death'` ScreenType, `deathInfo` state, `showDeathScreen()` method.
  - `hooks/useGameLoop.ts`: On hp ≤ 0, gravestone is saved then the save is wiped (permadeath — no respawn). `ui.showDeathScreen()` is triggered with character info.
  - `components/GameView.tsx`: Renders `DeathScreen` when `ui.screen === 'death'`; Begin Anew routes to `/game?new=1`.

- **Combat HP Loss Fixed**: Players now actually lose HP in combat. The `hpChange` tag was completely absent from the codebase — damage was described in prose only, never applied to state.
  - `lib/tagParsers.ts`: Added `extractHpChangeTag`, `hpChange: number | null` to `ParsedTags`, wired into `parseAllTags`, handler in `processParsedTags` (clamps to [0, maxHp]), strip regex in `stripContextTag`.
  - `app/api/claude/route.ts`: Narrator now instructed to emit `{"hpChange":-N}` when player takes damage and `{"hpChange":N}` when healed by potion/rest/magic.


- **Status Effects Expansion**:Added 6 new status effects (fearful, bleeding, cursed, blinded, weakened, chilled) alongside the existing 3 (poisoned, burning, stunned). Total: 9 status effects.
  - `STATUS_EFFECTS` constant in `lib/constants.ts` — single source of truth for all 9 effects with icon, label, description, and cure text.
  - `statusEffects?: string[]` added to the `Player` type — effects now persist in saves.
  - New `{"playerStatus":{"add":"X"}}` / `{"playerStatus":{"remove":"X"}}` narrator tag, wired end-to-end through `tagParsers.ts` / `processParsedTags` / `applyNarrationState`.
  - `CombatPanel`: replaced hardcoded emoji map with `StatusBadge` component; hovering any effect badge shows a tooltip with description and cure method.
  - `useGameLoop`: `clearStatus` array now correctly applied when using cure consumables; `ui.setPlayerStatusEffects` synced after narrator response and consumable use (was previously never set).
  - New cure consumables in `CONSUMABLE_EFFECTS`: Bandage (bleeding), Courage Draught (fearful), Purification Charm (cursed), Eyewash (blinded), Warming Draught (chilled), Tonic of Might (weakened).
  - Narrator prompt: STATUS EFFECT RULES block — per-effect triggers, WIL/fear immunity rules (WIL 8+ immune to fearful), cure methods, and guard rules.
  - Fear was already referenced in WIL stat rules but had no corresponding effect — now fully wired.

- **Comprehensive Legal Pages**: Full rewrite of `app/legal/page.tsx` and `Legacy-legal.html`.
  - Nav changed from scroll-anchors to proper tab switching — active tab highlighted gold, other sections hidden.
  - **Terms of Service**: full clauses (eligibility, accounts, virtual currency, acceptable use, IP, UGC, service changes, liability, dispute resolution) + per-jurisdiction provisions covering UK (CRA 2015, CCR 2013, Online Safety Act), EU (CRD, Digital Content Directive, DSA), US (COPPA, CFAA, CCPA, CLRA), Canada (LPCQ, CASL, PIPEDA), Australia/NZ (ACL, CGA), Brazil/LATAM (CDC, Marco Civil, Law 24.240, PROFECO, Law 1480, Law 19.496), Asia-Pacific (Japan, South Korea, China, Singapore, India, Thailand + Malaysia/Philippines/Indonesia/Vietnam), Africa (ECT Act, CPA 68/2008, POPIA, Kenya DPA, FCCPA, NDPA, Ghana CPA Act).
  - **Privacy Policy**: data controller statement, data collected, lawful bases, processor list (Vercel/Railway/Anthropic/Resend), retention, international transfer safeguards (SCCs, adequacy decisions), and per-jurisdiction rights for every major regime: UK GDPR/DPA 2018 (ICO), GDPR (national DPAs), CCPA/CPRA + US state laws, PIPEDA/Quebec Law 25, APPs/OAIC, LGPD/ANPD, PIPL/APPI/PIPA/PDPA/DPDP Act/Thailand PDPA, POPIA/Kenya DPA/NDPA/Ghana Act 843.
  - **Refund Policy**: always-applies guarantees (billing error, duplicate charge, failed delivery, fraud), chargeback section; statutory rights by region — UK 14-day CCR + CRA 2015, EU 14-day CRD + 2-year conformity period, US CLRA/state law/FTC, Canada by province, Australia ACL major/minor failure, NZ CGA, Brazil 7-day CDC cooling-off + Argentina/Mexico/Colombia/Chile, Asia-Pacific (Japan/South Korea 7-day/China 7-day/Singapore/India/Thailand), Africa (SA CPA 6-month warranty/Kenya/Nigeria/Ghana).

- **Three Save Slots**: Players now have 3 named save slots.
  - DB: `game_saves` migrated to composite PK `(player_id, slot)`; `migrateDb()` self-heals existing installs (adds `slot` column, re-keys constraint).
  - API `/api/save`: `?slot=` for single slot load; `?slots=all` for a summary of all 3; `slot` in POST body.
  - `useStorage`: slot-aware with `currentSlot`/`setCurrentSlot`, `loadSlots()`, backward-compat localStorage keys.
  - `SaveSlotModal`: shows all 3 slots (name, class, level, location, date); overwrite-confirm for non-current slots.
  - `GameView`: Save button opens slot picker; `?slot=` URL param selects active slot on load.
  - Main menu Load Game opens slot picker before navigating.

- **Token System UI**: Ported the full token system UI from legacy to Next.js.
  - Toolbar now shows a live 🪙 token balance with 4-tier color coding (green → gold → orange → red) and a pulse animation when critically low (≤10). Clicking it opens the Token Shop.
  - New `TokenShopScreen` — 6 purchase packages (Starter 100/£1 → Immortal 8500/£49.99). Calls `/api/tokens/buy`, redirects to Stripe Checkout. Shows payment success banner on return (`?payment=success`).
  - New `OutOfTokensScreen` — fullscreen takeover when tokens run out ("YOUR TOKENS ARE SPENT"). Buy Tokens button opens shop; Return to Title sends back to home.
  - `useGameLoop` now detects `no_tokens` error from `/api/claude` and triggers `ui.setScreen('out_of_tokens')` automatically.
  - `useUI` gains `showTokenShop` modal flag.
  - Files added: `components/screens/OutOfTokensScreen.tsx`, `components/screens/TokenShopScreen.tsx`. Files modified: `hooks/useUI.ts`, `hooks/useGameLoop.ts`, `components/GameView.tsx`.

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
| current | Status effects expanded: fearful, bleeding, cursed, blinded, weakened, chilled added; playerStatus tag; CombatPanel tooltips; clearStatus consumable wiring |
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
