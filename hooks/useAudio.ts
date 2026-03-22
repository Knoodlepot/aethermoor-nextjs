import { useEffect, useRef } from 'react';
import { getAudioManager } from '@/lib/audio';
import type { Player } from '@/lib/types';

const SETTLEMENT_TYPES = new Set(['hamlet', 'village', 'town', 'city', 'capital']);

function resolveAmbientKey(
  context: string | undefined,
  location: string | undefined,
  locationGrid: Record<string, any> | undefined,
): string {
  if (context === 'combat') return 'combat';
  if (context === 'dungeon') return 'dungeon';
  if (context === 'rest')    return 'tavern';

  // 'explore' — check if the location is actually a settlement
  if (location && locationGrid) {
    const entry = locationGrid[location];
    if (entry?.type && SETTLEMENT_TYPES.has(entry.type)) return 'town';
  }

  return 'wilderness';
}

interface UseAudioProps {
  player: Player | null;
  locationGrid: Record<string, any> | undefined;
  isPlaying: boolean; // true once the game has started (not on main menu)
}

export interface UseAudioReturn {
  playSFX: (key: string) => void;
  setMusicVolume: (v: number) => void;
  setSFXVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  getMusicVolume: () => number;
  getSFXVolume: () => number;
  getMuted: () => boolean;
}

export function useAudio({ player, locationGrid, isPlaying }: UseAudioProps): UseAudioReturn {
  const prevContextKey = useRef<string | null>(null);
  const prevLevel = useRef<number>(0);
  const prevGold = useRef<number>(0);

  // Ambient track — changes with context/location
  useEffect(() => {
    const am = getAudioManager();
    if (!am) return;

    if (!isPlaying || !player) {
      am.stopAmbient();
      prevContextKey.current = null;
      return;
    }

    const key = resolveAmbientKey(player.context, player.location, locationGrid);
    if (key !== prevContextKey.current) {
      am.playAmbient(key);
      prevContextKey.current = key;
    }
  }, [player?.context, player?.location, locationGrid, isPlaying]);

  // Level-up SFX
  useEffect(() => {
    if (!player) return;
    const am = getAudioManager();
    if (!am) return;
    if (prevLevel.current > 0 && player.level > prevLevel.current) {
      am.playSFX('levelup');
    }
    prevLevel.current = player.level;
  }, [player?.level]);

  // Gold gain SFX
  useEffect(() => {
    if (!player) return;
    const am = getAudioManager();
    if (!am) return;
    if (prevGold.current > 0 && player.gold > prevGold.current) {
      am.playSFX('gold');
    }
    prevGold.current = player.gold;
  }, [player?.gold]);

  const am = getAudioManager();

  return {
    playSFX:        (key: string) => am?.playSFX(key),
    setMusicVolume: (v: number)   => am?.setMusicVolume(v),
    setSFXVolume:   (v: number)   => am?.setSFXVolume(v),
    setMuted:       (m: boolean)  => am?.setMuted(m),
    getMusicVolume: ()            => am?.getMusicVolume() ?? 0.35,
    getSFXVolume:   ()            => am?.getSFXVolume()   ?? 0.7,
    getMuted:       ()            => am?.getMuted()       ?? false,
  };
}
