'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { LOCATION_TIERS } from '@/lib/constants';
import type { Player } from '@/lib/types';

interface ContextBarProps {
  player: Player | null;
  isLoading: boolean;
  isDyslexic?: boolean;
  locationGrid?: Record<string, any>;
}

const TIER_ICONS: Record<string, string> = {
  hamlet:         '🏚️',
  village:        '🏘️',
  town:           '🏛️',
  city:           '🏰',
  capital:        '👑',
  poi:            '⚠️',
  dungeon:        '🗝️',
  farm_arable:    '🌾',
  farm_livestock: '🐄',
  farm_mixed:     '🐂',
};

function locationIcon(locationName: string | undefined, locationGrid?: Record<string, any>): string {
  if (!locationName) return '🌲';
  const lower = locationName.toLowerCase();
  if (lower.includes('dungeon')) return '🗝️';
  // Check locationGrid type first (most accurate)
  const gridEntry = locationGrid?.[locationName];
  if (gridEntry?.type && TIER_ICONS[gridEntry.type]) return TIER_ICONS[gridEntry.type];
  // Fallback to LOCATION_TIERS
  const tier = LOCATION_TIERS[locationName];
  return TIER_ICONS[tier] ?? '🌲';
}

export function ContextBar({ player, isLoading, isDyslexic, locationGrid }: ContextBarProps) {
  const { T } = useTheme();
  const ctx = player?.context || 'explore';

  const tf = {
    fontFamily: isDyslexic
      ? "'OpenDyslexic',Arial,sans-serif"
      : "'Cinzel','Palatino Linotype',serif",
  };

  const ctxInfo: Record<string, { label: string; color: string; icon: string }> = {
    explore: { label: 'Exploring',   color: '#4a8040', icon: '🌲' },
    town:    { label: 'In Town',     color: '#7060a0', icon: '🏛️' },
    combat:  { label: 'In Combat!',  color: '#c03030', icon: '⚔️' },
    npc:     { label: 'Talking',     color: '#4070a0', icon: '💬' },
    camp:    { label: 'Camped',      color: '#a06020', icon: '🔥' },
    travel:  { label: 'Travelling',  color: '#5080a0', icon: '🚶' },
    farm:    { label: 'At Farm',     color: '#6a8040', icon: '🌾' },
    poi:     { label: 'At Location', color: '#806030', icon: '⚠️' },
  };
  const ctxData = ctxInfo[ctx] || ctxInfo.explore;

  const locIcon = locationIcon(player?.location, locationGrid);
  const dest = (player as any)?.travelDestination;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 16px',
        borderBottom: `1px solid ${T.border}`,
        background: ctxData.color + '18',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: 14 }}>{ctxData.icon}</span>
      <span style={{ ...tf, color: ctxData.color, fontSize: 10, letterSpacing: 2 }}>
        {ctxData.label.toUpperCase()}
      </span>
      <div style={{ width: 1, height: 12, background: T.border, margin: '0 2px', flexShrink: 0 }} />
      <span style={{ fontSize: 13 }}>{locIcon}</span>
      <span style={{ ...tf, color: T.gold, fontSize: 10, letterSpacing: 1 }}>
        {ctx === 'travel' && dest ? `${player?.location} → ${dest}` : player?.location}
      </span>
      {isLoading && (
        <span style={{ color: T.textFaint, fontSize: 10, fontStyle: 'italic', marginLeft: 'auto', fontFamily: 'Crimson Text,serif' }}>
          weaving story...
        </span>
      )}
    </div>
  );
}
