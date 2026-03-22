import { Player } from './types';
import { WorldSeed } from './types';
import { TOTAL_KNOWN_ENEMIES } from './constants';

export interface AchievementDef {
  id: string;
  title: string;
  hint: string; // shown when locked (visible achievements)
  description: string; // shown when unlocked
  category: 'combat' | 'dungeon' | 'progression' | 'world' | 'legacy';
  hidden: boolean;
  icon: string;
  check: (player: Player, worldSeed?: WorldSeed) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Combat ──────────────────────────────────────────────────────────
  {
    id: 'first_blood',
    title: 'First Blood',
    hint: 'Win your first fight.',
    description: 'You killed your first enemy.',
    category: 'combat',
    hidden: false,
    icon: '🩸',
    check: (p) => (p.bestiary ?? []).reduce((acc, e) => acc + e.timesKilled, 0) >= 1,
  },
  {
    id: 'century_killer',
    title: 'Century Killer',
    hint: 'Kill 100 enemies total.',
    description: 'You have slain 100 enemies.',
    category: 'combat',
    hidden: false,
    icon: '💀',
    check: (p) => (p.bestiary ?? []).reduce((acc, e) => acc + e.timesKilled, 0) >= 100,
  },
  {
    id: 'slayer_of_many',
    title: 'Slayer of Many',
    hint: 'Kill 500 enemies total.',
    description: 'Five hundred lives ended by your hand.',
    category: 'combat',
    hidden: false,
    icon: '⚔️',
    check: (p) => (p.bestiary ?? []).reduce((acc, e) => acc + e.timesKilled, 0) >= 500,
  },
  {
    id: 'boss_hunter',
    title: 'Boss Hunter',
    hint: 'Defeat a dungeon boss.',
    description: 'You defeated the boss of the dungeon.',
    category: 'combat',
    hidden: false,
    icon: '👑',
    check: (p) => (p.dungeon?.deepestFloor ?? 0) >= 37,
  },
  {
    id: 'type_collector',
    title: 'Menagerie',
    hint: 'Discover 20 different enemy types.',
    description: 'You have encountered 20 different types of enemy.',
    category: 'combat',
    hidden: false,
    icon: '📖',
    check: (p) => (p.bestiary ?? []).length >= 20,
  },
  {
    id: 'full_bestiary',
    title: 'Encyclopaedia Mortis',
    hint: 'Fill the entire bestiary.',
    description: `You have encountered all ${TOTAL_KNOWN_ENEMIES} enemy types.`,
    category: 'combat',
    hidden: false,
    icon: '📚',
    check: (p) => (p.bestiary ?? []).length >= TOTAL_KNOWN_ENEMIES,
  },

  // ── Dungeon ──────────────────────────────────────────────────────────
  {
    id: 'dungeon_first',
    title: 'Into the Dark',
    hint: 'Enter the dungeon for the first time.',
    description: 'You descended into the dungeon.',
    category: 'dungeon',
    hidden: false,
    icon: '🕳️',
    check: (p) => (p.dungeon?.deepestFloor ?? 0) >= 1,
  },
  {
    id: 'dungeon_10',
    title: 'Delver',
    hint: 'Reach floor 10 of the dungeon.',
    description: 'You reached the 10th floor of the dungeon.',
    category: 'dungeon',
    hidden: false,
    icon: '🪨',
    check: (p) => (p.dungeon?.deepestFloor ?? 0) >= 10,
  },
  {
    id: 'dungeon_25',
    title: 'Abyssal Walker',
    hint: 'Reach floor 25 of the dungeon.',
    description: 'You have gone deeper than most dare imagine.',
    category: 'dungeon',
    hidden: false,
    icon: '🌑',
    check: (p) => (p.dungeon?.deepestFloor ?? 0) >= 25,
  },
  {
    id: 'dungeon_35',
    title: 'The Frost Crypt',
    hint: 'Reach floor 35 of the dungeon.',
    description: 'You survived the frozen depths of the dungeon.',
    category: 'dungeon',
    hidden: false,
    icon: '❄️',
    check: (p) => (p.dungeon?.deepestFloor ?? 0) >= 35,
  },
  {
    id: 'dungeon_boss',
    title: 'Abyss Conqueror',
    hint: 'Reach the deepest floor and face what waits.',
    description: 'You descended to floor 40 and faced the final darkness.',
    category: 'dungeon',
    hidden: false,
    icon: '🔱',
    check: (p) => (p.dungeon?.deepestFloor ?? 0) >= 40,
  },

  // ── Progression ──────────────────────────────────────────────────────
  {
    id: 'level_10',
    title: 'Seasoned',
    hint: 'Reach level 10.',
    description: 'You reached level 10.',
    category: 'progression',
    hidden: false,
    icon: '⭐',
    check: (p) => p.level >= 10,
  },
  {
    id: 'level_20',
    title: 'Veteran',
    hint: 'Reach level 20.',
    description: 'You reached level 20.',
    category: 'progression',
    hidden: false,
    icon: '🌟',
    check: (p) => p.level >= 20,
  },
  {
    id: 'all_skills',
    title: 'Master of Craft',
    hint: 'Unlock every skill available to your class.',
    description: 'You unlocked all class skills.',
    category: 'progression',
    hidden: false,
    icon: '🎓',
    check: (p) => p.skillPoints === 0 && (p.abilities?.length ?? 0) >= 6,
  },
  {
    id: 'golden',
    title: 'Gilded',
    hint: 'Accumulate 1000 gold at once.',
    description: 'You had 1,000 gold in your purse.',
    category: 'progression',
    hidden: false,
    icon: '💰',
    check: (p) => p.gold >= 1000,
  },
  {
    id: 'ng_plus',
    title: 'New Game+',
    hint: 'Complete the game and start a new cycle.',
    description: 'You completed the game and started again.',
    category: 'progression',
    hidden: false,
    icon: '🔄',
    check: (p) => (p.ngPlusCount ?? 0) >= 1,
  },

