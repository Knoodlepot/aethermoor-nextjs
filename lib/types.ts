// ── Aethermoor Game Types ────────────────────────────────────

// Player Character
export interface Player {
  name: string;
  class: string;
  level: number;
  xp: number;
  statPoints: number;
  skillPoints: number;
  hp: number;
  maxHp: number;
  str: number;
  agi: number;
  int: number;
  wil: number;
  gold: number;
  inventory: string[];
  location: string;
  reputation: number;
  perks: string[];
  abilities: string[];
  quests: Quest[];
  equipped: Record<string, string | null>;
  travel: {
    destination: string | null;
    arrivesDay: number | null;
    arrivesHour: number | null;
  };
  combat: CombatState;
  exploredLocations: string[];
  mainQuestActSeen: number;
  disguisedItemsRevealed: string[];
  factionStandings: Record<string, number>;
  locationStandings: Record<string, number>;
  joinedFactions: string[];
  pendingFactionOffer: string | null;
  factionDeclines: string[];
  knownNpcs: NPC[];
  gameHour: number;
  gameDay: number;
  scheduledEvents: ScheduledEvent[];
  actionCount: number;
  lastForageAction: number | null;
  sleepRoughCount: number;
  context: string; // 'explore' | 'town' | 'combat' | 'npc' | 'camp'
  wantedLevel: number; // 0-3
  professions: Record<string, ProfessionState>;
  ngPlusCount: number;
  legacyPerks: string[];
  legacyItems: string[];
  bestiary: BestiaryEntry[];
  dungeon: DungeonState;
  deathCount: number;
  gravestones: Gravestone[];
  statusEffects?: string[];
  modelTier?: 'haiku' | 'sonnet' | 'opus';
  language?: string;
  namedPlaces?: Array<{ name: string; type: string; settlement: string }>;
}

export interface CombatState {
  inCombat: boolean;
  currentEnemy: Enemy | null;
  currentFloor?: number;
}

export interface Enemy {
  id: string;
  name: string;
  archetypeId: string;
  icon: string;
  tier: number;
  hp: number;
  maxHp: number;
  str: number;
  agi: number;
  wil: number;
  def: number;
  traits: string[];
  variant: string | null;
  isFinalBoss?: boolean;
  isLieutenant?: boolean;
  tierLabel?: string;
  traitLabels?: string[];
  description?: string;
  style?: string;
  statusEffects?: string[];
}

export interface DungeonState {
  floor: number;
  deepestFloor: number;
}

export interface Gravestone {
  name: string;
  level: number;
  class: string;
  day: number;
  epitaph: string;
}

export interface BestiaryEntry {
  archetypeId: string;
  name: string;
  icon: string;
  tier: number;
  timesKilled: number;
  firstKilledDay: number;
  lastKilledDay: number;
}

export interface ProfessionState {
  level: number;
  xp: number;
}

export interface ScheduledEvent {
  npcName: string;
  day: number;
  hour: number;
  location?: string;
  description?: string;
}

// NPC
export interface NPC {
  name: string;
  role: string;
  location?: string;
  relationship: "neutral" | "friendly" | "hostile";
  notes: string;
  questGiver: boolean;
  metDay: number;
  metHour: number;
  travelDestination?: string;
  travelArrivesDay?: number;
  travelArrivesHour?: number;
  lastInteractionNotes?: string;
}

// Quest
export interface Quest {
  id: string;
  title: string;
  objective: string;
  status: "active" | "completed" | "failed";
  reward: string;
  giver: string;
  givenDay: number;
  givenHour: number;
  type: "main" | "faction" | "side" | "contract";
  factionId?: string;
  factionRank?: number;
  location?: string;
  tracked?: boolean;
}

// World Seed (Persistent world state)
export interface WorldSeed {
  seed: number;
  travelMatrix: Record<string, Record<string, number>>;
  worldEvents: Record<string, WorldEvent[]>;
  villainAllied: boolean;
  locationGrid: Record<string, LocationGridEntry>;
  worldSettlements: Settlement[];
  // Main quest fields
  currentAct?: number;
  mainQuestComplete?: boolean;
  questTitle?: string;
  templateIcon?: string;
  act1Complete?: boolean;
  act2Complete?: boolean;
  act3Complete?: boolean;
  villainName?: string;
  villainType?: string;
  allyRevealed?: boolean;
  allyName?: string;
  betrayalSprung?: boolean;
  finalTone?: string;
}

export interface WorldEvent {
  type: string;
  severity: "minor" | "moderate" | "severe";
  desc: string;
  sourceDay: number;
  endsDay: number;
}

export interface LocationGridEntry {
  x: number;
  y: number;
  type: string;
  coast?: boolean;
  river?: boolean;
  harbour?: boolean;
  parent?: string;
  isPOI?: boolean;
}

export interface Settlement {
  name: string;
  type: "capital" | "city" | "town" | "village" | "hamlet" | "poi";
  mapX: number;
  mapY: number;
  coast: boolean;
  river: boolean;
  harbour: boolean;
  population?: number;
  parent?: string;
}

// API Responses
export interface AuthResponse {
  token: string;
  playerId: string;
  accountId: string;
  email?: string;
}

export interface SaveData {
  player: Player;
  worldSeed: WorldSeed;
  messages: string[];
  narrative: string;
  log: string[];
}

export interface NarratorResponse {
  text: string;
  tokenBalance: number;
}

export interface AccountInfo {
  accountId: string;
  email: string;
  playerId: string;
  balance: number;
}

// Game Constants
export interface ClassDefinition {
  icon: string;
  hp: number;
  str: number;
  agi: number;
  int: number;
  wil: number;
  desc: string;
  ability: string;
}

export interface ItemDefinition {
  icon: string;
  type: string;
  desc: string;
}

export interface AbilityDefinition {
  icon: string;
  type: string;
  desc: string;
}

export interface EnemyArchetype {
  icon: string;
  name: string;
  style: string;
  baseHp: number;
  baseStr: number;
  baseAgi: number;
  baseDef: number;
  xpMult: number;
  goldMult: number;
  lootTier: number;
  locations: string[];
}

export interface FactionDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  group: "class" | "world";
  forClass?: string;
  desc: string;
  rankAbilities: Record<number, string>;
  rankRewards: Record<number, string>;
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  tier: string;
  price: number;
  desc: string;
  exclusive?: boolean;
}

// Game Message Types
export interface GameMessage {
  type: "command" | "response" | "error" | "system";
  text: string;
  timestamp: number;
}

export interface Command {
  text: string;
  timestamp: number;
}
