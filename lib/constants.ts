// ============================================
// AETHERMOOR GAME CONSTANTS
// TypeScript-safe exports of all game data
// ============================================

// ============================================
// CLASS DEFINITIONS
// ============================================
export const CLASSES = {
  Warrior: {
    icon: "⚔️",
    hp: 120,
    str: 8,
    agi: 4,
    int: 2,
    wil: 3,
    desc: "Frontline fighter, master of steel and shield.",
    ability: "Shield Wall",
  },
  Rogue: {
    icon: "🗡️",
    hp: 80,
    str: 5,
    agi: 9,
    int: 3,
    wil: 2,
    desc: "Swift and cunning, strikes from the shadows.",
    ability: "Backstab",
  },
  Mage: {
    icon: "🔮",
    hp: 65,
    str: 2,
    agi: 4,
    int: 9,
    wil: 5,
    desc: "Commands arcane forces to obliterate foes.",
    ability: "Fireball",
  },
  Cleric: {
    icon: "✨",
    hp: 95,
    str: 5,
    agi: 3,
    int: 5,
    wil: 8,
    desc: "Holy warrior who heals allies and smites evil.",
    ability: "Divine Strike",
  },
} as const;

// ============================================
// ABILITY SYSTEM (~25 abilities)
// ============================================
export const ABILITY_INFO = {
  "Shield Wall": {
    icon: "🛡️",
    type: "Defensive",
    desc: "Brace behind your shield, reducing all incoming damage by half until your next turn. Works best when enemies are focused on you.",
  },
  Backstab: {
    icon: "🗡️",
    type: "Offensive",
    desc: "Strike a distracted or unaware foe from the shadows. Deals triple AGI-based damage when the enemy doesn't expect it.",
  },
  Fireball: {
    icon: "🔥",
    type: "Offensive",
    desc: "Hurl a blazing sphere of arcane fire at your enemy. Deals heavy INT-based damage and may set the target ablaze.",
  },
  "Divine Strike": {
    icon: "✨",
    type: "Holy",
    desc: "Channel divine power into your weapon. Deals bonus WIL-based holy damage and can briefly stun undead or demonic foes.",
  },
  "War Cry": {
    icon: "📣",
    type: "Combat",
    desc: "Let out a battle cry that boosts your STR for 3 turns and intimidates weaker enemies.",
  },
  Unbreakable: {
    icon: "🪨",
    type: "Passive",
    desc: "Your warrior spirit makes you immune to fear and reduces all damage by 10% permanently.",
  },
  "Shadow Step": {
    icon: "👤",
    type: "Combat",
    desc: "Vanish briefly and reappear behind your foe, guaranteeing your next attack is a backstab.",
  },
  "Death Mark": {
    icon: "☠️",
    type: "Combat",
    desc: "Mark a target for death. Your next three attacks against them deal doubled damage.",
  },
  "Flame Shield": {
    icon: "🔥",
    type: "Defensive",
    desc: "Wrap yourself in fire. Attackers take burn damage and you resist cold and physical hits.",
  },
  Meteor: {
    icon: "☄️",
    type: "Combat",
    desc: "Call down a flaming rock from the sky. Devastating area damage. Requires concentration.",
  },
  "Holy Aura": {
    icon: "🌟",
    type: "Support",
    desc: "Emanate divine light. Allies near you recover HP each turn. Undead are repelled.",
  },
  Resurrection: {
    icon: "💫",
    type: "Holy",
    desc: "Once per rest, restore a fallen companion to life with partial HP. Costs significant WIL.",
  },
  "Nature's Veil": {
    icon: "🍃",
    type: "Stealth",
    desc: "Blend into natural surroundings. Near-invisible in forests and wilderness.",
  },
  "Call of the Wild": {
    icon: "🐺",
    type: "Summon",
    desc: "Summon a beast companion to fight alongside you for one encounter.",
  },
  "Silver Tongue": {
    icon: "🗣️",
    type: "Social",
    desc: "Your words carry unusual weight. Persuasion and bartering checks always succeed.",
  },
  "Trade Empire": {
    icon: "🏦",
    type: "Passive",
    desc: "Your commercial connections mean you can buy anything, anywhere, at base cost.",
  },
  Authority: {
    icon: "⚖️",
    type: "Social",
    desc: "Flash Crown credentials to de-escalate guards, bypass locks, or command respect.",
  },
  "Royal Decree": {
    icon: "📜",
    type: "Passive",
    desc: "The Crown backs you. Hostile encounters with lawful groups are automatically avoided.",
  },
  "Street Smarts": {
    icon: "👁️",
    type: "Passive",
    desc: "You sense traps, ambushes and lies before they spring. +3 effective AGI on awareness.",
  },
  Ghost: {
    icon: "🌬️",
    type: "Stealth",
    desc: "You leave no trace. Guards can never track you and wanted status clears automatically.",
  },
  "Arcane Insight": {
    icon: "🔮",
    type: "Passive",
    desc: "You sense magical auras, identify enchanted items, and read ancient runes automatically.",
  },
  "Forbidden Knowledge": {
    icon: "📖",
    type: "Passive",
    desc: "Ancient secrets fuel your power. All INT-based actions gain a hidden +4 bonus.",
  },
  "Sea Legs": {
    icon: "⚓",
    type: "Passive",
    desc: "You never get lost on water or coasts and coastal travel costs no time.",
  },
  "Corsair's Gambit": {
    icon: "🏴",
    type: "Combat",
    desc: "A daring all-or-nothing strike — either deal massive damage or leave yourself open.",
  },
  "Spirit Sight": {
    icon: "👁️",
    type: "Passive",
    desc: "Sanam's gift opens your inner eye to what lingers between worlds. Spirits and shades may now choose to speak with you. Against undead and spectral enemies, your WIL is treated as 4 points higher. Some truths only the dead know.",
  },
} as const;

// ============================================
// ITEM DATABASE (~39 items)
// ============================================
export const ITEM_INFO = {
  "health potion": {
    icon: "🧪",
    type: "Consumable",
    desc: "A vial of crimson liquid brewed from healing herbs. Restores a portion of your HP when drunk. Best saved for desperate moments.",
  },
  "mana potion": {
    icon: "💧",
    type: "Consumable",
    desc: "A shimmering blue draught that restores arcane energy. Recharges spell uses for Mages and Clerics.",
  },
  antidote: {
    icon: "🟢",
    type: "Consumable",
    desc: "Neutralises poison coursing through your veins. Acts fast — don't wait too long to use it.",
  },
  torch: {
    icon: "🔦",
    type: "Tool",
    desc: "A simple wooden torch dipped in pitch. Lights dark places and keeps weaker creatures at bay.",
  },
  lockpick: {
    icon: "🗝️",
    type: "Tool",
    desc: "A slender metal pick used to open locked doors and chests. Requires a steady hand and some AGI.",
  },
  rope: {
    icon: "🪢",
    type: "Tool",
    desc: "Thirty feet of sturdy hempen rope. Useful for climbing, binding, or escaping tight spots.",
  },
  "forager kit": {
    icon: "🧺",
    type: "Tool",
    desc: "A wildcrafting kit of pouches, shears and snare cord. Improves forage yields and safety.",
  },
  bedroll: {
    icon: "🛏️",
    type: "Tool",
    desc: "A rolled sleeping mat that lets you recover better when camping outside settlements.",
  },
  "woodcutter hatchet": {
    icon: "🪓",
    type: "Tool",
    desc: "A compact axe for splitting branches and felling small timber.",
  },
  "miner's pickaxe": {
    icon: "⛏️",
    type: "Tool",
    desc: "A hardened mining pick for extracting ore from stone and cliffsides.",
  },
  "farm sickle": {
    icon: "🌾",
    type: "Tool",
    desc: "A curved harvesting blade for gathering grain and field produce quickly.",
  },
  horse: {
    icon: "🐴",
    type: "Mount",
    slot: "mount",
    desc: "A sturdy road horse. Equip to your mount slot. Halves travel time on the road — no hire fee when fast-travelling.",
  },
  map: {
    icon: "🗺️",
    type: "Document",
    desc: "A rough parchment map of the local area. Reveals roads, landmarks and points of interest.",
  },
  key: {
    icon: "🔑",
    type: "Key",
    desc: "A worn iron key. It must open something nearby — but what?",
  },
  bread: {
    icon: "🍞",
    type: "Food",
    desc: "A small loaf of travel bread. Eating it during a rest slightly improves HP recovery.",
  },
  rations: {
    icon: "🎒",
    type: "Food",
    desc: "Dried meat, hard biscuits and a pinch of salt. Standard adventurer's fare — keeps you going on the road.",
  },
  "gold coin": {
    icon: "🪙",
    type: "Currency",
    desc: "Stamped with the seal of Aethermoor. Accepted by merchants across the continent.",
  },
  sword: {
    icon: "⚔️",
    type: "Weapon",
    desc: "A reliable iron sword. Boosts STR-based attack damage in combat.",
  },
  dagger: {
    icon: "🗡️",
    type: "Weapon",
    desc: "A short blade favoured by Rogues. Fast to draw and deadly when used from the shadows.",
  },
  "arcane wand": {
    icon: "🪄",
    type: "Weapon",
    desc: "A slender wand crackling with arcane energy. Enhances INT-based spell power for Mages.",
  },
  staff: {
    icon: "🪄",
    type: "Weapon",
    desc: "A carved wooden staff channelling arcane energy. Enhances spell power for Mages.",
  },
  shield: {
    icon: "🛡️",
    type: "Armour",
    desc: "A battered iron shield. Reduces incoming physical damage when equipped.",
  },
  "leather armour": {
    icon: "🥋",
    type: "Armour",
    desc: "Supple leather armour. Light enough not to hinder movement, offering modest protection.",
  },
  chainmail: {
    icon: "⛓️",
    type: "Armour",
    desc: "Interlocking iron rings offering solid defence against slashing and piercing attacks.",
  },
  scroll: {
    icon: "📜",
    type: "Magic",
    desc: "A rolled parchment inscribed with a spell. Can be read once to cast its magic, then it crumbles to dust.",
  },
  amulet: {
    icon: "🔯",
    type: "Magic",
    desc: "A carved stone amulet humming faintly with power. Its effect reveals itself when worn.",
  },
  ring: {
    icon: "💍",
    type: "Magic",
    desc: "A simple band of silver etched with runes. Provides a subtle but persistent magical benefit.",
  },
  herb: {
    icon: "🌿",
    type: "Crafting",
    desc: "Freshly gathered medicinal herbs. A healer or alchemist could brew these into a useful potion.",
  },
  firewood: {
    icon: "🪵",
    type: "Resource",
    desc: "Dry chopped wood useful for campfires, shelter work, and basic crafting.",
  },
  "timber bundle": {
    icon: "🪵",
    type: "Resource",
    desc: "Strapped timber suitable for building shelters, repairs, and trade.",
  },
  "iron ore": {
    icon: "⛏️",
    type: "Resource",
    desc: "Unrefined iron-bearing rock. Useful for blacksmithing and future crafting.",
  },
  "copper ore": {
    icon: "⛏️",
    type: "Resource",
    desc: "A common ore used in tools, fittings and trade goods.",
  },
  "silver ore": {
    icon: "⛏️",
    type: "Resource",
    desc: "Valuable ore prized by smiths and enchanters.",
  },
  gem: {
    icon: "💎",
    type: "Treasure",
    desc: "A faceted gemstone that catches the light. Worth a fair sum to the right merchant.",
  },
  arrow: {
    icon: "🏹",
    type: "Ammunition",
    desc: "Fletched hunting arrows. Required for ranged combat with a bow.",
  },
  "herb broth": {
    icon: "🍵",
    type: "Food",
    desc: "A camp broth infused with medicinal herbs. Heals and cleanses poison.",
  },
  "mushroom stew": {
    icon: "🍲",
    type: "Food",
    desc: "A thick earthy stew of rare mushrooms. Powerful restoration.",
  },
  "ranger's pottage": {
    icon: "🍛",
    type: "Food",
    desc: "A dense wild meal from the best the land offers. Fully restores HP.",
  },
} as const;

