'use client';

import { useState, useCallback } from 'react';
import type { Player, WorldSeed } from '../lib/types';
import type { GameStateContext } from './useGameState';
import type { UIContext } from './useUI';
import type { UseStorageReturn } from './useStorage';
import { parseAllTags, stripContextTag, processParsedTags } from '../lib/tagParsers';
import { cleanupExpiredEvents, pruneBestiary } from '../lib/helpers';

export interface GameLoopContext {
  executeCommand: (
    command: string,
    gameState: GameStateContext
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  combatState: any | null;
  setCombatState: (state: any | null) => void;
}

/**
 * useGameLoop - Orchestrate all game actions and coordinate tag extraction
 */
export function useGameLoop(
  gameState: GameStateContext,
  ui: UIContext,
  storage: UseStorageReturn,
  authToken?: string | null
): GameLoopContext {
  const [isLoading, setIsLoading] = useState(false);
  const [combatState, setCombatState] = useState<any | null>(null);

  /**
   * Main command execution orchestrator
   */
  const executeCommand = useCallback(
    async (command: string, gs: GameStateContext): Promise<{ success: boolean; error?: string }> => {
      // Guard checks
      if (isLoading || !gs.player || !gs.worldSeed) {
        return { success: false, error: 'Game not ready' };
      }

      setIsLoading(true);
      try {
        // Track state for save
        let updatedPlayer = gs.player;
        let updatedSeed = gs.worldSeed;

        // 1. Add user message to conversation history
        const userMessages = [...gs.messages.slice(-19), { role: 'user', content: command }];
        gs.setMessages(userMessages);

        // 2. Call Claude API for narration
        const narratorResponse = await callClaude(userMessages, updatedPlayer, updatedSeed);

        if (!narratorResponse.success || !narratorResponse.narrative) {
          return { success: false, error: narratorResponse.error || 'AI call failed' };
        }

        // 3. Parse all tags from response
        const rawNarrative = narratorResponse.narrative;
        const parsedTags = parseAllTags(rawNarrative);

        // 4. Strip tags from display narrative
        const cleanNarrative = stripContextTag(rawNarrative);

        // 5. Apply all parsed tags to game state
        const tagResult = processParsedTags(updatedPlayer, parsedTags, updatedSeed);
        updatedPlayer = tagResult.player;
        updatedSeed = { ...updatedSeed, ...tagResult.worldSeed };

        // 6. Update world events and cleanup
        let cleanupResult = cleanupExpiredEvents(updatedPlayer, updatedSeed);
        updatedPlayer = cleanupResult.player;
        updatedSeed = cleanupResult.worldSeed;

        // 7. Prune bestiary
        updatedPlayer = pruneBestiary(updatedPlayer);

        // 8. Update all game state
        gs.setPlayer(updatedPlayer);
        gs.setWorldSeed(updatedSeed);
        gs.setNarrative(cleanNarrative);
        gs.addMessage('assistant', cleanNarrative);

        // 9. Add to game log
        gs.addLogEntry('action', command);
        gs.addLogEntry('response', cleanNarrative.substring(0, 100));

        // 10. Save game state — include assistant response in saved history
        const fullMessages = [
          ...userMessages,
          { role: 'assistant', content: cleanNarrative },
        ];
        await storage.saveGame(updatedPlayer, updatedSeed, fullMessages, cleanNarrative, gs.log);

        // 11. Update UI suggestions if provided
        if (parsedTags.suggestions && parsedTags.suggestions.length > 0) {
          ui.setSuggestions(parsedTags.suggestions.slice(0, 5));
          ui.setPendingSuggestion(null);
        } else {
          ui.setSuggestions([]);
        }

        return { success: true };
      } catch (error: any) {
        console.error('Command execution error:', error);
        return { success: false, error: error.message || 'Command failed' };
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, storage, gameState, ui]
  );

  /**
   * Call Claude API with current game context
   */
  const callClaude = useCallback(
    async (
      messages: any[],
      player: Player,
      worldSeed: WorldSeed
    ): Promise<{ success: boolean; narrative?: string; error?: string }> => {
      try {
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
          body: JSON.stringify({
            messages,
            player,
            worldSeed,
          }),
        });

        const data = await res.json();

        if (res.ok && data.narrative) {
          return { success: true, narrative: data.narrative };
        }

        return { success: false, error: data.error || 'API error' };
      } catch (error: any) {
        console.error('Claude API error:', error);
        return { success: false, error: error.message };
      }
    },
    [authToken]
  );

  return {
    executeCommand,
    isLoading,
    combatState,
    setCombatState,
  };
}
