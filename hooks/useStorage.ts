'use client';

import { useState, useCallback, useMemo } from 'react';
import { storageGet, storageSet, storageGetJson, storageSetJson } from './useLocalStorage';
import type { Player, WorldSeed } from '../lib/types';

export interface GameSaveState {
  player: Player | null;
  worldSeed: WorldSeed | null;
  messages: any[];
  narrative: string;
  log: any[];
}

export interface SlotSummary {
  slot: number;
  empty: boolean;
  name?: string;
  cls?: string;
  level?: number;
  location?: string;
  savedAt?: string;
}

export interface UseStorageReturn {
  currentSlot: number;
  setCurrentSlot: (slot: number) => void;
  loadGame: (slot?: number) => Promise<GameSaveState | null>;
  saveGame: (
    player: Player,
    worldSeed: WorldSeed,
    messages: any[],
    narrative: string,
    log: any[],
    slot?: number
  ) => Promise<void>;
  saveToCloud: (
    player: Player,
    worldSeed: WorldSeed,
    messages: any[],
    narrative: string,
    log: any[],
    slot?: number
  ) => Promise<boolean>;
  loadFromCloud: (slot?: number) => Promise<GameSaveState | null>;
  loadSlots: () => Promise<SlotSummary[]>;
  isSyncingCloud: boolean;
  clearAllSaves: () => void;
}

/**
 * useStorage - Manage dual save system (localStorage + cloud save via API)
 */
export function useStorage(authToken?: string | null, initialSlot: number = 1): UseStorageReturn {
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(initialSlot);

  /**
   * Save to localStorage (synchronous, always succeeds)
   */
  const saveToLocalStorage = useCallback(
    (
      player: Player,
      worldSeed: WorldSeed,
      messages: any[],
      narrative: string,
      log: any[],
      slot: number = 1
    ) => {
      try {
        const s = `slot${slot}`;
        storageSetJson(`rpg-player-${s}`, player);
        storageSetJson(`rpg-seed-${s}`, worldSeed);
        storageSetJson(`rpg-messages-${s}`, messages);
        storageSet(`rpg-narrative-${s}`, narrative);
        storageSetJson(`rpg-log-${s}`, log);
        // Legacy slot 1 compat: also write old keys so existing code still works
        if (slot === 1) {
          storageSetJson('rpg-player', player);
          storageSetJson('rpg-seed', worldSeed);
          storageSetJson('rpg-messages', messages);
          storageSet('rpg-narrative', narrative);
          storageSetJson('rpg-log', log);
        }
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    },
    []
  );

  /**
   * Load from localStorage
   */
  const loadFromLocalStorage = useCallback((slot: number = 1): GameSaveState | null => {
    try {
      const s = `slot${slot}`;
      // Try slot-keyed first, fall back to legacy keys for slot 1
      const player = storageGetJson<Player>(`rpg-player-${s}`, null as any)
        ?? (slot === 1 ? storageGetJson<Player>('rpg-player', null as any) : null);
      const worldSeed = storageGetJson<WorldSeed>(`rpg-seed-${s}`, null as any)
        ?? (slot === 1 ? storageGetJson<WorldSeed>('rpg-seed', null as any) : null);
      const messages = storageGetJson<any[]>(`rpg-messages-${s}`, []);
      const narrative = storageGet(`rpg-narrative-${s}`) ?? (slot === 1 ? storageGet('rpg-narrative') : '') ?? '';
      const log = storageGetJson<any[]>(`rpg-log-${s}`, []);

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
      log: any[],
      slot: number = 1
    ): Promise<boolean> => {
      if (!authToken) return false;

      setIsSyncingCloud(true);
      try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            player_json: JSON.stringify(player),
            seed_json: JSON.stringify(worldSeed),
            messages_json: JSON.stringify(messages),
            narrative,
            log_json: JSON.stringify(log),
            slot,
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
   * Load from cloud via API
   */
  const loadFromCloud = useCallback(async (slot: number = 1): Promise<GameSaveState | null> => {
    if (!authToken) return null;
    try {
      const res = await fetch(`/api/save?slot=${slot}`, { credentials: 'include' });
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
   * Load summaries of all 3 slots
   */
  const loadSlots = useCallback(async (): Promise<SlotSummary[]> => {
    if (!authToken) {
      // Build from localStorage
      return [1, 2, 3].map((s) => {
        const save = loadFromLocalStorage(s);
        if (!save?.player) return { slot: s, empty: true };
        const p = save.player as any;
        return {
          slot: s,
          empty: false,
          name: p.name ?? 'Unknown',
          cls: p.class ?? '',
          level: p.level ?? 1,
          location: p.location ?? '',
        };
      });
    }
    try {
      const res = await fetch('/api/save?slots=all', { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}
    return [1, 2, 3].map((s) => ({ slot: s, empty: true }));
  }, [authToken, loadFromLocalStorage]);

  /**
   * Main saveGame — saves to localStorage first, then cloud async
   */
  const saveGame = useCallback(
    async (
      player: Player,
      worldSeed: WorldSeed,
      messages: any[],
      narrative: string,
      log: any[],
      slot: number = currentSlot
    ): Promise<void> => {
      saveToLocalStorage(player, worldSeed, messages, narrative, log, slot);
      if (authToken) {
        await saveToCloud(player, worldSeed, messages, narrative, log, slot);
      }
    },
    [authToken, currentSlot, saveToLocalStorage, saveToCloud]
  );

  /**
   * Main loadGame — tries cloud first, falls back to localStorage
   */
  const loadGame = useCallback(async (slot: number = currentSlot): Promise<GameSaveState | null> => {
    if (authToken) {
      const cloudData = await loadFromCloud(slot);
      if (cloudData) return cloudData;
    }
    return loadFromLocalStorage(slot);
  }, [authToken, currentSlot, loadFromCloud, loadFromLocalStorage]);

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

  return useMemo(() => ({
    currentSlot,
    setCurrentSlot,
    loadGame,
    saveGame,
    saveToCloud,
    loadFromCloud,
    loadSlots,
    isSyncingCloud,
    clearAllSaves,
  }), [currentSlot, setCurrentSlot, loadGame, saveGame, saveToCloud, loadFromCloud, loadSlots, isSyncingCloud, clearAllSaves]);
}
