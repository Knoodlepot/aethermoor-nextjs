import type { Player } from './types';
import { advanceGameTime, registerNpc, xpToLevel, HP_PER_LEVEL, LEVEL_CAP } from './helpers';

/**
 * Strip all JSON tags from narrative text for display
 */
export function stripContextTag(text: string): string {
  let t = text;

  // Strip all tag types — use [\s\S]+? (lazy multiline) for nested object tags
  // to correctly handle notes/values that may contain } characters or newlines
  t = t.replace(/\{"context"\s*:\s*"\w+"\}/g, '');
  t = t.replace(/\{"npc"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"npcUpdate"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"npcGift"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"grant"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"remove"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"newQuest"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"factionTask"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"timePass"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"scheduleEvent"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"npcTravel"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"wanted"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"villainAlly"\s*:\s*true\}/g, '');
  t = t.replace(/\{"worldEvent"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"grantAbility"\s*:\s*"[^"]+"\}/g, '');
  t = t.replace(/\{"repChange"\s*:\s*-?\d+\}/g, '');
  t = t.replace(/\{"goldChange"\s*:\s*-?\d+\}/g, '');
  t = t.replace(/\{"shopPrice"\s*:\s*\{[\s\S]+?\}\s*\}/g, '');
  t = t.replace(/\{"suggestions"\s*:\s*\[[^\]]+\]\}/g, '');
  t = t.replace(/\{"suggestions"\s*:[\s\S]*/g, ''); // Catch truncated suggestions
  t = t.replace(/\{"mainQuestAct"\s*:\s*"[^"]+"\}/g, '');
  t = t.replace(/\{"disguisedReveal"\s*:\s*\[[^\]]*\]\}/g, '');
  t = t.replace(/\{"addPOI"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"addTerrain"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"playerStatus"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"hpChange"\s*:\s*-?\d+\}/g, '');
  t = t.replace(/\{"xpGain"\s*:\s*\d+\}/g, '');
  t = t.replace(/\{"bestiary"\s*:\s*\{[\s\S]+?\}\}/g, '');
  t = t.replace(/\{"travelTo"\s*:\s*"[^"]+"\}/g, '');
  t = t.replace(/\[FORAGE_FOUND:[^\]]+\]/g, '');
  t = t.replace(/```[a-z]*\s*\{"context"\s*:\s*"\w+"\}\s*```/g, '');
  t = t.replace(/```[a-z]*\s*```/g, '');
  // Final safety net: strip any remaining JSON-like tags at end of text
  t = t.replace(/\s*\{"\w+"[\s\S]*$/, '');

  return t.trim();
}

/**
 * Parse markdown formatting (**bold**, *italic*, newlines)
 */
export function parseMarkdown(text: string): string {
  // Escape HTML
  let s = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert markdown
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  s = s.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
  s = s.replace(/\n/g, '<br>');

  return s;
}

/**
 * Extract context tag: {"context":"explore"|"town"|"combat"|"npc"|"camp"|"dungeon"}
 */
export function extractContext(text: string): string | null {
  const m = text.match(/\{"context"\s*:\s*"(\w+)"\}/);
  return m ? m[1] : null;
}

/**
 * Extract NPC tag: {"npc":{"name":"...","role":"...","relationship":"...","notes":"..."}}
 */
export function extractNpcTag(text: string): any {
  const m = text.match(/\{"npc"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract NPC update tag for modifying existing NPCs
 */
export function extractNpcUpdateTag(text: string): any {
  const m = text.match(/\{"npcUpdate"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract NPC gift tag: {"npcGift":{"item":"ItemName"}}
 */
export function extractNpcGiftTag(text: string): any {
  const m = text.match(/\{"npcGift"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract item grant tag: {"grant":{"item":"ItemName"}}
 */
export function extractGrantTag(text: string): any {
  const m = text.match(/\{"grant"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

export function extractAllGrantTags(text: string): any[] {
  const results: any[] = [];
  const re = /\{"grant"\s*:\s*(\{[^}]+\})\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    try { results.push(JSON.parse(m[1])); } catch { /* skip malformed */ }
  }
  return results;
}

/**
 * Extract item removal tag
 */
export function extractRemoveTag(text: string): any {
  const m = text.match(/\{"remove"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract new quest tag
 */
export function extractNewQuestTag(text: string): any {
  const m = text.match(/\{"newQuest"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract action suggestions (max 3)
 */
export function extractSuggestionsTag(text: string): string[] | null {
  const m = text.match(/\{"suggestions"\s*:\s*(\[[^\]]+\])\}/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[1]);
    return Array.isArray(arr)
      ? arr
          .slice(0, 3)
          .filter((s: any) => typeof s === 'string' && s.trim())
      : null;
  } catch {
    return null;
  }
}

/**
 * Extract faction task tag
 */
export function extractFactionTaskTag(text: string): any {
  const m = text.match(/\{"factionTask"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract time passage tag: {"timePass":{"hours":N}}
 */
export function extractTimePassTag(text: string): any {
  const m = text.match(/\{"timePass"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract scheduled event tag
 */
export function extractScheduleEventTag(text: string): any {
  const m = text.match(/\{"scheduleEvent"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract NPC travel tag
 */
export function extractNpcTravelTag(text: string): any {
  const m = text.match(/\{"npcTravel"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract wanted level tag: {"wanted":{"level":0-3}}
 */
export function extractWantedTag(text: string): any {
  const m = text.match(/\{"wanted"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract villain ally tag: {"villainAlly":true}
 */
export function extractVillainAllyTag(text: string): boolean {
  return /\{"villainAlly"\s*:\s*true\}/.test(text);
}

/**
 * Extract world event tag
 */
export function extractWorldEventTag(text: string): any {
  const m = text.match(/\{"worldEvent"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract ability teaching grant tag
 */
export function extractGrantAbilityTag(text: string): string | null {
  const m = text.match(/\{"grantAbility"\s*:\s*"([^"]+)"\}/);
  return m ? m[1] : null;
}

/**
 * Extract reputation change tag: {"repChange":N}
 */
export function extractRepChangeTag(text: string): number | null {
  const m = text.match(/\{"repChange"\s*:\s*(-?\d+)\}/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Extract gold change tag (purchases, fines, rewards, theft)
 */
export function extractGoldChangeTag(text: string): number | null {
  const m = text.match(/\{"goldChange"\s*:\s*(-?\d+)\}/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Extract shop price negotiation tag
 */
export function extractShopPriceTag(text: string): any {
  const m = text.match(
    /\{"shopPrice"\s*:\s*\{"item"\s*:\s*"([^"]+)"\s*,\s*"price"\s*:\s*(\d+)\}/
  );
  return m ? { item: m[1], price: parseInt(m[2], 10) } : null;
}

/**
 * Extract main quest act advancement tag
 */
export function extractMainQuestActTag(text: string): string | null {
  const m = text.match(/\{"mainQuestAct"\s*:\s*"([^"]+)"\}/);
  return m ? m[1] : null;
}

/**
 * Extract disguised item reveal tag: {"disguisedReveal":["MundaneItem",...]}
 */
export function extractDisguisedRevealTag(text: string): string[] | null {
  const m = text.match(/\{"disguisedReveal"\s*:\s*(\[[^\]]*\])\}/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[1]);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

/**
 * Extract addPOI tag: {"addPOI":{"name":"...","type":"farm_arable|farm_livestock|farm_mixed","parent":"Settlement","x":N,"y":N}}
 */
export function extractAddPOITag(text: string): any {
  const m = text.match(/\{"addPOI"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract addTerrain tag: {"addTerrain":{"type":"forest|plains|grasslands|hills|mountains|tundra|swamp","x":N,"y":N,"w":N,"h":N}}
 */
export function extractAddTerrainTag(text: string): any {
  const m = text.match(/\{"addTerrain"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract XP gain tag: {"xpGain":50}
 */
export function extractXpGainTag(text: string): number | null {
  const m = text.match(/\{"xpGain"\s*:\s*(\d+)\}/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Extract travel arrival tag: {"travelTo":"LocationName"}
 * Emitted by narrator when player arrives at a new named location.
 */
export function extractTravelToTag(text: string): string | null {
  const m = text.match(/\{"travelTo"\s*:\s*"([^"]+)"\}/);
  return m ? m[1] : null;
}

/**
 * Extract bestiary kill tag: {"bestiary":{"archetypeId":"goblin","name":"Goblin","icon":"👺","tier":1}}
 */
export function extractBestiaryTag(text: string): any {
  const m = text.match(/\{"bestiary"\s*:\s*(\{[\s\S]+?\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Extract HP change tag: {"hpChange":-12} (negative = damage, positive = healing)
 */
export function extractHpChangeTag(text: string): number | null {
  const m = text.match(/\{"hpChange"\s*:\s*(-?\d+)\}/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Extract player status effect tag: {"playerStatus":{"add":"effectName"}} or {"playerStatus":{"remove":"effectName"}}
 */
export function extractPlayerStatusTag(text: string): { add?: string; remove?: string } | null {
  const m = text.match(/\{"playerStatus"\s*:\s*(\{[^}]+\})\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 */
export interface ParsedTags {
  context: string | null;
  npc: any;
  npcUpdate: any;
  npcGift: any;
  grant: any;
  grants: any[];
  remove: any;
  newQuest: any;
  suggestions: string[] | null;
  factionTask: any;
  timePass: any;
  scheduleEvent: any;
  npcTravel: any;
  wanted: any;
  villainAlly: boolean;
  worldEvent: any;
  grantAbility: string | null;
  repChange: number | null;
  goldChange: number | null;
  shopPrice: any;
  mainQuestAct: string | null;
  disguisedReveal: string[] | null;
  addPOI: any;
  addTerrain: any;
  playerStatus: { add?: string; remove?: string } | null;
  hpChange: number | null;
  xpGain: number | null;
  bestiary: any;
  travelTo: string | null;
}

/**
 * Extract all tags from AI narrative response
 */
export function parseAllTags(narrative: string): ParsedTags {
  return {
    context: extractContext(narrative),
    npc: extractNpcTag(narrative),
    npcUpdate: extractNpcUpdateTag(narrative),
    npcGift: extractNpcGiftTag(narrative),
    grant: extractGrantTag(narrative),
    grants: extractAllGrantTags(narrative),
    remove: extractRemoveTag(narrative),
    newQuest: extractNewQuestTag(narrative),
    suggestions: extractSuggestionsTag(narrative),
    factionTask: extractFactionTaskTag(narrative),
    timePass: extractTimePassTag(narrative),
    scheduleEvent: extractScheduleEventTag(narrative),
    npcTravel: extractNpcTravelTag(narrative),
    wanted: extractWantedTag(narrative),
    villainAlly: extractVillainAllyTag(narrative),
    worldEvent: extractWorldEventTag(narrative),
    grantAbility: extractGrantAbilityTag(narrative),
    repChange: extractRepChangeTag(narrative),
    goldChange: extractGoldChangeTag(narrative),
    shopPrice: extractShopPriceTag(narrative),
    mainQuestAct: extractMainQuestActTag(narrative),
    disguisedReveal: extractDisguisedRevealTag(narrative),
    addPOI: extractAddPOITag(narrative),
    addTerrain: extractAddTerrainTag(narrative),
    playerStatus: extractPlayerStatusTag(narrative),
    hpChange: extractHpChangeTag(narrative),
    xpGain: extractXpGainTag(narrative),
    bestiary: extractBestiaryTag(narrative),
    travelTo: extractTravelToTag(narrative),
  };
}

/**
 * Process tags to update player state (handler structure)
 * Note: Full implementation will be completed in Phase 3 when integrating API responses.
 * This shows the pattern for tag processing.
 */
export interface TagProcessingResult {
  player: Player;
  worldSeed: any;
  stateChanges: Record<string, any>;
  warnings: string[];
}

export function processParsedTags(
  player: Player,
  tags: ParsedTags,
  worldSeed: any = {}
): TagProcessingResult {
  const stateChanges: Record<string, any> = {};
  const warnings: string[] = [];
  let updatedPlayer = { ...player };
  let updatedSeed = { ...worldSeed };

  // Context change
  if (tags.context) {
    stateChanges.context = tags.context;
    updatedPlayer = { ...updatedPlayer, context: tags.context };
  }

  // Travel arrival — update location and mark as explored
  if (tags.travelTo) {
    const dest = tags.travelTo;
    const explored = new Set<string>((updatedPlayer as any).exploredLocations || [(updatedPlayer as any).location]);
    explored.add(dest);
    updatedPlayer = {
      ...updatedPlayer,
      location: dest,
      exploredLocations: Array.from(explored),
    } as any;
    stateChanges.travelTo = dest;
  }

  // NPC registration — properly call registerNpc to update knownNpcs
  if (tags.npc) {
    updatedPlayer = registerNpc(updatedPlayer, tags.npc);
  }

  // NPC update — merge into existing NPC via registerNpc (spread merge)
  if (tags.npcUpdate) {
    updatedPlayer = registerNpc(updatedPlayer, tags.npcUpdate);
  }

  // NPC gift — add item to inventory
  if (tags.npcGift && tags.npcGift.item) {
    updatedPlayer = {
      ...updatedPlayer,
      inventory: [...(updatedPlayer.inventory || []), tags.npcGift.item],
    };
  }

  // Item grants — apply all grant tags (narrator may emit multiple)
  const allGrants = (tags.grants && tags.grants.length > 0) ? tags.grants : (tags.grant ? [tags.grant] : []);
  if (allGrants.length > 0) {
    const newItems = allGrants.filter((g) => g?.item).map((g) => g.item as string);
    if (newItems.length > 0) {
      updatedPlayer = {
        ...updatedPlayer,
        inventory: [...(updatedPlayer.inventory || []), ...newItems],
      };
    }
  }

  // Item removal
  if (tags.remove && tags.remove.item) {
    updatedPlayer = {
      ...updatedPlayer,
      inventory: (updatedPlayer.inventory || []).filter((i) => i !== tags.remove.item),
    };
  }

  // New quest
  if (tags.newQuest) {
    // Main quests should NOT be added to the regular quest list
    // They are tracked on worldSeed instead
    if (tags.newQuest.type === 'main') {
      warnings.push('Main quests should be tracked on worldSeed, not in quests list');
    } else {
      const currentQuests = updatedPlayer.quests || [];
      const alreadyExists = currentQuests.some((q: any) => q.title === tags.newQuest.title);
      if (!alreadyExists) {
        updatedPlayer = {
          ...updatedPlayer,
          quests: [...currentQuests, {
            ...tags.newQuest,
            type: tags.newQuest.type || 'side',
            status: 'active',
            tracked: true,
          }],
        };
        // Grant upfront gold payment immediately if included in quest tag
        if (tags.newQuest.rewardGold && tags.newQuest.rewardGold > 0) {
          updatedPlayer = {
            ...updatedPlayer,
            gold: (updatedPlayer.gold || 0) + tags.newQuest.rewardGold,
          };
        }
      }
    }
  }

  // Faction task
  if (tags.factionTask) {
    const currentQuests = updatedPlayer.quests || [];
    const alreadyExists = currentQuests.some(
      (q: any) => q.title === tags.factionTask.title
    );
    if (!alreadyExists) {
      updatedPlayer = {
        ...updatedPlayer,
        quests: [
          ...currentQuests,
          { ...tags.factionTask, status: 'active', isFactionQuest: true },
        ],
      };
    }
  }

  // Time pass
  if (tags.timePass && tags.timePass.hours) {
    updatedPlayer = advanceGameTime(updatedPlayer, tags.timePass.hours);
  }

  // Schedule event
  if (tags.scheduleEvent) {
    updatedPlayer = {
      ...updatedPlayer,
      scheduledEvents: [...(updatedPlayer.scheduledEvents || []), tags.scheduleEvent],
    };
  }

  // NPC travel
  if (tags.npcTravel && tags.npcTravel.name) {
    const npcs = (updatedPlayer.knownNpcs || []).map((npc: any) =>
      npc.name.toLowerCase() === tags.npcTravel.name.toLowerCase()
        ? {
            ...npc,
            travelDestination: tags.npcTravel.destination,
            travelArrivesDay: tags.npcTravel.arrivesDay,
            travelArrivesHour: tags.npcTravel.arrivesHour,
          }
        : npc
    );
    updatedPlayer = { ...updatedPlayer, knownNpcs: npcs };
  }

  // Reputation change
  if (tags.repChange !== null) {
    const newRep = Math.max(-100, (updatedPlayer.reputation || 0) + tags.repChange);
    updatedPlayer = { ...updatedPlayer, reputation: newRep };
  }

  // Gold change
  if (tags.goldChange !== null) {
    const newGold = Math.max(0, (updatedPlayer.gold || 0) + tags.goldChange);
    updatedPlayer = { ...updatedPlayer, gold: newGold };
  }

  // Wanted level
  if (tags.wanted && tags.wanted.level !== undefined) {
    const level = Math.max(0, Math.min(3, tags.wanted.level));
    updatedPlayer = { ...updatedPlayer, wantedLevel: level };
  }

  // Villain ally — goes on worldSeed not player
  if (tags.villainAlly) {
    updatedSeed = { ...updatedSeed, villainAllied: true };
  }

  // World event — keyed by location on worldSeed.worldEvents
  if (tags.worldEvent) {
    const { location, action, ...eventData } = tags.worldEvent;
    if (location) {
      const events = { ...(updatedSeed.worldEvents || {}) };
      if (action === 'clear') {
        delete events[location];
      } else {
        const locationEvents = events[location] || [];
        events[location] = [
          ...locationEvents.filter((e: any) => e.type !== eventData.type),
          {
            ...eventData,
            sourceDay: updatedPlayer.gameDay || 1,
          },
        ];
      }
      updatedSeed = { ...updatedSeed, worldEvents: events };
    }
  }

  // Main quest act advancement — goes on worldSeed
  if (tags.mainQuestAct) {
    const actNum = parseInt(tags.mainQuestAct, 10);
    if (!isNaN(actNum) && actNum > (updatedSeed.currentAct || 0)) {
      updatedSeed = { ...updatedSeed, currentAct: actNum };
    }
  }

  // Ability grant
  if (tags.grantAbility) {
    const currentAbilities = updatedPlayer.abilities || [];
    if (!currentAbilities.includes(tags.grantAbility)) {
      updatedPlayer = {
        ...updatedPlayer,
        abilities: [...currentAbilities, tags.grantAbility],
      };
    }
  }

  // Disguised item reveal
  if (tags.disguisedReveal && tags.disguisedReveal.length > 0) {
    const currentRevealed = updatedPlayer.disguisedItemsRevealed || [];
    updatedPlayer = {
      ...updatedPlayer,
      disguisedItemsRevealed: [...new Set([...currentRevealed, ...tags.disguisedReveal])],
    };
  }

  // Add POI to locationGrid (farms, etc.)
  if (tags.addPOI && tags.addPOI.name && tags.addPOI.type) {
    const poi = tags.addPOI;
    const existingGrid = (updatedSeed.travelMatrix as any)?.locationGrid || {};
    if (!existingGrid[poi.name]) {
      updatedSeed = {
        ...updatedSeed,
        travelMatrix: {
          ...(updatedSeed.travelMatrix as any),
          locationGrid: {
            ...existingGrid,
            [poi.name]: {
              x: poi.x ?? 50,
              y: poi.y ?? 50,
              type: poi.type,
              isPOI: true,
              parent: poi.parent ?? null,
            },
          },
        },
      };
    }
  }

  // Add terrain patch to terrain array
  if (tags.addTerrain && tags.addTerrain.type && tags.addTerrain.w && tags.addTerrain.h) {
    const t = tags.addTerrain;
    const existingTerrain: any[] = (updatedSeed.travelMatrix as any)?.terrain || [];
    // Avoid duplicates by checking type+x+y
    const alreadyExists = existingTerrain.some(
      (e: any) => e.type === t.type && Math.abs(e.x - (t.x ?? 50)) < 5 && Math.abs(e.y - (t.y ?? 50)) < 5
    );
    if (!alreadyExists) {
      updatedSeed = {
        ...updatedSeed,
        travelMatrix: {
          ...(updatedSeed.travelMatrix as any),
          terrain: [
            ...existingTerrain,
            { type: t.type, x: t.x ?? 50, y: t.y ?? 50, w: t.w, h: t.h },
          ],
        },
      };
    }
  }

  // Player status effect — add or remove from player.statusEffects
  if (tags.playerStatus) {
    const current = updatedPlayer.statusEffects || [];
    if (tags.playerStatus.add) {
      const effect = tags.playerStatus.add;
      if (!current.includes(effect)) {
        updatedPlayer = { ...updatedPlayer, statusEffects: [...current, effect] };
      }
    } else if (tags.playerStatus.remove) {
      const effect = tags.playerStatus.remove;
      updatedPlayer = { ...updatedPlayer, statusEffects: current.filter((e) => e !== effect) };
    }
  }

  // HP change — damage (negative) or healing (positive), clamped to [0, maxHp]
  if (tags.hpChange !== null) {
    const newHp = Math.max(0, Math.min(updatedPlayer.maxHp, (updatedPlayer.hp || 0) + tags.hpChange));
    updatedPlayer = { ...updatedPlayer, hp: newHp };
  }

  // XP gain — grant XP, check for level-up, apply rewards per level gained
  if (tags.xpGain !== null && tags.xpGain > 0) {
    const oldLevel = updatedPlayer.level || 1;
    const newXp = (updatedPlayer.xp || 0) + tags.xpGain;
    const newLevel = Math.min(xpToLevel(newXp), LEVEL_CAP);
    const levelsGained = newLevel - oldLevel;

    let newMaxHp = updatedPlayer.maxHp;
    let newStatPoints = updatedPlayer.statPoints || 0;
    let newSkillPoints = updatedPlayer.skillPoints || 0;

    if (levelsGained > 0) {
      const hpGain = (HP_PER_LEVEL[updatedPlayer.class] ?? 5) * levelsGained;
      newMaxHp += hpGain;
      newStatPoints += 3 * levelsGained;
      newSkillPoints += 1 * levelsGained;
    }

    updatedPlayer = {
      ...updatedPlayer,
      xp: newXp,
      level: newLevel,
      maxHp: newMaxHp,
      // Heal a small amount on level-up
      hp: levelsGained > 0 ? Math.min(newMaxHp, (updatedPlayer.hp || 0) + (HP_PER_LEVEL[updatedPlayer.class] ?? 5) * levelsGained) : updatedPlayer.hp,
      statPoints: newStatPoints,
      skillPoints: newSkillPoints,
    };

    if (levelsGained > 0) {
      stateChanges.levelUps = newLevel;
    }
  }

  // Bestiary — upsert kill record keyed by archetypeId
  if (tags.bestiary && tags.bestiary.archetypeId) {
    const entry = tags.bestiary;
    const currentDay = (updatedPlayer as any).gameDay || 1;
    const existing: any[] = (updatedPlayer as any).bestiary || [];
    const idx = existing.findIndex((b: any) => b.archetypeId === entry.archetypeId);
    let newBestiary: any[];
    if (idx >= 0) {
      newBestiary = existing.map((b: any, i: number) =>
        i === idx
          ? { ...b, timesKilled: (b.timesKilled || 0) + 1, lastKilledDay: currentDay }
          : b
      );
    } else {
      const newEntry = {
        archetypeId: entry.archetypeId,
        name: entry.name || entry.archetypeId,
        icon: entry.icon || '👾',
        tier: entry.tier ?? 1,
        timesKilled: 1,
        firstKilledDay: currentDay,
        lastKilledDay: currentDay,
      };
      newBestiary = [...existing, newEntry];
    }
    updatedPlayer = { ...updatedPlayer, bestiary: newBestiary } as any;
  }

  return {
    player: updatedPlayer,
    worldSeed: updatedSeed,
    stateChanges,
    warnings,
  };
}