// ============================================
// STATUS EFFECTS — canonical list with display info
// ============================================
export const STATUS_EFFECTS: Record<string, { icon: string; label: string; description: string; cure: string }> = {
  poisoned:  { icon: '☠️', label: 'Poisoned',  description: 'Venom courses through you. Lose HP each turn. WIL 6+ resists; WIL 9+ near-immune.', cure: 'Antidote, Medicinal Herb, or Herb Broth' },
  burning:   { icon: '🔥', label: 'Burning',   description: 'Flames eat at your flesh. Ongoing fire damage until extinguished.', cure: 'Roll in water or dirt; wait it out' },
  stunned:   { icon: '⚡', label: 'Stunned',   description: 'Your senses reel. You cannot act this turn.', cure: 'Wears off after one turn' },
  fearful:   { icon: '😨', label: 'Fearful',   description: 'Dread clouds your mind. You may freeze or flee. Attack rolls penalised. WIL 5–7 resists basic fear; WIL 8+ is immune.', cure: 'Courage Draught, or a successful WIL test' },
  bleeding:  { icon: '🩸', label: 'Bleeding',  description: 'An open wound bleeds steadily. Lose 3 HP per turn until bound.', cure: 'Bandage' },
  cursed:    { icon: '🌑', label: 'Cursed',    description: 'Dark magic gnaws at your spirit. WIL and INT reduced by 2 each.', cure: 'Purification Charm, holy water, or a temple blessing' },
  blinded:   { icon: '🙈', label: 'Blinded',   description: 'Your vision is stripped away. Heavy penalty to accuracy and AGI.', cure: 'Eyewash, or wears off after 2 turns' },
  weakened:  { icon: '💔', label: 'Weakened',  description: 'Your muscles betray you. STR halved until you recover.', cure: 'Tonic of Might, or a long rest' },
  chilled:   { icon: '❄️', label: 'Chilled',   description: 'Cold seeps into your bones. AGI reduced by 3; you act last in initiative.', cure: 'Warming Draught, or move near a fire' },
};

// ============================================
// CONSUMABLE EFFECTS
// ============================================
export type ConsumableEffect = {
  hp?: number;
  hpFull?: boolean;
  str?: number;
  agi?: number;
  int?: number;
  wil?: number;
  clearStatus?: string[];
  msg?: string;
};

export const CONSUMABLE_EFFECTS: Record<string, ConsumableEffect> = {
  "health potion":        { hp: 30, msg: "You drink the Health Potion. +30 HP." },
  "strong health potion": { hp: 60, msg: "You drink the Strong Health Potion. +60 HP." },
  "elixir of vigour":     { hpFull: true, msg: "You drink the Elixir of Vigour. HP fully restored!" },
  ambrosia: {
    hpFull: true,
    str: 5,
    agi: 5,
    int: 5,
    wil: 5,
    msg: "You consume the Ambrosia. HP restored and all stats +5 temporarily!",
  },
  "mana potion":          { wil: 1, msg: "You drink the Mana Potion. +1 WIL (arcane energy restored)." },
  antidote:               { clearStatus: ['poisoned'], msg: "You drink the Antidote. Poison neutralised." },
  "travel bread":         { hp: 8,  msg: "You eat the Travel Bread. +8 HP." },
  rations:                { hp: 15, msg: "You eat the Rations. +15 HP." },
  "rations x3":           { hp: 15, msg: "You eat some Rations. +15 HP." },
  "rations x2":           { hp: 15, msg: "You eat some Rations. +15 HP." },
  "rations x1":           { hp: 15, msg: "You eat the last of your Rations. +15 HP." },
  "dried meat":           { hp: 12, msg: "You eat the Dried Meat. +12 HP." },
  "trail bread":          { hp: 8,  msg: "You chew through the Trail Bread. +8 HP." },
  "iron rations":         { hp: 20, msg: "You eat the Iron Rations. +20 HP." },
  "medicinal herb":       { hp: 20, clearStatus: ['poisoned'], msg: "You apply the Medicinal Herb. +20 HP. Poison cleansed." },
  "rare mushroom":        { hp: 35, msg: "The Rare Mushroom restores you significantly. +35 HP." },
  "healing herb":         { hp: 5,  msg: "You chew the Healing Herb. +5 HP." },
  "scroll of fire":       { msg: "You read the Scroll of Fire. It crumbles to ash — the spell is cast!" },
  "scroll of mending":    { hp: 40, msg: "You read the Scroll of Mending. +40 HP." },
  "scroll of lightning":  { msg: "You read the Scroll of Lightning. It crumbles to ash — the spell is cast!" },
  "herb broth":           { hp: 25, clearStatus: ['poisoned'], msg: "You drink the Herb Broth. +25 HP. Poison cleansed." },
  "mushroom stew":        { hp: 45, msg: "You eat the Mushroom Stew. +45 HP." },
  "ranger's pottage":     { hpFull: true, msg: "You eat the Ranger's Pottage. HP fully restored." },
  // Status effect cures
  bandage:                { clearStatus: ['bleeding'], msg: "You bind the wound. The bleeding stops." },
  "courage draught":      { clearStatus: ['fearful'], wil: 1, msg: "You drink the Courage Draught. The dread recedes. +1 WIL." },
  "purification charm":   { clearStatus: ['cursed'], msg: "You crush the Purification Charm. The dark magic lifts." },
  eyewash:                { clearStatus: ['blinded'], msg: "You apply the Eyewash. Your vision clears." },
  "warming draught":      { clearStatus: ['chilled'], msg: "You drink the Warming Draught. Warmth floods your limbs." },
  "tonic of might":       { clearStatus: ['weakened'], str: 1, msg: "You drink the Tonic of Might. Strength returns to your muscles. +1 STR." },
};

// ============================================
// DISGUISED ITEMS (Xephita's Magical Disguises)
// ============================================
export const DISGUISED_ITEMS = {
  rope: {
    trueName: "Unbreakable Rope",
    trueIcon: "✨",
    trueDesc:
      "An ethereal rope woven from starlight and intention. Three centuries old, unbreakable by any mortal means. Can traverse hazardous terrain safely and assist in narratively appropriate situations.",
    trueType: "Tool",
    mechanics: ["hazard_traverse", "narrative_tool", "flavor"],
    revealText:
      "As you leave Xephita's stall, the rope shimmers with otherworldly radiance. You realize now what you've purchased—no mere hemp, but something far more ancient and extraordinary.",
  },
} as const;

// ============================================
// EQUIPMENT SLOT SYSTEM
// ============================================
export const EQUIP_SLOTS = {
  weapon: { label: "Weapon", icon: "⚔️", types: ["Weapon"] },
  offhand: { label: "Off-hand", icon: "🛡️", types: ["Armour"] },
  head: { label: "Head", icon: "🪖", types: ["Armour"] },
  body: { label: "Body", icon: "🥋", types: ["Armour"] },
  feet: { label: "Feet", icon: "👢", types: ["Armour"] },
  accessory: { label: "Accessory", icon: "🔯", types: ["Magic"] },
  mount: { label: "Mount", icon: "🐴", types: ["Mount"] },
} as const;

