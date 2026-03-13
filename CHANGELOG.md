# Changelog

All notable changes to Aethermoor are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Changed
- Behind-the-scenes documentation now matches the live Next.js game architecture more consistently.
- Save integrity checks are now stricter, so cloud saves stay tied to the correct adventurer account.
- Account sessions now use safer cookie-based sign-in under the hood for a more secure login flow.
- Added new internal verification tooling to make local security and progression checks easier to run during updates.
- Local setup guidance now matches the game's current live environment requirements more closely.
- Local verification now auto-loads `.env.local` and can run a real cookie session check with an ephemeral account when manual test credentials are not set.
- Local verification now reports database connectivity/setup blockers more clearly and only runs tamper-save checks after a real authenticated session is available.

### Fixed
- Clarified legacy filename references (`index.html`/`index.hmtl` and `server.js`) so they are no longer treated as active root files.
- Tightened protection against browser-side state tampering affecting hidden narrator context.
- Improved admin endpoint protection with safer header-based authentication paths.
- Core narrator-driven state updates now resolve server-side first, reducing client-side manipulation risk during progression.

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
