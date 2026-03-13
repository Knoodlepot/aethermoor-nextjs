'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';

interface BestiaryScreenProps {
  player: Player;
  onClose: () => void;
}

// Tier is stored as a number (0=minion,1=standard,2=veteran,3=boss) per types.ts,
// but old JS saves may have stored the string label instead. Handle both.
function getTierStr(tier: any): string {
  if (typeof tier === 'string') return tier.toLowerCase();
  const map: Record<number, string> = { 0: 'minion', 1: 'standard', 2: 'veteran', 3: 'boss' };
  return map[tier as number] || 'standard';
}

export function BestiaryScreen({ player, onClose }: BestiaryScreenProps) {
  const { T, tf, bf } = useTheme();
  const [tab, setTab] = React.useState('all');
  const [selected, setSelected] = React.useState<any>(null);

  const allEntries = (player.bestiary || [])
    .slice()
    .sort((a, b) => b.timesKilled - a.timesKilled);

  const totalKills = allEntries.reduce((s, b) => s + b.timesKilled, 0);

  const tabs = ['all', 'minion', 'standard', 'veteran', 'boss'];
  const tabLabels: Record<string, string> = {
    all: '⚔️ All',
    minion: '💀 Minion',
    standard: '🗡️ Standard',
    veteran: '🛡️ Veteran',
    boss: '👑 Boss',
  };

  const shown =
    tab === 'all'
      ? allEntries
      : allEntries.filter((b) => getTierStr(b.tier) === tab);

  const tierColor: Record<string, string> = {
    minion: '#808080',
    standard: '#60a060',
    veteran: '#c0a030',
    boss: '#c04040',
  };

  return (
    <div
      style={{
        ...bf,
        position: 'fixed',
        inset: 0,
        background: T.bg + 'ee',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.accent}`,
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: T.panelAlt,
            borderBottom: `1px solid ${T.border}`,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ ...tf, color: T.gold, fontSize: 16, letterSpacing: 2 }}>
              📖 BESTIARY
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {totalKills} total kills · {allEntries.length} enemy types discovered
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
            overflowX: 'auto',
          }}
        >
          {tabs.map((id) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setSelected(null);
              }}
              style={{
                flex: 1,
                minWidth: 60,
                background: tab === id ? T.selectedBg : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === id ? T.accent : 'transparent'}`,
                color: tab === id ? T.gold : T.textMuted,
                padding: '10px 8px',
                cursor: 'pointer',
                fontSize: 11,
                ...tf,
                letterSpacing: 1,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {tabLabels[id]}
            </button>
          ))}
        </div>

        {/* Entry list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {shown.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                color: T.textFaint,
                fontSize: 14,
                fontStyle: 'italic',
              }}
            >
              {allEntries.length === 0
                ? 'No enemies recorded yet — venture out and slay something.'
                : 'No enemies of this type recorded yet.'}
            </div>
          ) : (
            shown.map((b, i) => {
              const tierStr = getTierStr(b.tier);
              const isSelected = selected?.archetypeId === b.archetypeId;
              return (
                <div
                  key={b.archetypeId || i}
                  onClick={() => setSelected(isSelected ? null : b)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${T.border}`,
                    cursor: 'pointer',
                    background: isSelected ? T.selectedBg : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22, lineHeight: '1' }}>{b.icon || '⚔️'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ ...tf, color: T.text, fontSize: 13 }}>
                          {b.name || b.archetypeId}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            ...tf,
                            color: tierColor[tierStr] || T.textMuted,
                            border: `1px solid ${(tierColor[tierStr] || T.border) + '44'}`,
                            padding: '1px 5px',
                            letterSpacing: 1,
                          }}
                        >
                          {tierStr.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                        First encountered Day {b.firstKilledDay || '?'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ ...tf, color: T.gold, fontSize: 18 }}>
                        ×{b.timesKilled}
                      </div>
                      <div style={{ fontSize: 10, color: T.textFaint }}>kills</div>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 20,
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: `1px solid ${T.border}44`,
                        paddingLeft: 32,
                      }}
                    >
                      <span style={{ fontSize: 10, color: T.textFaint }}>
                        📋 Type: {b.archetypeId}
                      </span>
                      <span style={{ fontSize: 10, color: T.textFaint }}>
                        📅 Last slain: Day {b.lastKilledDay || '?'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
