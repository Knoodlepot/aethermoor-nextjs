'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { WorldSeed } from '@/lib/types';

interface MainQuestPanelProps {
  worldSeed: WorldSeed | null;
  onOpen?: () => void;
}

export function MainQuestPanel({ worldSeed, onOpen }: MainQuestPanelProps) {
  const { T, tf } = useTheme();

  if (!worldSeed) return null;

  const ACT_LABELS = ['', 'I: The Hook', 'II: The Threat', 'III: The Confrontation', 'IV: The Reckoning', 'V: The Revelation', '✓ Complete'];
  const ACT_COLORS = ['', '#c0a030', '#c07030', '#c04030', '#9030c0', '#a060c0', '#60a060'];
  const ACT_HINTS = [
    '',
    'Uncover the ominous signs in the world — seek out NPCs, investigate strange occurrences',
    'Confront a direct threat from the villain — gather allies, understand the danger',
    'Endure a major loss or setback — press forward despite the darkness',
    'Navigate betrayal and despair — find reason to fight on when all seems lost',
    'Prepare for the final confrontation — gather what you need and journey to the lair',
    'Victory is yours!'
  ];

  const act = Math.min(worldSeed.currentAct || 1, 6);
  const col = ACT_COLORS[act];
  const done = worldSeed.mainQuestComplete;
  const hint = ACT_HINTS[act] || '';

  return (
    <div
      onClick={onOpen}
      style={{
        background: T.panelAlt,
        border: `1px solid ${col}44`,
        padding: 10,
        marginBottom: 0,
        cursor: onOpen ? 'pointer' : 'default',
        transition: 'all 0.2s',
        opacity: onOpen ? 1 : 1,
      }}
      onMouseEnter={(e) => {
        if (onOpen) (e.currentTarget as HTMLDivElement).style.borderColor = col + '88';
      }}
      onMouseLeave={(e) => {
        if (onOpen) (e.currentTarget as HTMLDivElement).style.borderColor = col + '44';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 15 }}>{worldSeed.templateIcon || '⚔️'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ ...tf, fontSize: 9, color: col, letterSpacing: 2, marginBottom: 1 }}>
            MAIN QUEST · ACT {ACT_LABELS[act]}
          </div>
          <div style={{ fontSize: 11, color: T.text, ...tf }}>
            {worldSeed.questTitle}
          </div>
        </div>
      </div>

      {/* Act progress bar */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
        {[1, 2, 3, 4].map((a) => {
          const filled =
            (a === 1 && worldSeed.act1Complete) ||
            (a === 2 && worldSeed.act2Complete) ||
            (a === 3 && worldSeed.act3Complete) ||
            (a === 4 && done);
          const curr = act === a && !done;
          return (
            <div
              key={a}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: filled ? '#60a060' : curr ? col : T.border,
                transition: 'background 0.4s',
              }}
            />
          );
        })}
      </div>

      {/* Villain info */}
      {act >= 2 ? (
        <div style={{ fontSize: 10, color: T.textMuted }}>
          <span style={{ color: '#c04030', fontFamily: 'Crimson Text,serif', fontSize: 11 }}>
            {worldSeed.villainName}
          </span>
          <span style={{ color: T.textFaint }}> · {worldSeed.villainType}</span>
        </div>
      ) : (
        <div style={{ fontSize: 10, color: T.textFaint, fontStyle: 'italic', fontFamily: 'Crimson Text,serif' }}>
          Something stirs in the dark...
        </div>
      )}

      {/* Ally info */}
      {worldSeed.allyRevealed && (
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>
          🤝 {worldSeed.allyName?.split(',')[0]}
          {worldSeed.betrayalSprung && (
            <span style={{ color: '#c04030' }}> ⚠ Betrayed</span>
          )}
        </div>
      )}

      {/* Victory banner */}
      {done && (
        <div style={{ fontSize: 9, color: '#60a060', marginTop: 3, ...tf, letterSpacing: 1 }}>
          VICTORY · {(worldSeed.finalTone || '').toUpperCase()}
        </div>
      )}

    </div>
  );
}
