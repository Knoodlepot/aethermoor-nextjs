import { applyNarrationState } from '@/lib/server/narrationState';
import type { Player, WorldSeed } from '@/lib/types';

function buildMockPlayer(): Player {
  return {
    name: 'Verifier',
    class: 'Warrior',
    level: 2,
    xp: 0,
    statPoints: 0,
    skillPoints: 0,
    hp: 18,
    maxHp: 20,
    str: 8,
    agi: 5,
    int: 3,
    wil: 4,
    gold: 10,
    inventory: ['Torch'],
    location: 'Amberhold Capital',
    reputation: 0,
    perks: [],
    abilities: [],
    quests: [],
    equipped: {},
    travel: { destination: null, arrivesDay: null, arrivesHour: null },
    combat: { inCombat: false, currentEnemy: null },
    exploredLocations: [],
    mainQuestActSeen: 1,
    disguisedItemsRevealed: [],
    factionStandings: {},
    locationStandings: {},
    joinedFactions: [],
    pendingFactionOffer: null,
    factionDeclines: [],
    knownNpcs: [],
    gameHour: 8,
    gameDay: 1,
    scheduledEvents: [],
    actionCount: 0,
    lastForageAction: null,
    sleepRoughCount: 0,
    context: 'explore',
    wantedLevel: 0,
    professions: {},
    ngPlusCount: 0,
    legacyPerks: [],
    legacyItems: [],
    bestiary: [],
    dungeon: { floor: 0, deepestFloor: 0 },
    deathCount: 0,
    gravestones: [],
  };
}

function buildMockWorldSeed(): WorldSeed {
  return {
    seed: 12345,
    travelMatrix: {},
    worldEvents: {},
    villainAllied: false,
    locationGrid: {},
    worldSettlements: [],
    currentAct: 1,
    mainQuestComplete: false,
    questTitle: 'The Road North',
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const narrative = [
    'The ferryman presses a brass key into your palm and quietly pockets a few coins for the crossing.',
    '{"grant":{"item":"Brass Key"}}',
    '{"goldChange":-3}',
    '{"context":"npc"}',
    '{"suggestions":["Ask about the shrine","Board the ferry","Inspect the brass key"]}',
  ].join('\n');

  const result = applyNarrationState({
    player: buildMockPlayer(),
    worldSeed: buildMockWorldSeed(),
    narrative,
    messages: [{ role: 'user', content: 'Pay the ferryman and cross' }],
  });

  assert(result.cleanNarrative.includes('brass key'), 'Clean narrative should preserve the story text.');
  assert(!result.cleanNarrative.includes('{"grant"'), 'Clean narrative should strip JSON tags.');
  assert(result.player.inventory.includes('Brass Key'), 'Granted item should be applied server-side.');
  assert(result.player.gold === 7, `Expected gold 7, got ${result.player.gold}.`);
  assert(result.player.context === 'npc', `Expected context npc, got ${result.player.context}.`);
  assert(result.suggestions.length === 3, 'Expected three suggestions from server-side parsing.');
  assert(result.fullMessages[result.fullMessages.length - 1]?.role === 'assistant', 'Assistant reply should be appended to messages.');

  console.log('PASS mock server-side narration state harness');
  console.log(`  Clean narrative: ${result.cleanNarrative}`);
  console.log(`  Gold: ${result.player.gold}`);
  console.log(`  Inventory: ${result.player.inventory.join(', ')}`);
  console.log(`  Suggestions: ${result.suggestions.join(' | ')}`);
}

main();