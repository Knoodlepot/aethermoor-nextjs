# Changelog

All notable changes to Aethermoor are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **XP and leveling now work.** Defeating enemies and completing quest objectives grants experience points. When you accumulate enough XP, your character levels up — shown with a notification and applied immediately.
- **Class-specific HP growth on level-up.** Warriors are hardiest, gaining 10 max HP per level. Clerics gain 7, Rogues 5, and Mages 3 — reflecting each class's durability. Your HP is also partially restored when you level up.
- **Stat Points and Skill Points now awarded on level-up.** Each level gained grants +3 Stat Points (spend them in the character panel to raise STR, AGI, INT, or WIL) and +1 Skill Point (for the skill tree).

### Fixed
- **Combat damage now actually reduces your HP.** Previously, the narrator described hits and wounds in prose but your health bar never changed — you could fight forever without ever being in danger. This has been fixed: damage dealt by enemies now reduces your HP in real time, and healing (potions, rest, magic) now restores it properly.
- **Player death is now real.** If your HP reaches zero, you fall in battle. A gravestone is recorded and your adventure ends — permanently. A dramatic death screen appears with the final moments of your story, a randomly chosen epitaph, and the option to Begin Anew with a fresh character. Death is not a setback. It is an ending.
- **Enemies now scale with your level.** Previously the narrator had no anchor for enemy strength — a wolf at level 1 and level 15 could feel identical. Enemies now have concrete HP and damage values that grow with your character, keeping combat dangerous throughout the game. A bloodied enemy (below 30% HP) is now called out so you know when a fight is almost won.
- Automated test suite (login, save, shop, narrator tests) now runs cleanly across all three browsers — dev server starts automatically when tests run.
- Game saves now persist correctly after narrator responses (a database conflict in the narrator's auto-save logic has been resolved).

### Added
- **Six new status effects**: Fear, Bleeding, Cursed, Blinded, Weakened, and Chilled join the existing Poisoned, Burning, and Stunned — bringing the full roster to nine. Each effect now has a proper description and can be applied and removed by the narrator during combat and exploration.
  - **Fearful** 😨 — dread clouds your mind; you may freeze or hesitate, and attacks are penalised. Your Willpower resists or even blocks this effect entirely at high levels.
  - **Bleeding** 🩸 — an open wound bleeds steadily, losing 3 HP per turn until you bind it.
  - **Cursed** 🌑 — dark magic gnaws at your spirit, reducing your Willpower and Intellect.
  - **Blinded** 🙈 — your vision is stripped away, causing heavy penalties to accuracy and agility.
  - **Weakened** 💔 — your muscles betray you; Strength is halved until you recover.
  - **Chilled** ❄️ — cold seeps into your bones, reducing Agility and slowing your initiative.
- **Status effect tooltips**: Hovering over any status effect badge in the combat panel now shows a tooltip explaining what the effect does and exactly how to cure it.
- **New cure items**: Six dedicated remedy items have been added — Bandage (stops bleeding), Courage Draught (clears fear), Purification Charm (lifts curses), Eyewash (restores sight), Warming Draught (thaws the chill), and Tonic of Might (restores strength).
- **Status effects now persist**: Your active status effects are saved with your game and restored when you load — the narrator remembers you are poisoned, bleeding, or cursed between sessions.



### Added
- **Three save slots**: Your progress is now stored across three separate save slots. Click **Save** in the top toolbar to choose which slot to write to — existing saves show your character name, class, level, location, and the date last saved. Empty slots show clearly. Overwriting a different slot asks for confirmation first.
- **Load Game slot picker**: The Load Game button on the main menu now opens the slot picker so you can choose which adventure to continue.
- **Token balance display**: Your current token count now shows in the top toolbar next to the clock.The number glows green when you have plenty, turns gold when running low, orange when getting scarce, and flashes red when critically low (10 or fewer). Click it at any time to open the Token Shop.
- **Token Shop**: A new Token Shop lets you top up your tokens any time. Six packages are available, from a small Starter top-up to the Immortal bundle. Purchases go through secure Stripe checkout and tokens appear in your account immediately on return.
- **Out of Tokens screen**: If you run out of tokens mid-adventure the narrator pauses gracefully and a dedicated screen appears. From there you can head straight to the Token Shop or return to the title.

### Added
- **Side Quest tracker**: A new panel sits below the Main Quest box on the right side of the screen. It shows up to 5 side, faction, and contract quests you are currently tracking. Each quest shows a track toggle (eye icon) to pin or hide it from the panel, and a give-up button (✕) so you can abandon quests you no longer want. Clicking a quest title jumps straight to that quest in the Quest Log.
- **Quest Log — Main Quest tab**: The Quest Log now opens on a dedicated **Main Quest** tab that shows a chapter-by-chapter timeline of everything you have uncovered so far. Each completed act shows what happened; your current act shows what to focus on next. Villain and ally details are revealed as you progress through the story.
- **Quest Log — Faction tab**: Active faction quests now have their own **Faction** tab in the Quest Log, organised by faction. Each entry has the same track toggle and give-up button as side quests.
- **Track toggle**: Any active side, faction, or contract quest can be tracked or untracked. Tracked quests appear in the sidebar panel; untracked quests stay in the Quest Log but are hidden from the panel. New quests start tracked by default.
- **Give Up**: You can now abandon any active side or faction quest directly from the sidebar panel or the Quest Log. A confirmation step prevents accidental clicks. Abandoned quests move to the Failed tab.Enter your character's name, choose a class from a 2×2 card grid (Warrior, Rogue, Mage, or Cleric) showing their key stats at a glance, and hit "Enter Aethermoor." The narrator then paints your opening scene based on a freshly generated world.
- **Fast Travel**: Open the world map and click any location you've previously visited in the new left panel.A popup appears showing your travel options:
  - **On Foot** — always free, full journey time.
  - **Your Horse** — if you own and have equipped a horse, travel is free and takes 60% less time.
  - **Hire a Horse** — 15 gold, same speed as owning one.
  - **River Barge** — available when both locations have river access. Faster and costs a small fee.
  - **Sea Vessel** — available when both locations have a harbour. Fastest option for coastal routes.
  - Time advances by the actual travel duration, so arriving by horse late at night means it's late at night in-game.
- **Mount slot**: A new **Mount** equipment slot has been added to your gear screen. If you buy or are given a horse, you can equip it there — it will then be available for free fast travel.
- **Map zoom**: Scroll the mouse wheel over the map to zoom in or out. Scrolling zooms toward wherever your cursor is pointed. Three overlay buttons (＋ / － / ⌖) let you step zoom with a click or reset to the default view. Zoom range: 60% (overview) to 300% (district detail).
- **Map pan**: Hold left mouse and drag to move the map around. Useful when zoomed in on a dense region. The map is clamped so it never wanders fully off-screen.
- **Terrain on the world map**: The narrator now marks the landscape as the world fills in — dense forests, rolling grasslands, open plains, rugged hills, mountain ranges, frozen tundra, and boggy swamps all appear as visual texture on the map. Rivers curve across the map wherever river routes exist. A new **Terrain** section in the map key explains each type.

### Fixed
- **Entering the Dungeon of Echoes now works correctly.** Clicking the Dungeon button at Aethermoor Capital now immediately places you on Floor 1 with a scene-setting message — no more routing through the narrator.
- **The Dungeon button no longer appears permanently disabled.** A bug caused the button to always read as "already in dungeon" even when you hadn't entered. This is now fixed.
- **Buying items from shops now actually adds them to your inventory**and deducts gold. Previously, shop purchases sent the action to the narrator but never updated your character's gold or inventory.
- **Selling items now correctly removes them from your inventory** and credits your gold.
- **Equipping items now properly moves them to the correct equipment slot.** A long-standing bug caused body armour, helmets, and boots to be placed in the wrong slot (off-hand) when equipped. This is now resolved — armour goes to the body slot, helms to the head slot, and boots to the feet slot.
- **Unequipping an item now correctly returns it to your inventory.**
- **Dropping an item now removes it from your inventory** (quest-critical and faction-gifted items remain protected and cannot be dropped).
- **Joining a faction now works correctly.** Joining adds the faction to your record, grants your joining gift, applies starting standing with that faction, and notes any standing shift with their rivals — all immediately without narrator involvement.
- **Declining a faction offer now updates your character correctly.** After refusing two or more faction offers, The Forgotten will now reliably approach you with their alternate pitch.
- **Crafting now functions end-to-end.** Selecting a recipe correctly consumes the required ingredients, produces the result item, and awards crafting experience.
- **Dismissing a quest from the quest log now removes it.**

### Added
- **⚔ AETHERMOOR header** now appears at the top of the game screen with the game title, game clock, New Game, Save, and Logout buttons — matching the classic layout.
- **💾 Save button** in the header bar lets you manually save your game at any time.
- **Action buttons moved to the bottom of the right panel**, matching the original game layout. Buttons now include Quests, Shop (context-sensitive), Gear, Rep, Bestiary, Craft, Patch Notes, Skills, and Dungeon.
- **Action button badges**: the Quests button shows your active quest count, the Bestiary button shows how many creatures you've encountered (in red), and the Skills button shows available skill points (in green).
- **Dungeon of Echoes button** now appears in the action bar. It pulses red when you're at the Aethermoor Capital and can enter; it's greyed out everywhere else.
- **📖 Story / 🗺️ Map tab toggle** now appears above the text input bar, letting you switch between the narrative view and the world map inline — no popup needed.
- **Character panel** in the right column now shows: class icon, XP progress bar, stat allocation buttons (tap + when you have stat points), and your Rations, Reputation, Gold, and current location.
- **Colorblind themes are now fully distinct** from the default theme. Deuteranopia uses a blue-tinted palette, Protanopia uses a blue-yellow palette, and Tritanopia uses a red-grey palette — each with unique background, text, and accent colours.
- **Dyslexia-friendly theme is now a light cream mode** (warm off-white background, dark text) instead of dark — making it genuinely easier to read for players with dyslexia.

### Fixed
- Removed developer debug breakpoints and log spam that were firing in the browser on every session load.
- Faction join offers now feature rich narrative pitches unique to each faction, including special dialogue for The Forgotten when you have already refused other factions.
- Faction gear sets: equipping two or three matching faction pieces now unlocks powerful set bonuses and faction abilities.
- Faction rank rewards: reaching rank 3 or 4 with a faction now unlocks exclusive gear tied to that faction.
- Level-gated shop gear: shops now stock tiered equipment based on your character level. Steel-tier items appear at level 5, Enchanted-tier at level 10 (in cities), and Masterwork-tier at level 15 (in capital cities).
- Skill tree updates: several Tier III skills now explicitly let the narrator notice and respond to your mastery — Unbreakable, Ghost Walk, Avatar of Light, Warlord's Presence, Resurrection Light, and Berserker Rage.

### Fixed
- Faction gifts, quest keys, and rank gear no longer appear in the shop sell list — protected items cannot be sold.
- Tiered gear (Enchanted Blade, Masterwork Sword, etc.) now shows correct sell prices instead of 10g for everything.
- Shop stock now updates when you level up, so new tier gear appears without needing to travel first.
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