// ============================================
// ITEM STAT BONUSES (Equipment Modifiers)
// ============================================
export const ITEM_STAT_BONUSES = {
  Dagger: { str: 1, agi: 1 },
  "Iron Sword": { str: 2 },
  "Steel Sword": { str: 4 },
  "Blade of Aethermoor": { str: 8 },
  "Staff of Ages": { int: 5, wil: 2 },
  "Iron Shield": { str: 1 },
  "Leather Armour": { agi: 1 },
  Chainmail: { str: 1 },
  "Plate Armour": { str: 2 },
  "Dragon Scale Armour": { str: 3, wil: 1 },
  "Amulet of Warding": { wil: 1 },
  "Ring of Strength": { str: 1 },
  "Ring of Agility": { agi: 1 },
  "Ring of Wisdom": { wil: 2 },
  "Shadowmere Cloak": { agi: 3 },
  "Steel Shield": { str: 1 },
  "Hunting Bow": { agi: 3 },
  "War Hammer": { str: 3 },
  "Silver Amulet": { wil: 2 },
  "Enchanted Blade": { str: 5, int: 2 },
  "Mage Robes": { int: 4, wil: 2 },
  "Tower Shield": { str: 2 },
  "Ring of Power": { str: 2, int: 2 },
  "Battle Axe": { str: 6 },
  "Masterwork Sword": { str: 7 },
  "Voidsteel Armour": { str: 3, agi: 3 },
  "Archmage Staff": { int: 7, wil: 3 },
  "Obsidian Shield": { wil: 4, str: 2 },
} as const;

// ============================================
// ENEMY ARCHETYPES
// ============================================
export const ENEMY_ARCHETYPES = {
  wolf: {
    icon: "🐺",
    name: "Wolf",
    style: "pack_hunter",
    baseHp: 20,
    baseStr: 4,
    baseAgi: 6,
    baseDef: 1,
    xpMult: 1,
    goldMult: 0.5,
    lootTier: 1,
    locations: ["explore", "camp"],
  },
  bandit: {
    icon: "🗡️",
    name: "Bandit",
    style: "dirty_fighter",
    baseHp: 28,
    baseStr: 5,
    baseAgi: 4,
    baseDef: 2,
    xpMult: 1.2,
    goldMult: 1.5,
    lootTier: 1,
    locations: ["explore", "town"],
  },
  skeleton: {
    icon: "💀",
    name: "Skeleton",
    style: "relentless",
    baseHp: 24,
    baseStr: 4,
    baseAgi: 3,
    baseDef: 3,
    xpMult: 1.1,
    goldMult: 0.5,
    lootTier: 1,
    locations: ["explore"],
  },
  zombie: {
    icon: "🧟",
    name: "Zombie",
    style: "shambling",
    baseHp: 40,
    baseStr: 7,
    baseAgi: 1,
    baseDef: 2,
    xpMult: 1.3,
    goldMult: 0.5,
    lootTier: 2,
    locations: ["explore"],
  },
  cultist: {
    icon: "🧙",
    name: "Cultist",
    style: "spellcaster",
    baseHp: 22,
    baseStr: 2,
    baseAgi: 3,
    baseDef: 1,
    xpMult: 1.4,
    goldMult: 1,
    lootTier: 2,
    locations: ["explore", "town"],
  },
  soldier: {
    icon: "🪖",
    name: "Soldier",
    style: "disciplined",
    baseHp: 35,
    baseStr: 6,
    baseAgi: 3,
    baseDef: 5,
    xpMult: 1.3,
    goldMult: 1.5,
    lootTier: 2,
    locations: ["town"],
  },
  beast: {
    icon: "🐗",
    name: "Beast",
    style: "enraged",
    baseHp: 45,
    baseStr: 8,
    baseAgi: 4,
    baseDef: 2,
    xpMult: 1.5,
    goldMult: 0.5,
    lootTier: 2,
    locations: ["explore"],
  },
  drake: {
    icon: "🐉",
    name: "Drake",
    style: "flame_breath",
    baseHp: 60,
    baseStr: 9,
    baseAgi: 5,
    baseDef: 4,
    xpMult: 2,
    goldMult: 2,
    lootTier: 3,
    locations: ["explore"],
  },
  rogue_e: {
    icon: "🥷",
    name: "Rogue",
    style: "shadow_strike",
    baseHp: 25,
    baseStr: 4,
    baseAgi: 8,
    baseDef: 2,
    xpMult: 1.3,
    goldMult: 2,
    lootTier: 2,
    locations: ["town", "explore"],
  },
  boss: {
    icon: "👑",
    name: "Boss",
    style: "apex",
    baseHp: 80,
    baseStr: 10,
    baseAgi: 6,
    baseDef: 5,
    xpMult: 3,
    goldMult: 4,
    lootTier: 4,
    locations: ["explore", "town"],
  },
} as const;

// ============================================
// DUNGEON-EXCLUSIVE ENEMIES
// 5 per biome × 7 biomes = 35 total
// These only appear inside the Dungeon of Echoes.
// tier: 1=minion, 2=standard, 3=tough/veteran, 4=elite/named, 5=boss
// ============================================
export interface DungeonEnemy {
  name: string;
  icon: string;
  tier: 1 | 2 | 3 | 4 | 5;
  biome: string;
  description: string;
}

