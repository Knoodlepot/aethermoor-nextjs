import type { Player } from './types';
import { advanceGameTime, registerNpc } from './helpers';

/**
 * Strip all JSON tags from narrative text for display
 */
export function stripContextTag(text: string): string {
  let t = text;

  // Strip all tag types
  t = t.replace(/\{"context"\s*:\s*"\w+"\}/g, '');
  t = t.replace(/\{"npc"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"npcUpdate"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"npcGift"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"grant"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"remove"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"newQuest"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"factionTask"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"timePass"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"scheduleEvent"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"npcTravel"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"wanted"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"villainAlly"\s*:\s*true\}/g, '');
  t = t.replace(/\{"worldEvent"\s*:\s*\{[^}]+\}\}/g, '');
  t = t.replace(/\{"grantAbility"\s*:\s*"[^"]+"\}/g, '');
  t = t.replace(/\{"repChange"\s*:\s*-?\d+\}/g, '');
  t = t.replace(/\{"goldChange"\s*:\s*-?\d+\}/g, '');
  t = t.replace(/\{"shopPrice"\s*:\s*\{[^}]+\}\s*\}/g, '');
  t = t.replace(/\{"suggestions"\s*:\s*\[[^\]]+\]\}/g, '');
  t = t.replace(/\{"suggestions"\s*:[\s\S]*/g, ''); // Catch truncated suggestions
  t = t.replace(/\{"mainQuestAct"\s*:\s*"[^"]+"\}/g, '');
  t = t.replace(/\{"disguisedReveal"\s*:\s*\[[^\]]*\]\}/g, '');
  t = t.replace(/\[FORAGE_FOUND:[^\]]+\]/g, '');
  t = t.replace(/```[a-z]*\s*\{"context"\s*:\s*"\w+"\}\s*```/g, '');
  t = t.replace(/```[a-z]*\s*```/g, '');

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
 * Parse all tags from AI response
 */
export interface ParsedTags {
  context: string | null;
  npc: any;
  npcUpdate: any;
  npcGift: any;
  grant: any;
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

  // Item grants
  if (tags.grant && tags.grant.item) {
    updatedPlayer = {
      ...updatedPlayer,
      inventory: [...(updatedPlayer.inventory || []), tags.grant.item],
    };
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
          quests: [...currentQuests, { ...tags.newQuest, status: 'active' }],
        };
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

  return {
    player: updatedPlayer,
    worldSeed: updatedSeed,
    stateChanges,
    warnings,
  };
}
