# Changelog

All notable changes to Aethermoor are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Ten canonical factions now appear in the Standings screen with full lore, rank abilities, and rival relationships: The Iron Conclave, The Shadowmere Guild, The Ember Circle, The Silver Hand, The Thornwood Druids, The Merchant's Compact, The Crown's Watch, The Forgotten, The Arcane Academy, and The Sea Wolves.
- Faction join offers now feature rich narrative pitches unique to each faction, including special dialogue for The Forgotten when you have already refused other factions.
- Faction gear sets: equipping two or three matching faction pieces now unlocks powerful set bonuses and faction abilities.
- Faction rank rewards: reaching rank 3 or 4 with a faction now unlocks exclusive gear tied to that faction.
- Level-gated shop gear: shops now stock tiered equipment based on your character level. Steel-tier items appear at level 5, Enchanted-tier at level 10 (in cities), and Masterwork-tier at level 15 (in capital cities).
- Skill tree updates: several Tier III skills now explicitly let the narrator notice and respond to your mastery — Unbreakable, Ghost Walk, Avatar of Light, Warlord's Presence, Resurrection Light, and Berserker Rage.

### Fixed
- Warrior Tier III skill corrected to **Unbreakable** — the narrator now reacts to this milestone as intended.
- Rogue Tier III skill corrected to **Ghost Walk** — the narrator's 25% attack-negation narrative now triggers correctly.
- Cleric Tier III skill corrected to **Avatar of Light** (id: avatar_divine) — the narrator's divine-avatar narrative now triggers correctly.
- Faction data consolidated: both the Standings screen and faction offer pop-up now use the same canonical faction list, eliminating mismatches where a faction offer could appear with wrong or missing information.

### Changed
- Added a single `verify:all` script to run all verification checks in one command.
- Automated verification and linting now run on every push via GitHub Actions, catching regressions before deploy.
- Email sending in development is now gated: if the Resend key is missing, only a single warning is logged per session, reducing log noise and focusing on real blockers.
- Under-the-hood database health now self-heals on each server start, so new columns added in updates apply automatically without manual database work.
- Internal release checks now include a full hosted narrator journey test (new account, cloud save, and live AI response), improving deployment confidence before updates go live.
- Behind-the-scenes documentation now matches the live Next.js game architecture more consistently.
- Save integrity checks are now stricter, so cloud saves stay tied to the correct adventurer account.
- Account sessions now use safer cookie-based sign-in under the hood for a more secure login flow.
- Added new internal verification tooling to make local security and progression checks easier to run during updates.
- Local setup guidance now matches the game's current live environment requirements more closely.
- Local verification now auto-loads `.env.local` and can run a real cookie session check with an ephemeral account when manual test credentials are not set.
- Local verification now reports database connectivity/setup blockers more clearly and only runs tamper-save checks after a real authenticated session is available.
- All local security verification checks now pass end-to-end including real account registration, cookie session auth, and tamper-save rejection.

### Fixed
- Clarified legacy filename references (`index.html`/`index.hmtl` and `server.js`) so they are no longer treated as active root files.
- Tightened protection against browser-side state tampering affecting hidden narrator context.
- Improved admin endpoint protection with safer header-based authentication paths.
- Core narrator-driven state updates now resolve server-side first, reducing client-side manipulation risk during progression.
- Removed disruptive debug popups from the game screen. You will no longer see E2E test alerts while playing.

## [0.3.1] - 2026-03-14

### Added
- Home button in the toolbar next to Logout — quickly return to the start page.

### Fixed
- Main quest type tags now display correctly as MAIN instead of defaulting to SIDE.

## [0.3.0] - 2026-03-13

### Added - Skill Trees
- Each class now has a unique skill tree with 9 unlockable abilities across 3 tiers.
- Earn +1 Skill Point every time you level up — open the Skills button to spend it.
- Tiers unlock based on your class's primary stat: Tier 1 at 8, Tier 2 at 14, Tier 3 at 20.
- Warriors: Iron Skin → Crushing Blow → Berserker Rage and more.
- Rogues: Shadowstep → Blade Dance → Master Thief (doubles all gold earned).
- Mages: Arcane Surge → Chain Lightning → Archmage's Will and more.
- Clerics: Healing Light → Smite Evil → Resurrection Light (survive death once per dungeon).
- Mastery-tier skills (T3) change how the world reacts to you — the narrator notices.

### Changed
- Level-up now grants +1 Skill Point alongside the existing +3 Stat Points.