export const DUNGEON_EXCLUSIVE_ENEMIES: Record<string, DungeonEnemy> = {
  // --- Shallow Halls (floors 1-5) ---
  dust_crawler: {
    name: 'Dust Crawler',
    icon: '🕷️',
    tier: 1,
    biome: 'Shallow Halls',
    description: 'A bloated pale spider that nests in dusty alcoves and feeds on old remains. Drops silently from the ceiling.',
  },
  hollow_sentry: {
    name: 'Hollow Sentry',
    icon: '🗿',
    tier: 2,
    biome: 'Shallow Halls',
    description: 'A stone guardian worn featureless by centuries. Still responds to intrusion with mechanical, unhurried precision.',
  },
  lost_explorer: {
    name: 'Lost Explorer',
    icon: '🧍',
    tier: 2,
    biome: 'Shallow Halls',
    description: 'A half-mad adventurer who descended years ago and never found the way out. Not hostile until they see your supplies.',
  },
  rubble_lurker: {
    name: 'Rubble Lurker',
    icon: '🦎',
    tier: 1,
    biome: 'Shallow Halls',
    description: 'A pale lizard the size of a dog that evolved to ambush from collapsed stonework. Moves only when prey is close.',
  },
  trapped_revenant: {
    name: 'Trapped Revenant',
    icon: '👻',
    tier: 3,
    biome: 'Shallow Halls',
    description: 'The spirit of someone who sealed themselves in to avoid what lay below. Violent when its long solitude is disturbed.',
  },
  // --- The Ossuary (floors 6-10) ---
  bone_architect: {
    name: 'Bone Architect',
    icon: '🦷',
    tier: 3,
    biome: 'The Ossuary',
    description: 'Assembles new forms from surrounding bones during combat. Each kill gives it material to grow larger.',
  },
  osseous_hound: {
    name: 'Osseous Hound',
    icon: '🦴',
    tier: 1,
    biome: 'The Ossuary',
    description: 'A skeleton dog still wearing the memory of loyalty. Fast, relentless, and utterly silent on its bone feet.',
  },
  wailing_shade: {
    name: 'Wailing Shade',
    icon: '😱',
    tier: 2,
    biome: 'The Ossuary',
    description: 'The voice of someone who died in fear. Its scream rattles bone and mind alike, capable of causing the stunned status.',
  },
  gravekeeper: {
    name: 'Gravekeeper',
    icon: '⚰️',
    tier: 3,
    biome: 'The Ossuary',
    description: 'A corpse so saturated with grave-dust it moves with near-living purpose. Deeply hostile to anything that disrupts order among the dead.',
  },
  death_curator: {
    name: 'Death Curator',
    icon: '📜',
    tier: 4,
    biome: 'The Ossuary',
    description: 'Robed and ancient, it catalogues the dead with eerie precision. Does not appreciate the arrival of the living — or those who have killed its records.',
  },
  // --- Flooded Tunnels (floors 11-16) ---
  tide_wraith: {
    name: 'Tide Wraith',
    icon: '🌊',
    tier: 3,
    biome: 'Flooded Tunnels',
    description: 'A spirit that drowned and never stopped moving. Pulls victims beneath the black water with cold, purposeful grip.',
  },
  blind_angler: {
    name: 'Blind Angler',
    icon: '🎣',
    tier: 2,
    biome: 'Flooded Tunnels',
    description: 'A cave fish grown to man-size, drawing prey with a dim bioluminescent lure before striking from below.',
  },
  drowned_knight: {
    name: 'Drowned Knight',
    icon: '⚔️',
    tier: 3,
    biome: 'Flooded Tunnels',
    description: 'A heavily armoured warrior who sank and never surfaced. Still fights with practiced technique, waterlogged and relentless.',
  },
  pressure_eel: {
    name: 'Pressure Eel',
    icon: '⚡',
    tier: 2,
    biome: 'Flooded Tunnels',
    description: 'A massive electric eel evolved in total darkness. Its discharge stuns everyone in the water within reach.',
  },
  flood_horror: {
    name: 'Flood Horror',
    icon: '🫧',
    tier: 4,
    biome: 'Flooded Tunnels',
    description: 'Something that arrived with the water and has been here ever since. It has no eyes. It does not need them.',
  },
  // --- Fungal Depths (floors 17-22) ---
  spore_priest: {
    name: 'Spore Priest',
    icon: '🍄',
    tier: 3,
    biome: 'Fungal Depths',
    description: 'A humanoid body colonised by fungus until the original host is merely a vessel. Commands lesser fungal creatures with pheromone signals.',
  },
  mycelium_stalker: {
    name: 'Mycelium Stalker',
    icon: '🕸️',
    tier: 2,
    biome: 'Fungal Depths',
    description: 'Travels through the underground mycelium network beneath the floor, emerging exactly where least expected.',
  },
  bloom_horror: {
    name: 'Bloom Horror',
    icon: '🌺',
    tier: 4,
    biome: 'Fungal Depths',
    description: 'A flowering mass of fungal growth that was once many separate things. Releases toxic spore bursts in a wide radius when struck.',
  },
  decay_husk: {
    name: 'Decay Husk',
    icon: '🧟',
    tier: 1,
    biome: 'Fungal Depths',
    description: 'A corpse fully colonised by mycelium until the fungus walks it. Still moves. Spreads the infection on contact.',
  },
  spore_echo: {
    name: 'Spore Echo',
    icon: '👁️',
    tier: 2,
    biome: 'Fungal Depths',
    description: 'A hallucination given limited physical form by concentrated spores. Mirrors the player\'s appearance. Deeply disconcerting.',
  },
  // --- The Burning Dark (floors 23-28) ---
  magma_seraph: {
    name: 'Magma Seraph',
    icon: '🔥',
    tier: 4,
    biome: 'The Burning Dark',
    description: 'A winged humanoid shape of cooling and re-melting rock. The fire cultists worship it as proof of divine favour in the deep.',
  },
  slag_crawler: {
    name: 'Slag Crawler',
    icon: '🦂',
    tier: 1,
    biome: 'The Burning Dark',
    description: 'An insectoid creature with a carapace hardened by volcanic minerals. Fast and surprisingly acidic at close range.',
  },
  cinder_wraith: {
    name: 'Cinder Wraith',
    icon: '💨',
    tier: 3,
    biome: 'The Burning Dark',
    description: 'The ashen ghost of someone who burned to nothing. Leaves scorched footprints in the stone. Contact inflicts the burning status.',
  },
  heat_mirage: {
    name: 'Heat Mirage',
    icon: '🌀',
    tier: 2,
    biome: 'The Burning Dark',
    description: 'An entity that exists only in the distortion between extreme heat and slightly cooler air. Difficult to track, disorienting to fight.',
  },
  lava_warden: {
    name: 'Lava Warden',
    icon: '🪨',
    tier: 3,
    biome: 'The Burning Dark',
    description: 'A golem built to manage the magma flows. Its master is gone. It now interprets all movement as a threat to be eliminated.',
  },
  // --- Frost Crypts (floors 29-35) ---
  glacial_revenant: {
    name: 'Glacial Revenant',
    icon: '❄️',
    tier: 3,
    biome: 'Frost Crypts',
    description: 'A warrior frozen mid-charge who thaws when warmth approaches. Resumes the charge immediately, exactly where it left off.',
  },
  hoarfrost_witch: {
    name: 'Hoarfrost Witch',
    icon: '🧙‍♀️',
    tier: 4,
    biome: 'Frost Crypts',
    description: 'An ancient spellcaster who sought immortality in the cold. She found it. She has had a long time to regret nothing.',
  },
  ice_echo: {
    name: 'Ice Echo',
    icon: '🔮',
    tier: 2,
    biome: 'Frost Crypts',
    description: 'A reflection in the ice that stepped out. Imitates your movements with a half-second delay and a cold smile.',
  },
  frozen_hound: {
    name: 'Frozen Hound',
    icon: '🐕',
    tier: 1,
    biome: 'Frost Crypts',
    description: 'A wolf frozen for centuries, perfectly preserved by the unnatural cold. Now it hunts again, as if no time has passed.',
  },
  null_knight: {
    name: 'Null Knight',
    icon: '🏴',
    tier: 4,
    biome: 'Frost Crypts',
    description: 'A knight in black ice armour with nothing behind the visor. Absolute in purpose. Empty of memory. It does not stop.',
  },
  // --- The Abyss (floors 36+) ---
  void_speaker: {
    name: 'Void Speaker',
    icon: '📢',
    tier: 3,
    biome: 'The Abyss',
    description: 'Learned language from listening to adventurers die. Speaks in your voice. Says things you haven\'t said yet.',
  },
  mirror_self: {
    name: 'Mirror Self',
    icon: '🪞',
    tier: 3,
    biome: 'The Abyss',
    description: 'A perfect copy that steps from the darkness. Same stats, same equipment. It is here to replace you.',
  },
  the_unravelling: {
    name: 'The Unravelling',
    icon: '🌀',
    tier: 4,
    biome: 'The Abyss',
    description: 'A mass of contradictions with no stable form. Its attacks change type each turn. Looking directly at it causes the stunned status.',
  },
  hunger_of_the_deep: {
    name: 'Hunger of the Deep',
    icon: '🕳️',
    tier: 5,
    biome: 'The Abyss',
    description: 'The dungeon\'s own appetite given form. Cannot be killed through conventional means — it must be outwitted, bargained with, or fled.',
  },
  echo_warden: {
    name: 'Echo Warden',
    icon: '👁️',
    tier: 4,
    biome: 'The Abyss',
    description: 'The last guardian of whatever lies at the very bottom. Ancient, patient, and fully aware that you are here.',
  },
};

export const TOTAL_KNOWN_ENEMIES =
  Object.keys(ENEMY_ARCHETYPES).length + Object.keys(DUNGEON_EXCLUSIVE_ENEMIES).length;

// ============================================
// ENEMY TIERS (Difficulty Multipliers)
// ============================================
export const ENEMY_TIERS = [
  { tier: "minion", label: "Minion", mult: 0.6, chanceBoss: 0 },
  { tier: "standard", label: "", mult: 1, chanceBoss: 0 },
  { tier: "veteran", label: "Veteran", mult: 1.4, chanceBoss: 0 },
  { tier: "boss", label: "Boss", mult: 2, chanceBoss: 1 },
] as const;

// ============================================
// ENEMY TRAITS (Special Modifiers)
// ============================================
export const ENEMY_TRAITS = [
  { id: "armoured", label: "Armoured" },
  { id: "envenomed", label: "Envenomed" },
  { id: "berserker", label: "Berserker" },
  { id: "swift", label: "Swift" },
  { id: "resilient", label: "Resilient" },
  { id: "coward", label: "Coward" },
] as const;

// ============================================
// ENEMY VARIANTS (Visual Prefixes + Stat Multipliers)
// ============================================
export const ENEMY_VARIANTS = [
  { id: "feral", prefix: "Feral", hpMult: 0.9, strMult: 1.15, agiMult: 1.1, defMult: 0.9, xpMult: 1.05, goldMult: 0.9 },
  { id: "ashen", prefix: "Ashen", hpMult: 0.95, strMult: 1.1, agiMult: 1, defMult: 1, xpMult: 1.05, goldMult: 1 },
  { id: "frostbound", prefix: "Frostbound", hpMult: 1.1, strMult: 1, agiMult: 0.95, defMult: 1.1, xpMult: 1.08, goldMult: 1.05 },
  { id: "gloom", prefix: "Gloom", hpMult: 1, strMult: 1.05, agiMult: 1.15, defMult: 0.95, xpMult: 1.08, goldMult: 1.1 },
  { id: "ironhide", prefix: "Ironhide", hpMult: 1.1, strMult: 1, agiMult: 0.9, defMult: 1.25, xpMult: 1.1, goldMult: 1.05 },
  { id: "bloodfang", prefix: "Bloodfang", hpMult: 0.95, strMult: 1.2, agiMult: 1.05, defMult: 0.9, xpMult: 1.1, goldMult: 0.95 },
  { id: "storm", prefix: "Storm", hpMult: 0.95, strMult: 1.05, agiMult: 1.2, defMult: 0.95, xpMult: 1.1, goldMult: 1.05 },
  { id: "voidtouched", prefix: "Voidtouched", hpMult: 1.05, strMult: 1.1, agiMult: 1.05, defMult: 1, xpMult: 1.12, goldMult: 1.1 },
  { id: "sunscorched", prefix: "Sunscorched", hpMult: 1, strMult: 1.1, agiMult: 1, defMult: 1, xpMult: 1.08, goldMult: 1.15 },
  { id: "nightstalker", prefix: "Nightstalker", hpMult: 0.9, strMult: 1.05, agiMult: 1.25, defMult: 0.9, xpMult: 1.12, goldMult: 1.1 },
  { id: "ancient", prefix: "Ancient", hpMult: 1.2, strMult: 1.1, agiMult: 0.9, defMult: 1.2, xpMult: 1.15, goldMult: 1.2 },
  { id: "warlord", prefix: "Warlord", hpMult: 1.15, strMult: 1.2, agiMult: 0.95, defMult: 1.1, xpMult: 1.18, goldMult: 1.2 },
] as const;

// ============================================
// ARMOUR DEFENSE VALUES
// ============================================
export const ARMOUR_DEF = {
  "Leather Armour": 3,
  Chainmail: 6,
  "Plate Armour": 10,
  "Dragon Scale Armour": 14,
  "Mage Robes": 2,
  "Voidsteel Armour": 8,
  "Thornwood Leathers": 4,
  "Ember Robes": 3,
  "Vestments of Light": 5,
  "Royal Armour": 9,
  "Robes of the Academy": 3,
  "Wolf Coat": 4,
  "Ragged Cloak": 2,
  "Compact Coat": 3,
  "Warlord's Plate": 11,
  "Shadowmere Cloak": 3,
  "Shadow Boots": 1,
  "Root Boots": 1,
  "Gold-Threaded Boots": 1,
} as const;

// ============================================
// SHIELD DEFENSE VALUES
// ============================================
export const SHIELD_DEF = {
  "Iron Shield": 2,
  "Steel Shield": 3,
  "Tower Shield": 5,
  "Obsidian Shield": 4,
  "Champion's Pauldrons": 2,
} as const;

