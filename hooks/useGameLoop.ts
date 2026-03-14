'use client';

import { useState, useCallback } from 'react';
import type { Player, WorldSeed } from '../lib/types';
import type { GameStateContext } from './useGameState';
import type { UIContext } from './useUI';
import type { UseStorageReturn } from './useStorage';

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
  _authToken?: string | null
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

        // ── Deterministic short-circuits (no narrator call needed) ──
        if (command.startsWith('unlock_skill:')) {
          const skillId = command.slice('unlock_skill:'.length);
          const currentSkills: string[] = Array.isArray((updatedPlayer as any).unlockedSkills)
            ? (updatedPlayer as any).unlockedSkills
            : [];
          const currentPoints: number = (updatedPlayer as any).skillPoints ?? 0;

          if (currentSkills.includes(skillId)) {
            return { success: false, error: 'Already unlocked' };
          }
          if (currentPoints < 1) {
            return { success: false, error: 'No skill points available' };
          }

          updatedPlayer = {
            ...updatedPlayer,
            unlockedSkills: [...currentSkills, skillId],
            skillPoints: currentPoints - 1,
          } as typeof updatedPlayer;

          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // 1. Add user message to conversation history
        const userMessages = [...gs.messages.slice(-19), { role: 'user', content: command }];
        gs.setMessages(userMessages);

        // 2. Call Claude API for narration
        const narratorResponse = await callClaude(userMessages, updatedPlayer, updatedSeed);

        if (!narratorResponse.success || !narratorResponse.narrative) {
          return { success: false, error: narratorResponse.error || 'AI call failed' };
        }

        // 3. Use server-applied state updates from /api/claude
        const cleanNarrative = narratorResponse.cleanNarrative || narratorResponse.narrative;
        if (narratorResponse.player && narratorResponse.worldSeed) {
          updatedPlayer = narratorResponse.player;
          updatedSeed = narratorResponse.worldSeed;
        }

        // 4. Update all game state
        gs.setPlayer(updatedPlayer);
        gs.setWorldSeed(updatedSeed);
        gs.setNarrative(cleanNarrative);
        gs.addMessage('assistant', cleanNarrative);

        // 5. Add to game log
        gs.addLogEntry('action', command);
        gs.addLogEntry('response', cleanNarrative.substring(0, 100));

        // 6. Save game state — include assistant response in saved history
        const fullMessages = [
          ...userMessages,
          { role: 'assistant', content: cleanNarrative },
        ];
        await storage.saveGame(updatedPlayer, updatedSeed, fullMessages, cleanNarrative, gs.log);

        // 7. Update UI suggestions if provided
        if (narratorResponse.suggestions && narratorResponse.suggestions.length > 0) {
          ui.setSuggestions(narratorResponse.suggestions.slice(0, 5));
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
    ): Promise<{
      success: boolean;
      narrative?: string;
      cleanNarrative?: string;
      player?: Player;
      worldSeed?: WorldSeed;
      suggestions?: string[];
      error?: string;
    }> => {
      try {
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            messages,
            player,
            worldSeed,
          }),
        });

        const data = await res.json();

        if (res.ok && data.narrative) {
          return {
            success: true,
            narrative: data.narrative,
            cleanNarrative: data.cleanNarrative,
            player: data.player,
            worldSeed: data.worldSeed,
            suggestions: data.suggestions,
          };
        }

        return { success: false, error: data.error || 'API error' };
      } catch (error: any) {
        console.error('Claude API error:', error);
        return { success: false, error: error.message };
      }
    },
    []
  );

  return {
    executeCommand,
    isLoading,
    combatState,
    setCombatState,
  };
}