  // ── World ────────────────────────────────────────────────────────────
  {
    id: 'quest_5',
    title: 'Helper',
    hint: 'Complete 5 quests.',
    description: 'You completed 5 quests.',
    category: 'world',
    hidden: false,
    icon: '📜',
    check: (p) => p.quests.filter((q) => (q.status as string) === 'done').length >= 5,
  },
  {
    id: 'quest_15',
    title: 'Champion of the People',
    hint: 'Complete 15 quests.',
    description: 'You completed 15 quests.',
    category: 'world',
    hidden: false,
    icon: '🏆',
    check: (p) => p.quests.filter((q) => (q.status as string) === 'done').length >= 15,
  },
  {
    id: 'reputation_100',
    title: 'Renowned',
    hint: 'Reach 100 reputation.',
    description: 'Your name is known across the land.',
    category: 'world',
    hidden: false,
    icon: '🌍',
    check: (p) => p.reputation >= 100,
  },
  {
    id: 'faction_join',
    title: 'Allegiance',
    hint: 'Join a faction.',
    description: 'You pledged yourself to a faction.',
    category: 'world',
    hidden: false,
    icon: '🚩',
    check: (p) => (p.joinedFactions?.length ?? 0) >= 1,
  },
  {
    id: 'explorer',
    title: 'Cartographer',
    hint: 'Discover 10 different locations.',
    description: 'You have explored 10 unique locations.',
    category: 'world',
    hidden: false,
    icon: '🗺️',
    check: (p) => (p.exploredLocations?.length ?? 0) >= 10,
  },
  {
    id: 'main_quest',
    title: 'Legend',
    hint: 'Complete the main quest.',
    description: 'You finished the main story of Aethermoor.',
    category: 'world',
    hidden: false,
    icon: '👁️',
    check: (_, w) => w?.mainQuestComplete === true,
  },

  // ── Legacy / Hidden ──────────────────────────────────────────────────
  {
    id: 'die_once',
    title: 'First Gravestone',
    hint: '???',
    description: 'You died for the first time.',
    category: 'legacy',
    hidden: true,
    icon: '🪦',
    check: (p) => (p.deathCount ?? 0) >= 1,
  },
  {
    id: 'die_5',
    title: 'Frequent Flyer',
    hint: '???',
    description: 'You died 5 times. The grave-digger knows you by name.',
    category: 'legacy',
    hidden: true,
    icon: '💀',
    check: (p) => (p.deathCount ?? 0) >= 5,
  },
  {
    id: 'gravestones_3',
    title: 'A Family of Tombstones',
    hint: '???',
    description: 'You left 3 gravestones behind.',
    category: 'legacy',
    hidden: true,
    icon: '⚰️',
    check: (p) => (p.gravestones?.length ?? 0) >= 3,
  },
  {
    id: 'all_factions_declined',
    title: 'Lone Wolf',
    hint: '???',
    description: 'You declined every faction offer.',
    category: 'legacy',
    hidden: true,
    icon: '🐺',
    check: (p) => (p.factionDeclines?.length ?? 0) >= 3 && (p.joinedFactions?.length ?? 0) === 0,
  },
  {
    id: 'ng_plus_3',
    title: 'Eternal Return',
    hint: '???',
    description: 'You completed the game three times.',
    category: 'legacy',
    hidden: true,
    icon: '♾️',
    check: (p) => (p.ngPlusCount ?? 0) >= 3,
  },
  {
    id: 'rich_and_famous',
    title: 'Plutocrat',
    hint: '???',
    description: 'You had 5,000 gold while also having 200+ reputation.',
    category: 'legacy',
    hidden: true,
    icon: '🤑',
    check: (p) => p.gold >= 5000 && p.reputation >= 200,
  },
  {
    id: 'poverty',
    title: 'Rock Bottom',
    hint: '???',
    description: 'You reached level 10 with 0 gold.',
    category: 'legacy',
    hidden: true,
    icon: '🪙',
    check: (p) => p.level >= 10 && p.gold === 0,
  },
  {
    id: 'completionist',
    title: 'The Completionist',
    hint: '???',
    description: 'You unlocked every non-hidden achievement.',
    category: 'legacy',
    hidden: true,
    icon: '✅',
    // Evaluated in useGameLoop after all others — this def's check is a fallback
    check: () => false,
  },
];

// IDs of all non-hidden achievements (used for completionist check)
export const NON_HIDDEN_ACHIEVEMENT_IDS = ACHIEVEMENTS
  .filter((a) => !a.hidden)
  .map((a) => a.id);

/**
 * Returns IDs of newly unlocked achievements.
 * Does NOT include 'completionist' — that is handled separately in useGameLoop.
 */
export function checkAchievements(
  player: Player,
  worldSeed?: WorldSeed
): string[] {
  const already = new Set((player.achievements ?? []).map((a) => a.id));
  const newIds: string[] = [];

  for (const def of ACHIEVEMENTS) {
    if (def.id === 'completionist') continue;
    if (already.has(def.id)) continue;
    try {
      if (def.check(player, worldSeed)) {
        newIds.push(def.id);
      }
    } catch {
      // silently skip malformed checks
    }
  }

  return newIds;
}
