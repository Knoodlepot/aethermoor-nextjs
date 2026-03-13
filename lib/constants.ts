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
// CONSUMABLE EFFECTS
// ============================================
export const CONSUMABLE_EFFECTS = {
  "health potion": { hp: 30, msg: "You drink the Health Potion. +30 HP." },
  "strong health potion": { hp: 60, msg: "You drink the Strong Health Potion. +60 HP." },
  "elixir of vigour": { hpFull: true, msg: "You drink the Elixir of Vigour. HP fully restored!" },
  ambrosia: {
    hpFull: true,
    str: 5,
    agi: 5,
    int: 5,
    wil: 5,
    msg: "You consume the Ambrosia. HP restored and all stats +5 temporarily!",
  },
  "mana potion": { wil: 1, msg: "You drink the Mana Potion. +1 WIL (arcane energy restored)." },
  antidote: { msg: "You drink the Antidote. Poison neutralised." },
  "travel bread": { hp: 8, msg: "You eat the Travel Bread. +8 HP." },
  rations: { hp: 15, msg: "You eat the Rations. +15 HP." },
  "rations x3": { hp: 15, msg: "You eat some Rations. +15 HP." },
  "rations x2": { hp: 15, msg: "You eat some Rations. +15 HP." },
  "rations x1": { hp: 15, msg: "You eat the last of your Rations. +15 HP." },
  "dried meat": { hp: 12, msg: "You eat the Dried Meat. +12 HP." },
  "trail bread": { hp: 8, msg: "You chew through the Trail Bread. +8 HP." },
  "iron rations": { hp: 20, msg: "You eat the Iron Rations. +20 HP." },
  "medicinal herb": { hp: 20, clearPoison: true, msg: "You apply the Medicinal Herb. +20 HP. Poison cleansed." },
  "rare mushroom": { hp: 35, msg: "The Rare Mushroom restores you significantly. +35 HP." },
  "healing herb": { hp: 5, msg: "You chew the Healing Herb. +5 HP." },
  "scroll of fire": { msg: "You read the Scroll of Fire. It crumbles to ash — the spell is cast!" },
  "scroll of mending": { hp: 40, msg: "You read the Scroll of Mending. +40 HP." },
  "scroll of lightning": { msg: "You read the Scroll of Lightning. It crumbles to ash — the spell is cast!" },
  "herb broth": { hp: 25, clearPoison: true, msg: "You drink the Herb Broth. +25 HP. Poison cleansed." },
  "mushroom stew": { hp: 45, msg: "You eat the Mushroom Stew. +45 HP." },
  "ranger's pottage": { hpFull: true, msg: "You eat the Ranger's Pottage. HP fully restored." },
} as const;

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
    label: 'Move',
    commands: [
      { id: 'go_north', icon: '⬆', label: 'North', desc: 'Head north — deeper into whatever lies that way.', context: ['explore', 'town', 'camp'] },
      { id: 'go_south', icon: '⬇', label: 'South', desc: 'Turn south and travel in that direction.', context: ['explore', 'town', 'camp'] },
      { id: 'go_east', icon: '➡', label: 'East', desc: 'Set off eastward along the road or terrain.', context: ['explore', 'town', 'camp'] },
      { id: 'go_west', icon: '⬅', label: 'West', desc: 'Make your way west, watching the path ahead.', context: ['explore', 'town', 'camp'] },
    ],
  },
  {
    label: 'Explore',
    commands: [
      { id: 'search', icon: '🔍', label: 'Search', desc: 'Hunt for hidden items, forage for food/herbs in the wild, or seek clues and secret passages.', context: ['explore', 'town', 'camp'] },
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
  {
    label: 'Combat',
    commands: [
      { id: 'attack', icon: '⚔️', label: 'Attack', desc: 'Strike at your enemy with your weapon. STR or AGI determines your damage.', context: ['combat'] },
      { id: 'ability', icon: '✨', label: 'Ability', desc: 'Use your class ability — a powerful move that can turn the tide of battle.', context: ['combat'] },
      { id: 'defend', icon: '🛡', label: 'Defend', desc: 'Take a defensive stance. Reduce incoming damage and wait for an opening.', context: ['combat'] },
      { id: 'flee', icon: '💨', label: 'Flee', desc: 'Turn and run! Your AGI determines whether you escape. Cowardly but sometimes wise.', context: ['combat'] },
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

export const PATCH_NOTES_VERSION = "0.3.0";
export const PATCH_NOTES_TITLE = "Skill Trees";

export const PATCH_NOTES_SECTIONS: PatchNotesSection[] = [
  {
    title: "New — Skill Trees",
    items: [
      "Each class now has a unique skill tree with 9 unlockable abilities across 3 tiers.",
      "Earn +1 Skill Point every time you level up — open the Skills button to spend it.",
      "Tiers unlock based on your class's primary stat: Tier 1 at 8, Tier 2 at 14, Tier 3 at 20.",
      "Warriors: Iron Skin → Crushing Blow → Berserker Rage and more.",
      "Rogues: Shadowstep → Blade Dance → Master Thief (doubles all gold earned).",
      "Mages: Arcane Surge → Chain Lightning → Archmage's Will and more.",
      "Clerics: Healing Light → Smite Evil → Resurrection Light (survive death once per dungeon).",
      "Mastery-tier skills (T3) change how the world reacts to you — the narrator notices.",
    ],
  },
  {
    title: "Changed",
    items: [
      "Level-up now grants +1 Skill Point alongside the existing +3 Stat Points.",
    ],
  },
];

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

