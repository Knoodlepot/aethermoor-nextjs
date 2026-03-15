'use client';

import React, { useMemo } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

const DEATH_VERSES = [
  "The ravens found you before dawn. By morning, there was nothing left but the echo of your name.",
  "They say the river carried something away that night. No one came to claim it.",
  "Your boots were found still warm. The rest of the story was never told.",
  "A gravestone marks the place where you were last seen. Someone carved your name crooked into the stone.",
  "The world continued, as worlds do. You did not.",
  "The cold came quickly. It always does.",
  "In the end, the darkness was quieter than you expected.",
  "No one saw you fall. No one was meant to.",
  "The inn keeper left a candle burning. After a fortnight, they blew it out.",
  "Some said they heard you, in the wind between the stones. Others said it was just the wind.",
];

interface DeathScreenProps {
  name: string;
  cls: string;
  level: number;
  gameDay: number;
  finalNarrative: string;
  onBeginAnew: () => void;
}

export function DeathScreen({ name, cls, level, gameDay, finalNarrative, onBeginAnew }: DeathScreenProps) {
  const { T, tf } = useTheme();

  const verse = useMemo(() => {
    const idx = Math.floor(Math.random() * DEATH_VERSES.length);
    return DEATH_VERSES[idx];
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        background: '#0a0806',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* Gravestone icon */}
        <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.85 }}>⚰️</div>

        {/* Title */}
        <h2
          style={{
            ...tf,
            color: '#8a0000',
            fontSize: 26,
            letterSpacing: 6,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          You Have Fallen
        </h2>

        {/* Character epitaph */}
        <p
          style={{
            ...tf,
            color: '#6a5c4a',
            fontSize: 12,
            letterSpacing: 3,
            marginBottom: 28,
            textTransform: 'uppercase',
          }}
        >
          {name} &bull; {cls} &bull; Level {level} &bull; Day {gameDay}
        </p>

        {/* Final narrative — what the narrator wrote before death */}
        {finalNarrative && (
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #2a1f14',
              borderRadius: 4,
              padding: '16px 20px',
              marginBottom: 24,
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontFamily: "'Crimson Text', serif",
                fontSize: 15,
                color: '#7a6a58',
                lineHeight: 1.8,
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              {finalNarrative.length > 400
                ? finalNarrative.slice(0, 400).trimEnd() + '…'
                : finalNarrative}
            </p>
          </div>
        )}

        {/* Tragic verse */}
        <p
          style={{
            fontFamily: "'Crimson Text', serif",
            fontSize: 16,
            color: '#5a4a38',
            lineHeight: 1.9,
            marginBottom: 36,
            fontStyle: 'italic',
          }}
        >
          {verse}
        </p>

        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 1,
            background: '#3a2a1a',
            margin: '0 auto 32px',
          }}
        />

        {/* Begin Anew */}
        <button
          onClick={onBeginAnew}
          style={{
            ...tf,
            display: 'block',
            width: 260,
            margin: '0 auto 16px',
            background: '#3a1a0a',
            color: '#c8a46a',
            padding: '14px 48px',
            fontSize: 12,
            letterSpacing: 4,
            cursor: 'pointer',
            textTransform: 'uppercase' as const,
            border: '1px solid #6a3a1a',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.background = '#5a2a10';
            (e.target as HTMLButtonElement).style.color = '#f0c880';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.background = '#3a1a0a';
            (e.target as HTMLButtonElement).style.color = '#c8a46a';
          }}
        >
          ✦ Begin Anew
        </button>

        <p
          style={{
            fontFamily: "'Crimson Text', serif",
            fontSize: 12,
            color: '#3a2a1a',
            letterSpacing: 1,
          }}
        >
          Your story ends here. A new one awaits.
        </p>
      </div>
    </div>
  );
}
