'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Player, WorldSeed } from '../lib/types';
import { advanceGameTime } from '../lib/helpers';
import { migrateWorldSeed } from '../lib/worldgen';
import type { UseStorageReturn } from './useStorage';

export interface GameStateContext {
  player: Player | null;
  setPlayer: (player: Player) => void;
  worldSeed: WorldSeed | null;
  setWorldSeed: (seed: WorldSeed) => void;
  messages: any[];
  setMessages: (messages: any[]) => void;
  narrative: string;
  setNarrative: (narrative: string) => void;
  appendNarrative: (chunk: string) => void;
  log: any[];
  setLog: (log: any[]) => void;
  addMessage: (role: string, content: string) => void;
  addLogEntry: (type: string, text: string) => void;
  advanceTime: (hours: number) => void;
  isLoaded: boolean;
}

export function useGameState(storage: UseStorageReturn): GameStateContext {
  const [player, setPlayer] = useState<Player | null>(null);
  const [worldSeed, setWorldSeed] = useState<WorldSeed | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [narrative, setNarrative] = useState<string>('');
  const [log, setLog] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Load initial game state from storage on mount
   */
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        const savedGame = await storage.loadGame();

        if (savedGame) {
          const migrated = migrateWorldSeed(savedGame.worldSeed) as WorldSeed;
          setPlayer(savedGame.player);
          setWorldSeed(migrated);
          setMessages(savedGame.messages);
          setNarrative(savedGame.narrative);
          setLog(savedGame.log);
          // Re-save if the worldSeed was upgraded so future loads are instant
          if (migrated !== savedGame.worldSeed && savedGame.player) {
            storage.saveGame(savedGame.player, migrated, savedGame.messages, savedGame.narrative, savedGame.log);
          }
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load game state:', error);
        setIsLoaded(true);
      }
    };

    initializeGameState();
  }, [storage]);

  /**
   * Add message to conversation history (max 40 recent messages).
   * We buffer 40 so the server can detect and summarize content that
   * falls outside the 20-message Anthropic window.
   */
  const addMessage = useCallback((role: string, content: string) => {
    setMessages((prev) => {
      const newMessages = [...prev, { role, content }];
      return newMessages.slice(Math.max(0, newMessages.length - 40));
    });
  }, []);

  /**
   * Add entry to game log (max 60 recent entries)
   */
  const addLogEntry = useCallback((type: string, text: string) => {
    setLog((prev) => {
      const newLog = [
        ...prev,
        {
          type,
          text,
          timestamp: new Date().toISOString(),
        },
      ];
      // Keep only last 60 entries
      return newLog.slice(Math.max(0, newLog.length - 60));
    });
  }, []);

  /**
   * Advance game time by hours
   */
  const appendNarrative = useCallback((chunk: string) => {
    setNarrative(prev => prev + chunk);
  }, []);

  const advanceTime = useCallback((hours: number) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      return advanceGameTime(prev, hours);
    });
  }, []);

  return {
    player,
    setPlayer,
    worldSeed,
    setWorldSeed,
    messages,
    setMessages,
    narrative,
    setNarrative,
    appendNarrative,
    log,
    setLog,
    addMessage,
    addLogEntry,
    advanceTime,
    isLoaded,
  };
}
