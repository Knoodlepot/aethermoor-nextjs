// XP thresholds for levels 1–20 (cumulative total XP required)
export const XP_TABLE = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10500] as const;
export const LEVEL_CAP = 20;

/** Return level (1–20) for a given cumulative XP total. */
export function xpToLevel(xp: number): number {
  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (xp >= XP_TABLE[i]) return i + 1;
  }
  return 1;
}

/** Max HP gained per level-up, by class. */
export const HP_PER_LEVEL: Record<string, number> = {
  Warrior: 10,
  Cleric: 7,
  Rogue: 5,
  Mage: 3,
};

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Clamp a number between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
import type { Player, NPC, WorldSeed } from './types';
import { ITEM_INFO, CONSUMABLE_EFFECTS, DISGUISED_ITEMS, ITEM_STAT_BONUSES, EQUIP_SLOTS, LOCATION_TIERS, TIERED_GEAR } from './constants';

/**
 * Advance game time by hours, handling day wraparound
 */
export function advanceGameTime(player: Player, hours: number): Player {
  const total = (player.gameHour || 8) + hours;
  const dayInc = Math.floor(total / 24);
  const newHour = Math.round((total % 24) * 2) / 2; // round to nearest 0.5

  return {
    ...player,
    gameHour: newHour,
    gameDay: (player.gameDay || 1) + dayInc,
  };
}

/**
 * Format game time for display (12-hour format with period)
 */
export function formatGameTime(gameHour: number = 8, gameDay: number = 1) {
  const h = Math.floor(gameHour);
  const m = gameHour % 1 >= 0.5 ? '30' : '00';
  const period =
    h < 6 ? 'Night'
      : h < 12 ? 'Morning'
      : h < 17 ? 'Afternoon'
      : h < 21 ? 'Evening'
      : 'Night';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const ampm = h < 12 ? 'am' : 'pm';

  return {
    time: `${h12}:${m}${ampm}`,
    period,
    day: gameDay,
    fullDisplay: `Day ${gameDay}, ${h12}:${m}${ampm} [${period}]`,
  };
}

/**
 * Register new NPC or update existing one
 */
export function registerNpc(
  player: Player,
  npcData: Partial<NPC>
): Player {
  const existing = (player.knownNpcs || []).find(
    (n) => n.name.toLowerCase() === npcData.name?.toLowerCase()
  );

  if (existing) {
    const updated = {
      ...existing,
      ...npcData,
    };
    return {
      ...player,
      knownNpcs: (player.knownNpcs || []).map((n) =>
        n.name.toLowerCase() === npcData.name?.toLowerCase() ? updated : n
      ),
    };
  }

  const newNpc: NPC = {
    name: npcData.name || 'Unknown',
    role: npcData.role || 'Unknown',
    relationship: npcData.relationship || 'neutral',
    notes: npcData.notes || '',
    questGiver: npcData.questGiver || false,
    metDay: player.gameDay || 1,
    metHour: player.gameHour || 8,
    travelDestination: npcData.travelDestination,
    travelArrivesDay: npcData.travelArrivesDay,
    travelArrivesHour: npcData.travelArrivesHour,
    lastInteractionNotes: npcData.lastInteractionNotes,
  };

  let roster = [...(player.knownNpcs || []), newNpc];

  // Limit roster to 20, dropping non-quest-givers first
  if (roster.length > 20) {
    const dropIdx = roster.findIndex((n) => !n.questGiver);
    if (dropIdx >= 0) {
      roster.splice(dropIdx, 1);
    }
  }

  return {
    ...player,
    knownNpcs: roster,
  };
}

/**
 * Prune bestiary to 50 entries (always keep veteran/boss tier)
 */
export function pruneBestiary(player: Player): Player {
  const bestiary = player.bestiary || [];

  if (bestiary.length <= 50) {
    return player;
  }

  // Keep all veteran (2) and boss (3) tiers
  const vipEnemies = bestiary.filter((e) => e.tier >= 2);

  // Sort by lastKilledDay descending, take top (50 - vipCount)
  const others = bestiary
    .filter((e) => e.tier < 2)
    .sort((a, b) => (b.lastKilledDay || 0) - (a.lastKilledDay || 0))
    .slice(0, Math.max(0, 50 - vipEnemies.length));

  return {
    ...player,
    bestiary: [...vipEnemies, ...others],
  };
}