// ============================================
// COMMAND GROUPS (Panel Button Definitions)
// ============================================

export interface CommandDef {
  id: string;
  icon: string;
  label: string;
  desc: string;
  context: string[];
  requiresLocation?: string;
}

export interface CommandGroup {
  label: string;
  commands: CommandDef[];
}

export const COMMAND_GROUPS: CommandGroup[] = [
  {
    label: 'Explore',
    commands: [
      { id: 'forage', icon: '🌿', label: 'Forage', desc: 'Gather food and herbs from the wild. Better tools improve results.', context: ['explore', 'camp'] },
      { id: 'farm', icon: '🌾', label: 'Farm', desc: 'Work nearby fields for grain and produce. A sickle helps.', context: ['explore', 'camp'] },
      { id: 'chop_wood', icon: '🪓', label: 'Chop Wood', desc: 'Gather timber for shelter and trade. A hatchet is required.', context: ['explore', 'camp'] },
      { id: 'mine_ore', icon: '⛏️', label: 'Mine Ore', desc: 'Extract ore and stone from rocky ground. A pickaxe is required.', context: ['explore', 'camp'] },
      { id: 'poi_enter', icon: '☠️', label: 'Venture In', desc: "Enter this dangerous place. A boss lurks inside — and treasure awaits the bold.", context: ['poi'] },
    ],
  },
  {
    label: 'Actions',
    commands: [
      { id: 'noticeboard', icon: '📋', label: 'Notice Board', desc: 'Read the local notice board for job postings, wanted notices, and news.', context: ['town'] },
    ],
  },
];

// ============================================
// LOCATION TIERS — populated at runtime by applyCanonicalWorld
// (maps settlement name → 'hamlet'|'village'|'town'|'city'|'capital'|'poi')
// ============================================
export const LOCATION_TIERS: Record<string, string> = {};

// ============================================
// CRAFTING RECIPES
// ============================================
export interface Recipe {
  id: string;
  type: 'alchemy' | 'cooking' | 'smithing' | 'enchanting';
  name: string;
  icon: string;
  ingredients: Array<{ item: string; qty: number }>;
  result: string;
  resultQty: number;
  minCraftLevel: number;
  locationTypeRequired?: string[];
  desc: string;
  xpReward: number;
}

export const RECIPES: Recipe[] = [
  // ---- ALCHEMY ----
  { id: "healing_salve", type: "alchemy", name: "Healing Salve", icon: "🩹", ingredients: [{ item: "Medicinal Herb", qty: 1 }, { item: "Healing Herb", qty: 1 }], result: "Health Potion", resultQty: 1, minCraftLevel: 1, desc: "A simple salve brewed from common herbs.", xpReward: 15 },
  { id: "healing_potion_2", type: "alchemy", name: "Healing Potion x2", icon: "🧪", ingredients: [{ item: "Healing Herb", qty: 2 }, { item: "Nightbloom", qty: 1 }], result: "Health Potion", resultQty: 2, minCraftLevel: 1, desc: "A double batch of restorative draught.", xpReward: 25 },
  { id: "antidote_2", type: "alchemy", name: "Antidote x2", icon: "💚", ingredients: [{ item: "Medicinal Herb", qty: 2 }, { item: "Bitter Root", qty: 1 }], result: "Antidote", resultQty: 2, minCraftLevel: 2, desc: "Purges poison from body and blood.", xpReward: 30 },
  { id: "strong_health_potion", type: "alchemy", name: "Strong Health Potion", icon: "💛", ingredients: [{ item: "Healing Herb", qty: 2 }, { item: "Nightbloom", qty: 2 }, { item: "Glowcap Mushroom", qty: 1 }], result: "Strong Health Potion", resultQty: 1, minCraftLevel: 3, desc: "A potent brew of rare herbs and mushroom extract.", xpReward: 45 },
  { id: "elixir_of_vigour", type: "alchemy", name: "Elixir of Vigour", icon: "✨", ingredients: [{ item: "Healing Herb", qty: 3 }, { item: "Glowcap Mushroom", qty: 2 }, { item: "Starweed", qty: 1 }], result: "Elixir of Vigour", resultQty: 1, minCraftLevel: 4, desc: "Fully restores HP and grants temporary resilience.", xpReward: 60 },
  // ---- COOKING ----
  { id: "iron_rations", type: "cooking", name: "Iron Rations", icon: "🥘", ingredients: [{ item: "Rations", qty: 1 }, { item: "Medicinal Herb", qty: 1 }], result: "Iron Rations", resultQty: 2, minCraftLevel: 1, desc: "Preserved trail food — last longer on the road.", xpReward: 15 },
  { id: "herb_broth", type: "cooking", name: "Herb Broth", icon: "🍵", ingredients: [{ item: "Rations", qty: 1 }, { item: "Medicinal Herb", qty: 2 }], result: "herb broth", resultQty: 1, minCraftLevel: 1, desc: "A nourishing camp broth. Heals and cleanses poison.", xpReward: 20 },
  { id: "mushroom_stew", type: "cooking", name: "Mushroom Stew", icon: "🍲", ingredients: [{ item: "Rations", qty: 1 }, { item: "Glowcap Mushroom", qty: 2 }], result: "mushroom stew", resultQty: 1, minCraftLevel: 2, desc: "Thick, earthy, and powerfully restorative.", xpReward: 30 },
  { id: "rangers_pottage", type: "cooking", name: "Ranger's Pottage", icon: "🍛", ingredients: [{ item: "Rations", qty: 2 }, { item: "Healing Herb", qty: 1 }, { item: "Glowcap Mushroom", qty: 1 }], result: "ranger's pottage", resultQty: 1, minCraftLevel: 3, desc: "A hearty camp meal that fully restores HP.", xpReward: 45 },
  // ---- SMITHING ----
  { id: "iron_sword", type: "smithing", name: "Iron Sword", icon: "⚔️", ingredients: [{ item: "Iron Ore", qty: 3 }, { item: "Firewood", qty: 1 }], result: "Iron Sword", resultQty: 1, minCraftLevel: 2, locationTypeRequired: ["town", "city", "capital"], desc: "A sturdy blade forged at a town smithy.", xpReward: 40 },
  { id: "iron_shield", type: "smithing", name: "Iron Shield", icon: "🛡️", ingredients: [{ item: "Iron Ore", qty: 3 }, { item: "Timber", qty: 1 }], result: "Iron Shield", resultQty: 1, minCraftLevel: 2, locationTypeRequired: ["town", "city", "capital"], desc: "A solid kite shield, good against most foes.", xpReward: 40 },
  { id: "chainmail", type: "smithing", name: "Chainmail", icon: "⛓️", ingredients: [{ item: "Iron Ore", qty: 5 }, { item: "Leather Scraps", qty: 2 }], result: "Chainmail", resultQty: 1, minCraftLevel: 3, locationTypeRequired: ["town", "city", "capital"], desc: "Interlocked iron rings, flexible and tough.", xpReward: 55 },
  { id: "ring_of_strength", type: "smithing", name: "Ring of Strength", icon: "💍", ingredients: [{ item: "Iron Ore", qty: 2 }, { item: "Ember Crystal", qty: 1 }], result: "Ring of Strength", resultQty: 1, minCraftLevel: 3, locationTypeRequired: ["town", "city", "capital"], desc: "A ring imbued with brute force — +2 STR.", xpReward: 50 },
  { id: "steel_sword", type: "smithing", name: "Steel Sword", icon: "⚔️", ingredients: [{ item: "Iron Ore", qty: 4 }, { item: "Shadow Ore", qty: 2 }, { item: "Firewood", qty: 2 }], result: "Steel Sword", resultQty: 1, minCraftLevel: 4, locationTypeRequired: ["town", "city", "capital"], desc: "A masterwork blade, sharper and more durable.", xpReward: 70 },
  // ---- ENCHANTING ----
  { id: "scroll_of_mending", type: "enchanting", name: "Scroll of Mending", icon: "📜", ingredients: [{ item: "Iron Ore", qty: 1 }, { item: "Glowcap Mushroom", qty: 2 }], result: "Scroll of Mending", resultQty: 1, minCraftLevel: 2, locationTypeRequired: ["city", "capital"], desc: "A healing scroll charged with restorative energy.", xpReward: 35 },
  { id: "scroll_of_fire", type: "enchanting", name: "Scroll of Fire", icon: "🔥", ingredients: [{ item: "Iron Ore", qty: 1 }, { item: "Ember Crystal", qty: 1 }, { item: "Glowcap Mushroom", qty: 1 }], result: "Scroll of Fire", resultQty: 1, minCraftLevel: 2, locationTypeRequired: ["city", "capital"], desc: "Unleashes a torrent of flame in battle.", xpReward: 35 },
  { id: "scroll_of_lightning", type: "enchanting", name: "Scroll of Lightning", icon: "⚡", ingredients: [{ item: "Iron Ore", qty: 2 }, { item: "Ember Crystal", qty: 1 }, { item: "Moonpetal", qty: 1 }], result: "Scroll of Lightning", resultQty: 1, minCraftLevel: 3, locationTypeRequired: ["city", "capital"], desc: "A crackling scroll of electrical discharge.", xpReward: 50 },
  { id: "ring_of_agility", type: "enchanting", name: "Ring of Agility", icon: "💍", ingredients: [{ item: "Iron Ore", qty: 2 }, { item: "Moonpetal", qty: 2 }], result: "Ring of Agility", resultQty: 1, minCraftLevel: 3, locationTypeRequired: ["city", "capital"], desc: "A slender ring that quickens the hands — +2 AGI.", xpReward: 50 },
  { id: "amulet_of_warding", type: "enchanting", name: "Amulet of Warding", icon: "📿", ingredients: [{ item: "Iron Ore", qty: 2 }, { item: "Ember Crystal", qty: 2 }, { item: "Moonpetal", qty: 1 }], result: "Amulet of Warding", resultQty: 1, minCraftLevel: 4, locationTypeRequired: ["city", "capital"], desc: "An amulet that bolsters magical resistance.", xpReward: 65 },
];

