# GitHub Project Board — Cross-Reference

Cross-referenced against `CHANGELOG.md` and `MEMORY.md` as of 2026-03-22.

---

## Needs Closing (done in Next.js, still open on board)

| # | Title | Evidence |
|---|-------|----------|
| 14 | Dungeon biome variety | Done today — 7 biomes, hazards, 35 exclusive enemies |
| 17 | Skill trees | Done in v0.3.0 — 4 classes × 9 skills, tier unlock, narrator-aware |
| 20 | Bestiary | Done — full UI, dungeon tab, total count, locked entries |

---

## Partially Done

| # | Title | What's done | What's missing |
|---|-------|-------------|----------------|
| 4 | 1.3 Dungeon System | Biomes, floors, descent, cooldown, 35 exclusive enemies | Dungeon leaderboard (deepest floor) |
| 5 | 1.4 Combat System | Narrator-driven combat, status effects, XP/gold/event log | No standalone combat log panel; all mechanical resolution is in prose |
| 7 | 1.6 Quest System | Main quest, side quests, faction quests, quest log, done/fail states | Issue note says "change it a little" — unclear what's wanted |
| 8 | 1.7 Inventory & Economy | Inventory, shop, gold, selling, Phoenix Feather, herb gathering | Crafting exists but needs more recipes; no item weight/encumbrance |
| 9 | 1.8 Accessibility & Presentation | 5 colorblind-safe themes, mobile layout, toast system | Issue note says "might have to change these" — themes may need revision |
| 15 | Crafting system | Recipes defined in constants.ts, CraftingScreen UI exists, works end-to-end | Needs more recipes; no smithing without a town smithy enforced |
| 23 | Phase 1 — Launch Ready | Visual map done, biomes done, crafting partial | Content marketing, playtest feedback loop (non-code) |
| 24 | Phase 2 — Growth | Skill trees done, faction system done | Companion system, achievements, sound design, mobile app wrapper |
| 25 | Phase 3 — Stability & Scale | Server-side saves done, session management done, rate limiting done | Cost monitoring dashboard, caching layer |

---

## Not Started

| # | Title | Notes |
|---|-------|-------|
| 16 | Companion system | Referenced in class abilities but no tracking, recruitment, or stat system |
| 19 | Sound design | No audio at all — ambient loops, UI sounds |
| 21 | Achievements | No system — many natural milestones exist (first kill, first dungeon, NG+) |
| 26 | Phase 4 — Long-Term Vision | Custom domain, multiplayer hints, modding, seasonal events, standalone app |
| 27 | DLC & Expansion Ideas | Planning only |
| 28 | 4.1 World Expansions | Frozen North, Sunken Coast, Undercity etc. — planning only |
| 29 | 4.2 Class & Character Expansions | Summoner, Bard, Necromancer, prestige classes — planning only |
| 30 | 4.3 Story Expansions | DLC questlines — planning only |
| 31 | 4.4 Cosmetic & QoL DLCs | Themes pack, voice packs, portraits — sound design is the prerequisite |
| 32 | Discord & Patreon Guide | Channel structure + roles defined — not yet set up |
| 42 | Sign in with Apple | Needed for iOS App Store; phase 4 prereq |

---

## Lore Documents (open, no code — keep for reference)

| # | Title | Status |
|---|-------|--------|
| 33 | 1. The World | Partially fed into narrator prompt (geography, roads, biomes). Lore gaps remain. |
| 34 | 3. People & Races | NPC name pool done (160+ names). Race/society lore not in narrator. |
| 35 | 4. Factions | 4 factions playable. Lore doc has more factions not yet implemented. |
| 36 | 5. Magic & Religion | Magic exists via narrator + skills. Gods/pantheon not formalised in prompt. |
| 37 | 6. The Main Quest | 6-act structure in narrator prompt. Acts 4–6 lore not fully written. |
| 38 | 7. The Dungeon of Echoes | Biomes + enemies now done. Origins/boss lore not yet in narrator. |
| 39 | 8. Language & Flavour | Not in narrator. Would go into narrator system prompt as style rules. |
| 40 | Progress Summary | Meta tracking issue — can be closed once board is tidy. |

---

## Stale / Should Be Removed

| # | Title | Reason |
|---|-------|--------|
| 3 | Change | Too vague ("make the world more organic"). Absorbed by existing world generation work and lore docs #33–35. Close or rewrite with a specific goal. |
| 12 | 1.11 Infrastructure | Describes the old GitHub Pages + Railway setup. The game is on Vercel + Railway now. Content is obsolete. Close and replace if needed. |

---

## Suggested Priority Order (next sessions)

1. **Dungeon leaderboard** (#4 remainder) — low effort, high player motivation
2. **Achievements** (#21) — many hooks already exist; just needs a system + UI
3. **Companion system** (#16) — high impact for gameplay depth
4. **Lore: Language & Flavour** (#39) — low effort (narrator prompt addition), high narrative quality gain
5. **Sound design** (#19) — larger lift; unlocks #31 DLC tier