/**
 * Get profession level (1-5)
 */
export function getProfessionLevel(professions: Record<string, any> = {}, profName: string): number {
  const prof = professions[profName];
  if (!prof || !prof.level) return 0;
  return Math.min(5, prof.level);
}

/**
 * Get profession XP for current level
 */
export function getProfessionXp(professions: Record<string, any> = {}, profName: string): number {
  const prof = professions[profName];
  return prof?.xp || 0;
}

/**
 * Add profession XP with auto-levelup at thresholds
 */
export function addProfessionXp(
  professions: Record<string, any> = {},
  profName: string,
  amount: number
): Record<string, any> {
  const prof = professions[profName] || { level: 0, xp: 0 };
  let { level, xp } = prof;

  xp += amount;

  // Level up thresholds: 50, 150, 300, 500, 800 XP
  const thresholds = [50, 150, 300, 500, 800];
  while (level < 5 && xp >= thresholds[level]) {
    xp -= thresholds[level];
    level++;
  }

  return {
    ...professions,
    [profName]: { level: Math.min(5, level), xp },
  };
}

/**
 * Check if player has tool in inventory or equipped
 */
export function hasTool(player: Player, toolName: string): boolean {
  // Check inventory
  const hasInInventory = (player.inventory || []).some(
    (item) => item.toLowerCase() === toolName.toLowerCase()
  );

  // Check equipped
  const hasEquipped = Object.values(player.equipped || {}).some(
    (item) => item && item.toLowerCase() === toolName.toLowerCase()
  );

  return hasInInventory || hasEquipped;
}

/**
 * Clean up expired scheduled events and world events
 */
export function cleanupExpiredEvents(player: Player, worldSeed: WorldSeed): {
  player: Player;
  worldSeed: WorldSeed;
} {
  const currentDay = player.gameDay || 1;

  // Clean up scheduled events
  const scheduledEvents = (player.scheduledEvents || []).filter(
    (event) => (event.day || 0) >= currentDay
  );

  // Clean up world events
  const worldEvents: Record<string, any[]> = {};
  for (const [location, events] of Object.entries(worldSeed.worldEvents || {})) {
    const activeEvents = (events as any[]).filter((e) => (e.endsDay || 0) > currentDay);
    if (activeEvents.length > 0) {
      worldEvents[location] = activeEvents;
    }
  }

  return {
    player: {
      ...player,
      scheduledEvents,
    },
    worldSeed: {
      ...worldSeed,
      worldEvents,
    },
  };
}

/**
 * Get reputation label based on reputation score
 */
export function getReputationLabel(reputation: number): string {
  if (reputation >= 500) return 'Living Legend';
  if (reputation >= 300) return 'Renowned Hero';
  if (reputation >= 150) return 'Respected Adventurer';
  if (reputation >= 50) return 'Recognised Name';
  if (reputation >= 0) return 'Unknown Traveller';
  if (reputation >= -50) return 'Notorious Outlaw';
  return 'Outcast';
}

/**
 * Get wanted level description
 */
export function getWantedLevelDescription(level: number): string {
  const labels = [
    "No bounty",
    "Wanted: 100g",
    "Wanted: 500g",
    "Wanted: 5000g (Extreme)",
  ];
  return labels[Math.max(0, Math.min(3, level))];
}

/**
 * Calculate damage reduction from defense
 */
export function calculateDefenseReduction(defense: number): number {
  return Math.min(0.75, defense * 0.01); // Max 75% reduction
}

/**
 * Roll a d6
 */
export function d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Format a list of items for display
 */