// ============================================
// NEW GAME PLUS PERKS
// ============================================
export interface NgPlusPerk {
  id: string;
  icon: string;
  name: string;
  desc: string;
}

export const NG_PLUS_PERKS: NgPlusPerk[] = [
  { id: "veterans_grit", icon: "🏋️", name: "Veteran's Grit", desc: "Maximum HP +25 permanently." },
  { id: "battle_scarred", icon: "🛡", name: "Battle Scarred", desc: "Take 10% less damage from all sources." },
  { id: "renowned", icon: "⭐", name: "Renowned", desc: "Start with +100 reputation." },
  { id: "connected", icon: "🤝", name: "Connected", desc: "Start with 200 faction XP across all factions." },
  { id: "survivor", icon: "💪", name: "Survivor", desc: "First death each run: no gold/gear/stat penalty." },
  { id: "loremaster", icon: "📚", name: "Loremaster", desc: "All XP gains +20%." },
  { id: "merchants_friend", icon: "💰", name: "Merchant's Friend", desc: "All shop prices 25% cheaper." },
  { id: "shadow_walker", icon: "👣", name: "Shadow Walker", desc: "Flee always succeeds; road ambush chance halved." },
];

// ============================================
// PATCH NOTES
// ============================================
export interface PatchNotesSection {
  title: string;
  items: string[];
}

export const PATCH_NOTES_VERSION = "0.3.1";
export const PATCH_NOTES_TITLE = "Minor Fixes";

export const PATCH_NOTES_SECTIONS: PatchNotesSection[] = [
  {
    title: "Added",
    items: [
      "Home button in the toolbar next to Logout — quickly return to the start page.",
    ],
  },
  {
    title: "Fixed",
    items: [
      "Main quest type tags now display correctly as MAIN instead of defaulting to SIDE.",
    ],
  },
];

// ============================================
// FACTION DEFINITIONS
// ============================================
export interface FactionDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  group: 'class' | 'world';
  forClass?: string;
  desc: string;
  rankAbilities: Record<number, string>;
  rankRewards: Record<number, string>;
}

export const FACTIONS: Record<string, FactionDef> = {
  iron_conclave: {
    id: 'iron_conclave',
    name: 'The Iron Conclave',
    icon: '⚔️',
    color: '#b06030',
    group: 'class',
    forClass: 'Warrior',
    desc: 'A brotherhood of elite mercenaries and battle-hardened knights. Honour, strength and coin drive them.',
    rankAbilities: { 2: 'War Cry', 5: 'Unbreakable' },
    rankRewards: { 1: 'Discounted weapon repairs', 3: 'Access to Conclave armourers', 4: 'Elite contract missions' },
  },
  shadowmere_guild: {
    id: 'shadowmere_guild',
    name: 'The Shadowmere Guild',
    icon: '🗡️',
    color: '#6040a0',
    group: 'class',
    forClass: 'Rogue',
    desc: 'A web of spies, thieves and assassins operating from the shadows. Information is their true currency.',
    rankAbilities: { 2: 'Shadow Step', 5: 'Death Mark' },
    rankRewards: { 1: 'Access to black market', 3: 'Safe house network', 4: 'Guild contract assassinations' },
  },
  ember_circle: {
    id: 'ember_circle',
    name: 'The Ember Circle',
    icon: '🔥',
    color: '#c04020',
    group: 'class',
    forClass: 'Mage',
    desc: 'Scholars of destructive arcane fire. They seek power through knowledge and will burn anything in their way.',
    rankAbilities: { 2: 'Flame Shield', 5: 'Meteor' },
    rankRewards: { 1: 'Discounted spell scrolls', 3: "Circle's arcane library", 4: 'Experimental fire rituals' },
  },
  silver_hand: {
    id: 'silver_hand',
    name: 'The Silver Hand',
    icon: '✨',
    color: '#d0c060',
    group: 'class',
    forClass: 'Cleric',
    desc: 'A holy order of paladins and healers devoted to justice and the light. Their mercy has limits.',
    rankAbilities: { 2: 'Holy Aura', 5: 'Resurrection' },
    rankRewards: { 1: 'Free healing at temples', 3: 'Holy relics access', 4: 'Paladin escort missions' },
  },
  thornwood_druids: {
    id: 'thornwood_druids',
    name: 'The Thornwood Druids',
    icon: '🌿',
    color: '#3a8040',
    group: 'world',
    desc: 'Ancient guardians of forest and wild places. They speak to nature and remember things long forgotten.',
    rankAbilities: { 2: "Nature's Veil", 5: 'Call of the Wild' },
    rankRewards: { 1: 'Forest safe passage', 3: 'Ancient nature lore', 4: 'Druidic shapeshifting secrets' },
  },
  merchants_compact: {
    id: 'merchants_compact',
    name: "The Merchant's Compact",
    icon: '🪙',
    color: '#c0a030',
    group: 'world',
    desc: 'A powerful guild of traders and bankers. They own information and infrastructure across Aethermoor.',
    rankAbilities: { 2: 'Silver Tongue', 5: 'Trade Empire' },
    rankRewards: { 1: '10% shop discount', 3: 'Trade route intelligence', 4: 'Private banking & loans' },
  },
  crowns_watch: {
    id: 'crowns_watch',
    name: "The Crown's Watch",
    icon: '👑',
    color: '#8080d0',
    group: 'world',
    desc: 'Agents of the Capital throne — law enforcers, tax collectors, and spies for the ruling power.',
    rankAbilities: { 2: 'Authority', 5: 'Royal Decree' },
    rankRewards: { 1: 'Legal immunity in towns', 3: 'Crown intelligence briefings', 4: 'Noble title recognition' },
  },
  the_forgotten: {
    id: 'the_forgotten',
    name: 'The Forgotten',
    icon: '💀',
    color: '#706060',
    group: 'world',
    desc: 'Rebels, outcasts and those the system abandoned. They fight from the margins and know every secret way.',
    rankAbilities: { 2: 'Street Smarts', 5: 'Ghost' },
    rankRewards: { 1: 'Underground network access', 3: 'Rebel safe routes', 4: 'Off-books contracts' },
  },
  arcane_academy: {
    id: 'arcane_academy',
    name: 'The Arcane Academy',
    icon: '📚',
    color: '#5070c0',
    group: 'world',
    desc: 'The oldest seat of magical learning on the continent. They hoard knowledge and trade in secrets.',
    rankAbilities: { 2: 'Arcane Insight', 5: 'Forbidden Knowledge' },
    rankRewards: { 1: "Access to Academy library", 3: 'Rare spell components', 4: 'Experimental magic rituals' },
  },
  sea_wolves: {
    id: 'sea_wolves',
    name: 'The Sea Wolves',
    icon: '🌊',
    color: '#3080a0',
    group: 'world',
    desc: 'A brotherhood of sailors, smugglers and coastal raiders. They know every port and every tide.',
    rankAbilities: { 2: 'Sea Legs', 5: "Corsair's Gambit" },
    rankRewards: { 1: 'Coastal fast travel', 3: 'Smuggler routes', 4: 'Privateer ship access' },
  },
};

// ============================================
// FACTION JOIN OFFERS
// ============================================
export interface FactionJoinOffer {
  title: string;
  icon: string;
  pitch: string;
  pitchDeclined?: string;
  gift: string;
  giftDesc: string;
  rival?: string;
  rivalNote?: string;
}

