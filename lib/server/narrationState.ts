import { parseAllTags, processParsedTags, stripContextTag } from '@/lib/tagParsers';
import { cleanupExpiredEvents, pruneBestiary } from '@/lib/helpers';
import type { Player, WorldSeed } from '@/lib/types';

export interface NarrationStateInput {
  player: Player;
  worldSeed?: WorldSeed;
  narrative: string;
  messages: Array<{ role: string; content: string }>;
}

export interface NarrationStateResult {
  cleanNarrative: string;
  player: Player;
  worldSeed: WorldSeed;
  suggestions: string[];
  fullMessages: Array<{ role: string; content: string }>;
}

export function applyNarrationState({
  player,
  worldSeed,
  narrative,
  messages,
}: NarrationStateInput): NarrationStateResult {
  const tags = parseAllTags(narrative);
  const cleanNarrative = stripContextTag(narrative);
  const tagResult = processParsedTags(player, tags, worldSeed || ({} as WorldSeed));
  const cleanup = cleanupExpiredEvents(tagResult.player, tagResult.worldSeed || ({} as WorldSeed));
  const finalPlayer = pruneBestiary(cleanup.player);
  const finalWorldSeed = cleanup.worldSeed as WorldSeed;
  const suggestions = Array.isArray(tags.suggestions) ? tags.suggestions.slice(0, 5) : [];
  const fullMessages = [...messages.slice(-19), { role: 'assistant', content: cleanNarrative }];

  return {
    cleanNarrative,
    player: finalPlayer,
    worldSeed: finalWorldSeed,
    suggestions,
    fullMessages,
  };
}