export function formatItemList(items: string[]): string {
  if (items.length === 0) return 'nothing';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Count item occurrences in inventory
 */
export function countItem(inventory: string[], itemName: string): number {
  return (inventory || []).filter((i) => i.toLowerCase() === itemName.toLowerCase()).length;
}

/**
 * Remove N occurrences of item from inventory
 */
export function removeItem(inventory: string[], itemName: string, count: number = 1): string[] {
  let removed = 0;
  return (inventory || []).filter((item) => {
    if (item.toLowerCase() === itemName.toLowerCase() && removed < count) {
      removed++;
      return false;
    }
    return true;
  });
}

/**
 * Get current day period (Night, Morning, Afternoon, Evening)
 */
export function getCurrentPeriod(gameHour: number = 8): string {
  const h = Math.floor(gameHour);
  if (h < 6) return 'Night';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';
}

/**
 * Check if two items are the same (case-insensitive)
 */
export function isSameItem(item1: string, item2: string): boolean {
  return item1.toLowerCase() === item2.toLowerCase();
}

/**
 * Safe JSON parse with fallback
 */
export function safeParse<T>(jsonStr: string, fallback: T): T {
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

// ============================================
// ITEM DATABASE HELPERS
// ============================================

/**
 * Look up item info by name (case-insensitive)
 */
export function getItemInfo(name: string): { icon: string; type: string; desc: string } | undefined {
  if (!name) return undefined;
  const key = name.toLowerCase();
  return (ITEM_INFO as Record<string, { icon: string; type: string; desc: string }>)[key];
}

// Static item-to-slot map (covers all canonical equipment)
const ITEM_SLOT_MAP: Record<string, string> = {
  // Weapons
  dagger: 'weapon', sword: 'weapon', 'iron sword': 'weapon', 'steel sword': 'weapon',
  'arcane wand': 'weapon', staff: 'weapon', 'blade of aethermoor': 'weapon',
  'staff of ages': 'weapon', 'war hammer': 'weapon', 'hunting bow': 'weapon',
  'enchanted blade': 'weapon', 'battle axe': 'weapon', 'masterwork sword': 'weapon',
  'archmage staff': 'weapon', 'ember staff': 'weapon', 'holy mace': 'weapon',
  'crown sword': 'weapon', 'rebel blade': 'weapon', "archon's staff": 'weapon',
  "corsair's cutlass": 'weapon',
  // Offhand / Shields
  shield: 'offhand', 'iron shield': 'offhand', 'steel shield': 'offhand',
  'tower shield': 'offhand', 'obsidian shield': 'offhand', "champion's pauldrons": 'offhand',
  // Head
  'war helm': 'head', 'shadow hood': 'head', 'antler crown': 'head', 'broken crown': 'head',
  // Body
  'leather armour': 'body', chainmail: 'body', 'plate armour': 'body',
  'dragon scale armour': 'body', 'mage robes': 'body', 'voidsteel armour': 'body',
  'thornwood leathers': 'body', 'ember robes': 'body', 'vestments of light': 'body',
  'royal armour': 'body', 'robes of the academy': 'body', 'wolf coat': 'body',
  'ragged cloak': 'body', 'compact coat': 'body', "warlord's plate": 'body',
  'shadowmere cloak': 'body',
  // Feet
  'shadow boots': 'feet', 'root boots': 'feet', 'gold-threaded boots': 'feet',
  // Accessories
  'amulet of warding': 'accessory', 'ring of strength': 'accessory',
  'ring of agility': 'accessory', 'ring of wisdom': 'accessory', 'ring of power': 'accessory',
  'silver amulet': 'accessory', "scholar's ring": 'accessory', "merchant's ring": 'accessory',
  "warden's badge": 'accessory', "navigator's compass": 'accessory',
  'iron conclave signet': 'accessory', 'shadowmere calling card': 'accessory',
  "ember initiate's focus": 'accessory', 'silver hand medallion': 'accessory',
  'thornwood seedling': 'accessory', 'compact letter of credit': 'accessory',
  "crown's watch warrant card": 'accessory', "forgotten's mark": 'accessory',
  'academy research pass': 'accessory', 'sea wolves token': 'accessory',
  'sigil of the hand': 'accessory', 'ember focus': 'accessory',
};

/**
 * Determine which equipment slot an item goes in, by name.
 * Checks static map first, then TIERED_GEAR, then type-based fallback.
 */
export function getItemSlotEx(name: string): string | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (ITEM_SLOT_MAP[lower]) return ITEM_SLOT_MAP[lower];
  // Check TIERED_GEAR for explicit slot
  const tiered = TIERED_GEAR.find((g) => g.name.toLowerCase() === lower);
  if (tiered) return tiered.slot;
  // Type-based fallback (only for non-Armour types to avoid ambiguity)
  const info = getItemInfo(name);
  if (!info) return null;
  if (info.type === 'Weapon') return 'weapon';
  if (info.type === 'Magic') return 'accessory';
  if (info.type === 'Mount') return 'mount';
  return null;
}

/**
 * Look up consumable effect by name (case-insensitive)
 */
export function getConsumableEffect(name: string): { hp?: number; hpFull?: boolean; wil?: number; str?: number; agi?: number; int?: number; clearStatus?: string[]; msg?: string } | undefined {
  if (!name) return undefined;
  const key = name.toLowerCase();
  return (CONSUMABLE_EFFECTS as Record<string, any>)[key];
}

// ============================================
// DISGUISED ITEM HELPERS (Xephita system)
// ============================================

/**
 * Check if an item has a disguised magical identity
 */
export function isDisguisedItem(name: string): boolean {
  if (!name) return false;
  return name.toLowerCase() in (DISGUISED_ITEMS as Record<string, any>);
}

/**
 * Get the true magical name of a disguised item
 */
export function getDisguisedItemTrueName(name: string): string {
  if (!name) return name;
  const entry = (DISGUISED_ITEMS as Record<string, any>)[name.toLowerCase()];
  return entry?.trueName || name;
}

/**
 * Get display info for an item—magical if revealed, mundane if not
 */
export function getDisguisedItemDisplay(name: string, revealed: boolean): {
  icon: string;
  type: string;
  desc: string;
  displayName: string;
} {
  const entry = (DISGUISED_ITEMS as Record<string, any>)[name.toLowerCase()];
  if (!entry) {
    const info = getItemInfo(name);
    return { icon: info?.icon || '📦', type: info?.type || 'Item', desc: info?.desc || '', displayName: name };
  }
  if (revealed) {
    return {
      icon: entry.trueIcon || '✨',
      type: entry.trueType || 'Magic',
      desc: entry.trueDesc || '',
      displayName: entry.trueName,
    };
  }
  const mundane = getItemInfo(name);
  return {
    icon: mundane?.icon || '📦',
    type: mundane?.type || 'Item',
    desc: mundane?.desc || '',
    displayName: name,
  };
}

// ============================================
// EQUIPMENT SET HELPERS
// ============================================

// Item set definitions (Shadowmere, Ember, Guardian's)
const ITEM_SETS = [
  {
    id: 'shadowmere',
    name: 'Shadowmere Set',
    pieces: ['Shadowmere Cloak', 'Shadow Boots', 'Dagger'],
    bonuses: { 2: '+2 AGI', 3: 'Shadow Step ability' },
  },
  {
    id: 'ember',
    name: 'Ember Set',
    pieces: ['Ember Robes', 'Amulet of Warding', 'Arcane Wand'],
    bonuses: { 2: '+2 INT', 3: 'Flame Shield ability' },
  },
  {
    id: 'guardian',
    name: "Guardian's Set",
    pieces: ['Plate Armour', 'Tower Shield', 'War Hammer'],
    bonuses: { 2: '+2 STR, +1 WIL', 3: 'Unbreakable ability' },
  },
];

/**
 * Find which set (if any) an item belongs to. Returns set id or null.
 */
export function getItemSet(name: string): string | null {
  for (const set of ITEM_SETS) {
    if (set.pieces.includes(name)) return set.id;
  }
  return null;
}

/**
 * Return array of active set bonuses for the current equipment loadout.
 * Each entry: { setId, setName, equipped: number, total: number, bonus: string }
 */
export function getActiveSetBonuses(equipped: Record<string, string | null>): {
  setId: string; setName: string; equipped: number; total: number; bonus: string;
}[] {
  const results = [];
  const equippedNames = Object.values(equipped).filter(Boolean) as string[];
  for (const set of ITEM_SETS) {
    const count = set.pieces.filter((p) => equippedNames.includes(p)).length;
    if (count >= 2) {
      let bonusText = '';
      for (const threshold of [3, 2]) {
        if (count >= threshold && (set.bonuses as any)[threshold]) {
          bonusText = (set.bonuses as any)[threshold];
          break;
        }
      }
      if (bonusText) {
        results.push({ setId: set.id, setName: set.name, equipped: count, total: set.pieces.length, bonus: bonusText });
      }
    }
  }
  return results;
}

/**
 * Sum all stat bonuses from equipped items
 */
export function getAllEquipmentBonuses(equipped: Record<string, string | null>): Record<string, number> {
  const total: Record<string, number> = {};
  for (const itemName of Object.values(equipped)) {
    if (!itemName) continue;
    const bonuses = (ITEM_STAT_BONUSES as Record<string, Record<string, number>>)[itemName];
    if (bonuses) {
      for (const [stat, val] of Object.entries(bonuses)) {
        total[stat] = (total[stat] || 0) + val;
      }
    }
  }
  return total;
}

// ============================================
// SHOP HELPERS
// ============================================

// Shop stock by location tier
const SHOP_STOCK_BY_TIER: Record<string, { name: string; price: number }[]> = {
  hamlet: [
    { name: 'Rations', price: 15 },
    { name: 'Torch', price: 5 },
    { name: 'Rope', price: 10 },
  ],
  village: [
    { name: 'Rations', price: 15 },
    { name: 'Health Potion', price: 25 },
    { name: 'Torch', price: 5 },
    { name: 'Rope', price: 10 },
    { name: 'Lockpick', price: 15 },
    { name: 'Bread', price: 8 },
    { name: 'Antidote', price: 20 },
  ],
  town: [
    { name: 'Health Potion', price: 25 },
    { name: 'Mana Potion', price: 30 },
    { name: 'Antidote', price: 20 },
    { name: 'Rations', price: 15 },
    { name: 'Torch', price: 5 },
    { name: 'Rope', price: 10 },
    { name: 'Lockpick', price: 15 },
    { name: 'Sword', price: 80 },
    { name: 'Dagger', price: 60 },
    { name: 'Shield', price: 70 },
    { name: 'Leather Armour', price: 80 },
    { name: 'Forager Kit', price: 40 },
    { name: 'Bedroll', price: 35 },
    { name: 'Iron Sword', price: 100 },
    { name: 'Iron Shield', price: 90 },
  ],
  city: [
    { name: 'Health Potion', price: 25 },
    { name: 'Strong Health Potion', price: 50 },
    { name: 'Mana Potion', price: 30 },
    { name: 'Antidote', price: 20 },
    { name: 'Rations', price: 15 },
    { name: 'Sword', price: 80 },
    { name: 'Dagger', price: 60 },
    { name: 'Arcane Wand', price: 120 },
    { name: 'Shield', price: 70 },
    { name: 'Leather Armour', price: 80 },
    { name: 'Chainmail', price: 160 },
    { name: 'Amulet', price: 90 },
    { name: 'Ring', price: 75 },
    { name: 'Iron Sword', price: 100 },
    { name: 'Steel Sword', price: 200 },
    { name: 'Scroll of Mending', price: 60 },
    { name: 'Scroll of Fire', price: 55 },
    { name: 'Ring of Strength', price: 120 },
    { name: 'Ring of Agility', price: 120 },
    { name: 'Amulet of Warding', price: 150 },
  ],
  capital: [
    { name: 'Health Potion', price: 25 },
    { name: 'Strong Health Potion', price: 50 },
    { name: 'Elixir of Vigour', price: 120 },
    { name: 'Mana Potion', price: 30 },
    { name: 'Antidote', price: 20 },
    { name: 'Rations', price: 15 },
    { name: 'Sword', price: 80 },
    { name: 'Dagger', price: 60 },
    { name: 'Arcane Wand', price: 120 },
    { name: 'Staff', price: 100 },
    { name: 'Shield', price: 70 },
    { name: 'Leather Armour', price: 80 },
    { name: 'Chainmail', price: 160 },
    { name: 'Amulet', price: 90 },
    { name: 'Ring', price: 75 },
    { name: 'Iron Sword', price: 100 },
    { name: 'Steel Sword', price: 200 },
    { name: 'Scroll of Mending', price: 60 },
    { name: 'Scroll of Fire', price: 55 },
    { name: 'Scroll of Lightning', price: 80 },
    { name: 'Ring of Strength', price: 120 },
    { name: 'Ring of Agility', price: 120 },
    { name: 'Amulet of Warding', price: 150 },
    { name: 'Forager Kit', price: 40 },
    { name: 'Bedroll', price: 35 },
    { name: 'Lockpick', price: 15 },
  ],
};

/**
 * Generate shop stock for a given location and player.
 * Returns an array of { name, price, icon, type, desc }.
 * Includes tiered gear based on player level and location tier.
 */
export function generateShopStock(location: string, _player: any, locationGrid?: Record<string, any>): { name: string; price: number; icon: string; type: string; desc: string }[] {
  const gridType = locationGrid?.[location]?.type;
  const tier = (gridType || LOCATION_TIERS[location] || 'town').toLowerCase();
  const stock = SHOP_STOCK_BY_TIER[tier] || SHOP_STOCK_BY_TIER.town;
  const playerLevel: number = _player?.level || 1;

  // Determine which location tiers allow higher-level gear
  const isCity = ['city', 'capital'].includes(tier);
  const isCapital = tier === 'capital';

  // Filter tiered gear eligible for this player level and location
  const tieredItems = TIERED_GEAR.filter((g) => {
    if (playerLevel < g.minLevel) return false;
    if (g.gearTier >= 4 && !isCapital) return false;
    if (g.gearTier >= 3 && !isCity) return false;
    return true;
  });

  const baseStock = stock.map((item) => {
    const info = getItemInfo(item.name);
    return {
      name: item.name,
      price: item.price,
      icon: info?.icon || '📦',
      type: info?.type || 'Item',
      desc: info?.desc || '',
    };
  });

  const tieredStock = tieredItems.map((g) => ({
    name: g.name,
    price: g.price,
    icon: g.icon,
    type: 'Gear',
    desc: g.desc,
  }));

  // Merge, deduplicating by name
  const seen = new Set(baseStock.map((i) => i.name));
  const extra = tieredStock.filter((i) => !seen.has(i.name));
  return [...baseStock, ...extra];
}

/**
 * Compile compact perk flags from player data,
 * e.g. { discount: 0.25, silverTongue: true, … }
 */
export function getCompactPerks(player: any): {
  discount: number;
  silverTongue: boolean;
  tradeEmpire: boolean;
  ghost: boolean;
  arcaneInsight: boolean;
  seaLegs: boolean;
} {
  const perks: string[] = player?.perks || [];
  const legacy: string[] = player?.legacyPerks || [];
  const abilities: string[] = player?.abilities || [];
  const all = [...perks, ...legacy, ...abilities];

  let discount = 0;
  if (all.includes('merchants_friend') || all.includes("Merchant's Friend")) discount += 0.25;
  if (all.includes('silver_tongue') || all.includes('Silver Tongue')) discount += 0.1;

  return {
    discount,
    silverTongue: all.some((p) => p === 'Silver Tongue' || p === 'silver_tongue'),
    tradeEmpire:  all.some((p) => p === 'Trade Empire'  || p === 'trade_empire'),
    ghost:        all.some((p) => p === 'Ghost'          || p === 'ghost'),
    arcaneInsight: all.some((p) => p === 'Arcane Insight' || p === 'arcane_insight'),
    seaLegs:      all.some((p) => p === 'Sea Legs'       || p === 'sea_legs'),
  };
}

// ============================================
// STANDING / RANK HELPERS
// ============================================

const FACTION_XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];

