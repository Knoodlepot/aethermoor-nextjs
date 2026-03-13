'use client';

import { useState, useCallback } from 'react';
import { storageGet, storageSet, storageGetJson, storageSetJson } from './useLocalStorage';
import type { Player, WorldSeed } from '../lib/types';

export interface GameSaveState {
  player: Player | null;
  worldSeed: WorldSeed | null;
  messages: any[];
  narrative: string;
  log: any[];
}

export interface UseStorageReturn {
  loadGame: () => Promise<GameSaveState | null>;
  saveGame: (
    player: Player,
    worldSeed: WorldSeed,
    messages: any[],
    narrative: string,
    log: any[]
  ) => Promise<void>;
  saveToCloud: (
    player: Player,
    worldSeed: WorldSeed,
    messages: any[],
    narrative: string,
    log: any[]
  ) => Promise<boolean>;
  loadFromCloud: () => Promise<GameSaveState | null>;
  isSyncingCloud: boolean;
  clearAllSaves: () => void;
}

/**
 * useStorage - Manage dual save system (localStorage + cloud save via API)
 */
export function useStorage(authToken?: string | null): UseStorageReturn {
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  /**
   * Save to localStorage (synchronous, always succeeds)
   */
  const saveToLocalStorage = useCallback(
    (
      player: Player,
      worldSeed: WorldSeed,
      messages: any[],
      narrative: string,
      log: any[]
    ) => {
      try {
        storageSetJson('rpg-player', player);
        storageSetJson('rpg-seed', worldSeed);
        storageSetJson('rpg-messages', messages);
        storageSet('rpg-narrative', narrative);
        storageSetJson('rpg-log', log);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    },
    []
  );

  /**
   * Load from localStorage
   */
  const loadFromLocalStorage = useCallback((): GameSaveState | null => {
    try {
      const player = storageGetJson<Player>('rpg-player', null as any);
      const worldSeed = storageGetJson<WorldSeed>('rpg-seed', null as any);
      const messages = storageGetJson<any[]>('rpg-messages', []);
      const narrative = storageGet('rpg-narrative') || '';
      const log = storageGetJson<any[]>('rpg-log', []);

      if (player && worldSeed) {
        return { player, worldSeed, messages, narrative, log };
      }

      return null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, []);

  /**
   * Save to cloud via API (asynchronous, fire-and-forget if fails)
   */
  const saveToCloud = useCallback(
    async (
      player: Player,
      worldSeed: WorldSeed,
      messages: any[],
      narrative: string,
      log: any[]
    ): Promise<boolean> => {
      if (!authToken) return false;

      setIsSyncingCloud(true);
      try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            player_json: JSON.stringify(player),
            seed_json: JSON.stringify(worldSeed),
            messages_json: JSON.stringify(messages),
            narrative,
            log_json: JSON.stringify(log),
          }),
        });

        return res.ok;
      } catch (error) {
        console.warn('Cloud save failed (localStorage will persist):', error);
        return false;
      } finally {
        setIsSyncingCloud(false);
      }
    },
    [authToken]
  );

  /**
   * Load from cloud via API (try cloud first if authenticated)
   */
  const loadFromCloud = useCallback(async (): Promise<GameSaveState | null> => {
    if (!authToken) return null;

    try {
      const res = await fetch('/api/save', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.player_json) return null;
        return {
          player: JSON.parse(data.player_json),
          worldSeed: JSON.parse(data.seed_json),
          messages: JSON.parse(data.messages_json || '[]'),
          narrative: data.narrative || '',
          log: JSON.parse(data.log_json || '[]'),
        };
      }
    } catch (error) {
      console.warn('Cloud load failed, falling back to localStorage:', error);
    }

    return null;
  }, [authToken]);

  /**
   * Main saveGame function - saves to localStorage first, then cloud async
   */
  const saveGame = useCallback(
    async (
      player: Player,
      worldSeed: WorldSeed,
      messages: any[],
      narrative: string,
      log: any[]
    ): Promise<void> => {
      // Always save to localStorage first (synchronous path)
      saveToLocalStorage(player, worldSeed, messages, narrative, log);

      // Then save to cloud if authenticated (async, fire-and-forget)
      if (authToken) {
        await saveToCloud(player, worldSeed, messages, narrative, log);
      }
    },
    [authToken, saveToLocalStorage, saveToCloud]
  );

  /**
   * Main loadGame function - tries cloud first if authenticated, falls back to localStorage
   */
  const loadGame = useCallback(async (): Promise<GameSaveState | null> => {
    // Try cloud first if authenticated
    if (authToken) {
      const cloudData = await loadFromCloud();
      if (cloudData) {
        return cloudData;
      }
    }

    // Fall back to localStorage
    return loadFromLocalStorage();
  }, [authToken, loadFromCloud, loadFromLocalStorage]);

  /**
   * Clear all saved data from localStorage
   */
  const clearAllSaves = useCallback(() => {
    try {
      localStorage.removeItem('rpg-player');
      localStorage.removeItem('rpg-seed');
      localStorage.removeItem('rpg-messages');
      localStorage.removeItem('rpg-narrative');
      localStorage.removeItem('rpg-log');
    } catch (error) {
      console.warn('Failed to clear saves:', error);
    }
  }, []);

  return {
    loadGame,
    saveGame,
    saveToCloud,
    loadFromCloud,
    isSyncingCloud,
    clearAllSaves,
  };
}