export const FACTION_JOIN_OFFERS: Record<string, FactionJoinOffer> = {
  iron_conclave: {
    title: 'The Iron Conclave Calls',
    icon: '⚔️',
    pitch: "You have fought with distinction. The Iron Conclave does not invite weaklings — we invite those who bleed well and keep standing. Swear your blade to the brotherhood and you will never fight alone again. Coin, steel, and honour await those who earn their place.",
    gift: 'Iron Conclave Signet',
    giftDesc: "A heavy iron ring bearing the Conclave's crest. Merchants offer you credit. Guards step aside.",
    rival: 'shadowmere_guild',
    rivalNote: 'The Shadowmere Guild will view you with contempt — they despise those who fight in the open.',
  },
  shadowmere_guild: {
    title: 'A Shadow Extends Its Hand',
    icon: '🗡️',
    pitch: "You move well. Notice things others miss. The Guild has been watching — we watch everyone, but we watch you with interest. There are no oaths here, no brotherhood speeches. Just work, coin, and the understanding that what you know stays known only to us.",
    gift: 'Shadowmere Calling Card',
    giftDesc: 'A black card with no markings. Show it in any dark corner of Aethermoor and doors open.',
    rival: 'crowns_watch',
    rivalNote: "The Crown's Watch will regard you as a criminal organisation's asset.",
  },
  ember_circle: {
    title: 'The Circle Opens',
    icon: '🔥',
    pitch: "Power is not given. It is taken, earned, burned for. The Ember Circle does not recruit the timid — we take those who already have fire in them and teach them to make it obey. Join us and you will touch the kind of power that frightens other mages.",
    gift: "Ember Initiate's Focus",
    giftDesc: "A shard of the Circle's eternal flame sealed in glass. INT +1 while carried.",
    rival: 'silver_hand',
    rivalNote: 'The Silver Hand considers the Ember Circle dangerously reckless with arcane power.',
  },
  silver_hand: {
    title: 'The Light Calls You',
    icon: '✨',
    pitch: "We have seen what you carry — not a weapon, but a purpose. The Silver Hand does not seek power for its own sake. We seek those willing to stand between the innocent and the dark. It is a harder road than most choose. But you are not most.",
    gift: 'Silver Hand Medallion',
    giftDesc: 'A small silver disc blessed by the Order. Grants free healing at any Silver Hand temple.',
    rival: 'ember_circle',
    rivalNote: 'The Ember Circle considers the Silver Hand naive and dangerously pious.',
  },
  thornwood_druids: {
    title: 'The Forest Speaks Your Name',
    icon: '🌿',
    pitch: "The trees have been whispering about you. Not all who walk the wild are welcome — the forest chooses. You have been chosen. We ask nothing but that you listen, protect, and remember. The old ways ask for patience, not oaths. Will you hear them?",
    gift: 'Thornwood Seedling',
    giftDesc: 'A living seedling from the sacred grove. It grows wherever you plant it and marks you as a friend of the wild.',
    rival: 'arcane_academy',
    rivalNote: 'The Arcane Academy sees the Druids as superstitious obstacles to magical progress.',
  },
  merchants_compact: {
    title: 'A Profitable Arrangement',
    icon: '🪙',
    pitch: "We are direct people, so here it is directly: you are useful to us and we are useful to you. The Compact does not ask for loyalty — we ask for business. Join our network and every merchant in Aethermoor becomes your ally. Doors open. Prices drop. Information flows. Shall we deal?",
    gift: 'Compact Letter of Credit',
    giftDesc: 'A sealed letter worth 50 gold at any Compact-affiliated merchant. Also grants a permanent 10% discount.',
    rival: 'the_forgotten',
    rivalNote: 'The Forgotten see the Compact as exploiters of the poor.',
  },
  crowns_watch: {
    title: "The Crown Sees Your Value",
    icon: '👑',
    pitch: "Order is not glamorous work. It is thankless, dangerous, and essential. The Crown's Watch needs agents who can handle the grey areas — the situations where the law needs a sharp mind rather than just a sharp sword. We offer authority, access, and the full weight of the Crown behind you.",
    gift: "Crown's Watch Warrant Card",
    giftDesc: "An official warrant granting legal authority throughout Aethermoor's settlements.",
    rival: 'shadowmere_guild',
    rivalNote: 'The Shadowmere Guild will consider you a direct threat to their operations.',
  },
  the_forgotten: {
    title: "You've Been Found by the Lost",
    icon: '💀',
    pitch: "No speeches here. No ceremony. You know what it's like to be outside the walls looking in — otherwise you wouldn't be talking to us. The Forgotten don't ask for your name or your past. Just your answer: are you with the ones who got left behind, or are you with the ones who did the leaving?",
    pitchDeclined: "You've said no to the ones with titles and banners. Interesting. The Forgotten don't ask for your name or your past — just whether you're done pretending the system has a place for you.",
    gift: "Forgotten's Mark",
    giftDesc: 'A scratched symbol on your wrist. Beggars share their food. Outcasts share their secrets. The underground opens.',
    rival: 'crowns_watch',
    rivalNote: "The Crown's Watch will flag you as a known associate of subversive elements.",
  },
  arcane_academy: {
    title: 'The Academy Extends Consideration',
    icon: '📚',
    pitch: "We do not recruit — we accept applications. You have, through your actions, demonstrated sufficient aptitude that the Academy is willing to consider formal affiliation. This is not an honour we bestow lightly. In return for access to our archives, you will contribute to the advancement of knowledge. Is that agreeable?",
    gift: 'Academy Research Pass',
    giftDesc: "A stamped pass granting access to the Academy's public archives. Scholars treat you as a peer.",
    rival: 'thornwood_druids',
    rivalNote: 'The Thornwood Druids distrust the Academy\'s approach to natural magic.',
  },
  sea_wolves: {
    title: 'The Wolves Circle',
    icon: '🌊',
    pitch: "We don't recruit on land — bad omen. But you're here, and the sea hasn't killed you yet, so maybe you're worth something. The Wolves don't want followers. We want crew. Pull your weight, keep your mouth shut about what you see, and you'll never want for a berth or a blade-at-your-back again. What do you say?",
    gift: 'Sea Wolves Token',
    giftDesc: "A carved wolf's tooth on a cord. Shows at any port for free passage, cheap lodging, and crew solidarity.",
    rival: 'merchants_compact',
    rivalNote: "The Merchant's Compact views the Sea Wolves as pirates undercutting legitimate trade.",
  },
};

// ============================================
// TIERED GEAR (level-gated shop items)
// ============================================
export interface TieredGearItem {
  id: string;
  name: string;
  icon: string;
  shopTier: string;
  price: number;
  minLevel: number;
  gearTier: number;
  slot: string;
  desc: string;
}

export const TIERED_GEAR: TieredGearItem[] = [
  // ── Tier 2 Steel (level 5+) ──
  { id: 'steel_shield',    name: 'Steel Shield',    icon: '🛡️', shopTier: 'uncommon', price: 140, minLevel: 5,  gearTier: 2, slot: 'offhand', desc: 'Reinforced steel shield. Solid protection for the road-hardened adventurer.' },
  { id: 'hunting_bow',     name: 'Hunting Bow',     icon: '🏹', shopTier: 'uncommon', price: 90,  minLevel: 5,  gearTier: 2, slot: 'weapon',  desc: 'A well-crafted hunting bow. AGI-based ranged combat.' },
  { id: 'war_hammer',      name: 'War Hammer',      icon: '🔨', shopTier: 'uncommon', price: 110, minLevel: 5,  gearTier: 2, slot: 'weapon',  desc: 'A heavy hammer favoured by warriors and clerics alike.' },
  { id: 'silver_amulet',   name: 'Silver Amulet',   icon: '📿', shopTier: 'uncommon', price: 80,  minLevel: 5,  gearTier: 2, slot: 'accessory', desc: 'A finely worked silver amulet. Modest magical protection.' },
  // ── Tier 3 Enchanted (level 10+, city+) ──
  { id: 'enchanted_blade', name: 'Enchanted Blade', icon: '⚔️', shopTier: 'rare',     price: 280, minLevel: 10, gearTier: 3, slot: 'weapon',  desc: 'A blade humming with arcane energy. Strikes true against magical creatures.' },
  { id: 'mage_robes',      name: 'Mage Robes',      icon: '👘', shopTier: 'rare',     price: 220, minLevel: 10, gearTier: 3, slot: 'body',    desc: 'Robes woven with protective sigils. Boosts INT and spell resistance.' },
  { id: 'tower_shield',    name: 'Tower Shield',    icon: '🛡️', shopTier: 'rare',     price: 260, minLevel: 10, gearTier: 3, slot: 'offhand', desc: 'A massive tower shield. Near-impenetrable physical defence.' },
  { id: 'enchanted_ring',  name: 'Ring of Power',   icon: '💍', shopTier: 'rare',     price: 200, minLevel: 10, gearTier: 3, slot: 'accessory', desc: 'A ring crackling with contained magic. Significant stat boost.' },
  { id: 'battle_axe',      name: 'Battle Axe',      icon: '🪓', shopTier: 'rare',     price: 240, minLevel: 10, gearTier: 3, slot: 'weapon',  desc: 'A two-handed axe of exceptional quality. Devastating STR-based damage.' },
  // ── Tier 4 Masterwork (level 15+, capital+) ──
  { id: 'masterwork_sword',  name: 'Masterwork Sword',  icon: '⚔️', shopTier: 'legendary', price: 450, minLevel: 15, gearTier: 4, slot: 'weapon',  desc: 'A blade of unparalleled craftsmanship. The finest non-magical weapon made.' },
  { id: 'voidsteel_armour',  name: 'Voidsteel Armour',  icon: '⛓',  shopTier: 'legendary', price: 600, minLevel: 15, gearTier: 4, slot: 'body',    desc: 'Armour forged from fallen star metal. Light as leather, strong as stone.' },
  { id: 'archmage_staff',    name: 'Archmage Staff',    icon: '🪄', shopTier: 'legendary', price: 520, minLevel: 15, gearTier: 4, slot: 'weapon',  desc: 'A staff of tremendous power. Greatly amplifies all magical ability.' },
  { id: 'obsidian_shield',   name: 'Obsidian Shield',   icon: '🛡️', shopTier: 'legendary', price: 480, minLevel: 15, gearTier: 4, slot: 'offhand', desc: 'Shield carved from volcanic glass. Absorbs and reflects magic.' },
];

// ============================================
// FACTION GEAR SETS
// ============================================
export interface FactionSetDef {
  name: string;
  faction: string;
  pieces: string[];
  slots: string[];
  icons: string[];
  bonus2: Record<string, number>;
  bonus2label: string;
  bonus3: Record<string, number>;
  bonus3label: string;
  ability3: string;
}

