'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface OutOfTokensScreenProps {
  onBuyTokens: () => void;
  onReturnToTitle: () => void;
}

export function OutOfTokensScreen({ onBuyTokens, onReturnToTitle }: OutOfTokensScreenProps) {
  const { T, tf } = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🪙</div>
        <h2
          style={{
            ...tf,
            color: T.gold,
            fontSize: 24,
            letterSpacing: 3,
            marginBottom: 16,
          }}
        >
          YOUR TOKENS ARE SPENT
        </h2>
        <p
          style={{
            color: T.textMuted,
            fontFamily: "'Crimson Text',serif",
            fontSize: 15,
            marginBottom: 32,
            lineHeight: 1.7,
          }}
        >
          The narrator&apos;s voice fades to silence. Your adventure awaits — purchase more tokens
          to continue your legend.
        </p>
        <button
          onClick={onBuyTokens}
          style={{
            ...tf,
            display: 'block',
            width: 260,
            margin: '0 auto 16px',
            background: T.gold,
            color: T.bg,
            padding: '14px 48px',
            fontSize: 13,
            letterSpacing: 3,
            cursor: 'pointer',
            textTransform: 'uppercase' as const,
            border: 'none',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
        >
          🪙 Buy Tokens
        </button>
        <button
          onClick={onReturnToTitle}
          style={{
            ...tf,
            display: 'block',
            width: 260,
            margin: '0 auto',
            background: 'transparent',
            border: `1px solid ${T.border}`,
            color: T.textMuted,
            padding: '10px 48px',
            fontSize: 11,
            letterSpacing: 3,
            cursor: 'pointer',
            textTransform: 'uppercase' as const,
            transition: 'all 0.2s',
          }}
        >
          ← Return to Title
        </button>
      </div>
    </div>
  );
}