/**
 * Return the index (0–5) into FACTION_RANKS for a given XP value
 */
export function getFactionRank(xp: number): number {
  let rank = 0;
  for (let i = 0; i < FACTION_XP_THRESHOLDS.length; i++) {
    if (xp >= FACTION_XP_THRESHOLDS[i]) rank = i;
  }
  return rank;
}

/**
 * Same thresholds used for location standings
 */
export function getLocationRank(xp: number): number {
  return getFactionRank(xp);
}

/**
 * Return reputation tier info based on numeric score
 */
export function getRepTier(rep: number): { label: string; color: string; level: number } {
  if (rep >= 500) return { label: 'Living Legend',         color: '#f0d060', level: 6 };
  if (rep >= 300) return { label: 'Renowned Hero',         color: '#60c060', level: 5 };
  if (rep >= 150) return { label: 'Respected Adventurer',  color: '#3090c0', level: 4 };
  if (rep >= 50)  return { label: 'Recognised Name',       color: '#c0a030', level: 3 };
  if (rep >= 0)   return { label: 'Unknown Traveller',     color: '#9a7a55', level: 2 };
  if (rep >= -50) return { label: 'Notorious Outlaw',      color: '#c06030', level: 1 };
  return            { label: 'Outcast',                    color: '#c03030', level: 0 };
}