export const FACTION_SETS: Record<string, FactionSetDef> = {
  iron_conclave: {
    name: "Warlord's Regalia",
    faction: 'The Iron Conclave',
    pieces: ["War Helm", "Warlord's Plate", "Champion's Pauldrons"],
    slots: ['head', 'body', 'offhand'],
    icons: ['⛑️', '🛡️', '💪'],
    bonus2: { str: 6 },
    bonus2label: '+6 STR',
    bonus3: { str: 12 },
    bonus3label: '+12 STR, War Hardened (−20% damage)',
    ability3: 'War Hardened',
  },
  shadowmere_guild: {
    name: "Shadowmere's Embrace",
    faction: 'The Shadowmere Guild',
    pieces: ['Shadow Hood', 'Shadowmere Cloak', 'Shadow Boots'],
    slots: ['head', 'body', 'feet'],
    icons: ['🪖', '🧥', '👢'],
    bonus2: { agi: 6 },
    bonus2label: '+6 AGI',
    bonus3: { agi: 12 },
    bonus3label: '+12 AGI, Ghost Step (first strike always crits)',
    ability3: 'Ghost Step',
  },
  ember_circle: {
    name: 'Emberweave Regalia',
    faction: 'The Ember Circle',
    pieces: ['Ember Staff', 'Ember Robes', "Ember Focus"],
    slots: ['weapon', 'body', 'accessory'],
    icons: ['🔥', '👘', '🔮'],
    bonus2: { int: 6 },
    bonus2label: '+6 INT',
    bonus3: { int: 12, wil: 4 },
    bonus3label: '+12 INT +4 WIL, Arcane Surge (spells never miss)',
    ability3: 'Arcane Surge',
  },
  silver_hand: {
    name: "Paladin's Blessing",
    faction: 'The Silver Hand',
    pieces: ['Holy Mace', 'Vestments of Light', 'Sigil of the Hand'],
    slots: ['weapon', 'body', 'accessory'],
    icons: ['🔨', '✨', '🌟'],
    bonus2: { wil: 6 },
    bonus2label: '+6 WIL',
    bonus3: { wil: 12, str: 4 },
    bonus3label: '+12 WIL +4 STR, Divine Grace (+5 HP each turn)',
    ability3: 'Divine Grace',
  },
  thornwood_druids: {
    name: 'Thornwood Garb',
    faction: 'The Thornwood Druids',
    pieces: ['Antler Crown', 'Thornwood Leathers', 'Root Boots'],
    slots: ['head', 'body', 'feet'],
    icons: ['🦌', '🌿', '👡'],
    bonus2: { agi: 4, wil: 3 },
    bonus2label: '+4 AGI +3 WIL',
    bonus3: { agi: 10, wil: 6 },
    bonus3label: "+10 AGI +6 WIL, Nature's Wrath (beasts never attack)",
    ability3: "Nature's Wrath",
  },
  merchants_compact: {
    name: "Magnate's Finery",
    faction: "The Merchant's Compact",
    pieces: ["Merchant's Ring", 'Compact Coat', 'Gold-Threaded Boots'],
    slots: ['accessory', 'body', 'feet'],
    icons: ['💍', '🧥', '👢'],
    bonus2: { str: 2, agi: 2, int: 2, wil: 2 },
    bonus2label: '+2 all stats',
    bonus3: { str: 8, agi: 8, int: 8, wil: 8 },
    bonus3label: '+8 all stats, Trade Empire (buy anything at half price)',
    ability3: 'Trade Empire',
  },
  crowns_watch: {
    name: 'Regalia of the Crown',
    faction: "The Crown's Watch",
    pieces: ['Crown Sword', 'Royal Armour', "Warden's Badge"],
    slots: ['weapon', 'body', 'accessory'],
    icons: ['⚔️', '🛡️', '👑'],
    bonus2: { str: 4, wil: 4 },
    bonus2label: '+4 STR +4 WIL',
    bonus3: { str: 8, wil: 8 },
    bonus3label: '+8 STR +8 WIL, Royal Decree (all guards are allies)',
    ability3: 'Royal Decree',
  },
  the_forgotten: {
    name: "Outcast's Edge",
    faction: 'The Forgotten',
    pieces: ['Rebel Blade', 'Ragged Cloak', 'Broken Crown'],
    slots: ['weapon', 'body', 'head'],
    icons: ['🗡️', '🧥', '👑'],
    bonus2: { agi: 4, str: 4 },
    bonus2label: '+4 AGI +4 STR',
    bonus3: { agi: 10, str: 8 },
    bonus3label: '+10 AGI +8 STR, Ghost (cannot be tracked or ambushed)',
    ability3: 'Ghost',
  },
  arcane_academy: {
    name: "Archon's Vestments",
    faction: 'The Arcane Academy',
    pieces: ["Archon's Staff", 'Robes of the Academy', "Scholar's Ring"],
    slots: ['weapon', 'body', 'accessory'],
    icons: ['🪄', '📚', '💍'],
    bonus2: { int: 6, wil: 3 },
    bonus2label: '+6 INT +3 WIL',
    bonus3: { int: 14, wil: 6 },
    bonus3label: '+14 INT +6 WIL, Forbidden Knowledge (auto-identify items)',
    ability3: 'Forbidden Knowledge',
  },
  sea_wolves: {
    name: "Corsair's Regalia",
    faction: 'The Sea Wolves',
    pieces: ["Corsair's Cutlass", 'Wolf Coat', "Navigator's Compass"],
    slots: ['weapon', 'body', 'accessory'],
    icons: ['⚔️', '🧥', '🧭'],
    bonus2: { agi: 4, str: 4 },
    bonus2label: '+4 AGI +4 STR',
    bonus3: { agi: 10, str: 6 },
    bonus3label: '+10 AGI +6 STR, Sea Legs (never ambushed travelling)',
    ability3: 'Sea Legs',
  },
};

// ============================================
// FACTION RANK GEAR (gear unlocked by rank)
// ============================================
export const FACTION_RANK_GEAR: Record<string, Record<number, string>> = {
  iron_conclave:    { 3: "Champion's Pauldrons", 4: 'War Helm' },
  shadowmere_guild: { 3: 'Shadow Boots',         4: 'Shadow Hood' },
  ember_circle:     { 3: 'Ember Focus',           4: 'Ember Robes' },
  silver_hand:      { 3: 'Sigil of the Hand',     4: 'Vestments of Light' },
  thornwood_druids: { 3: 'Root Boots',            4: 'Antler Crown' },
  merchants_compact:{ 3: 'Gold-Threaded Boots',   4: "Merchant's Ring" },
  crowns_watch:     { 3: "Warden's Badge",        4: 'Royal Armour' },
  the_forgotten:    { 3: 'Broken Crown',           4: 'Ragged Cloak' },
  arcane_academy:   { 3: "Scholar's Ring",         4: 'Robes of the Academy' },
  sea_wolves:       { 3: "Navigator's Compass",    4: 'Wolf Coat' },
};

// ============================================
// CONCEALED & PROTECTED ITEMS
// ============================================

// Items that cannot be detected or pickpocketed
export const CONCEALED_ITEMS: ReadonlySet<string> = new Set([
  'Iron Conclave Signet', 'Shadowmere Calling Card', "Ember Initiate's Focus",
  'Silver Hand Medallion', 'Thornwood Seedling', 'Compact Letter of Credit',
  "Crown's Watch Warrant Card", "Forgotten's Mark", 'Academy Research Pass', 'Sea Wolves Token',
  'Shadowmere Cloak',
]);

// Items that can never be dropped (faction gifts, rank gear, quest tokens)
export const PROTECTED_ITEMS: ReadonlySet<string> = new Set([
  'Iron Conclave Signet', 'Shadowmere Calling Card', "Ember Initiate's Focus",
  'Silver Hand Medallion', 'Thornwood Seedling', 'Compact Letter of Credit',
  "Crown's Watch Warrant Card", "Forgotten's Mark", 'Academy Research Pass', 'Sea Wolves Token',
  "Champion's Pauldrons", 'War Helm', 'Shadow Boots', 'Shadow Hood',
  'Ember Focus', 'Ember Robes', 'Sigil of the Hand', 'Vestments of Light',
  'Root Boots', 'Antler Crown', 'Gold-Threaded Boots', "Merchant's Ring",
  "Warden's Badge", 'Royal Armour', 'Broken Crown', 'Ragged Cloak',
  "Scholar's Ring", 'Robes of the Academy', "Navigator's Compass", 'Wolf Coat',
  'Shadowmere Cloak',
]);

export const CMD_MESSAGES: Record<string, string> = {
  go_north: 'I head north.',
  go_south: 'I head south.',
  go_east: 'I head east.',
  go_west: 'I head west.',
  look: 'I stop and carefully look around, taking in every detail of my surroundings.',
  search: 'I search the area thoroughly, looking for anything hidden, useful, or unusual.',
  forage: 'I forage carefully for edible plants, herbs, and useful supplies in the nearby wild.',
  farm: 'I look for nearby fields and work the land to gather useful crops.',
  chop_wood: 'I gather timber from nearby trees for shelter and supplies.',
  mine_ore: 'I search rocky ground and mine for ore and useful stone.',
  listen: 'I stand still and listen carefully to everything around me.',
  enter: 'I enter the building or location in front of me.',
  talk: 'I approach someone nearby and strike up a conversation.',
  ask: 'I ask about any rumours, news, or points of interest in this area.',
  barter: 'I look for a merchant to trade with.',
  noticeboard: "I walk over to the notice board and read what's posted.",
  rest: 'I find a safe spot and rest to recover my strength.',
  camp: 'I make camp for the night, building a small fire.',
  pray: 'I take a moment to pray / meditate, focusing my inner strength.',
  use_item: 'I reach into my pack and use an item.',
  quests: 'I review my active quests and objectives, thinking about what to do next.',
  dungeon: 'I seek out the entrance to the Dungeon of Echoes beneath the Capital and prepare to descend.',
  descend: 'I descend the stairs to the next floor of the dungeon, deeper into the dark.',
  ascend: 'I climb back up toward the surface, leaving the dungeon behind.',
  inspect: 'I take a close look at something interesting nearby.',
  attack: 'I attack!',
  ability: 'I use my special ability!',
  defend: 'I take a defensive stance, bracing for the next attack.',
  flee: 'I turn and run, trying to escape the fight!',
};

