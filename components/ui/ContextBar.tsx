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
  onShop?: () => void;
  onSkills?: () => void;
  onQuests?: () => void;
  onMap?: () => void;
  activeQuestCount?: number;
  skillPts?: number;
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

export function ContextBar({ player, isLoading, isDyslexic, locationGrid, onShop, onSkills, onQuests, onMap, activeQuestCount = 0, skillPts = 0 }: ContextBarProps) {
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
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        {isLoading && (
          <span style={{ color: T.textFaint, fontSize: 10, fontStyle: 'italic', fontFamily: 'Crimson Text,serif', marginRight: 4 }}>
            weaving story...
          </span>
        )}
        {(onShop || onSkills || onQuests || onMap) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {onShop && (
              <button
                onClick={onShop}
                disabled={!['town', 'npc'].includes(ctx)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${['town', 'npc'].includes(ctx) ? T.accent : T.border}`,
                  color: ['town', 'npc'].includes(ctx) ? T.gold : T.textFaint,
                  padding: '2px 6px', fontSize: 9, cursor: ['town', 'npc'].includes(ctx) ? 'pointer' : 'not-allowed',
                  fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 0.5,
                  opacity: ['town', 'npc'].includes(ctx) ? 1 : 0.4,
                  whiteSpace: 'nowrap' as const,
                }}
              >🛒 Shop</button>
            )}
            {onSkills && (
              <button
                onClick={onSkills}
                style={{
                  background: 'transparent',
                  border: `1px solid ${T.accent}`,
                  color: T.gold, padding: '2px 6px', fontSize: 9, cursor: 'pointer',
                  fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 0.5,
                  position: 'relative' as const, whiteSpace: 'nowrap' as const,
                }}
              >
                🌿 Skills
                {skillPts > 0 && (
                  <span style={{ position: 'absolute', top: -3, right: -3, background: '#60a060', color: '#fff', borderRadius: '50%', width: 12, height: 12, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {skillPts}
                  </span>
                )}
              </button>
            )}
            {onQuests && (
              <button
                onClick={onQuests}
                style={{
                  background: 'transparent',
                  border: `1px solid ${T.accent}`,
                  color: T.gold, padding: '2px 6px', fontSize: 9, cursor: 'pointer',
                  fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 0.5,
                  position: 'relative' as const, whiteSpace: 'nowrap' as const,
                }}
              >
                📜 Quests
                {activeQuestCount > 0 && (
                  <span style={{ position: 'absolute', top: -3, right: -3, background: T.accent, color: '#fff', borderRadius: '50%', width: 12, height: 12, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeQuestCount}
                  </span>
                )}
              </button>
            )}
            {onMap && (
              <button
                onClick={onMap}
                style={{
                  background: 'transparent',
                  border: `1px solid ${T.accent}`,
                  color: T.gold, padding: '2px 6px', fontSize: 9, cursor: 'pointer',
                  fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 0.5,
                  whiteSpace: 'nowrap' as const,
                }}
              >🗺️ Map</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
