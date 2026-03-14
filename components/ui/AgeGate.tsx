'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface Props {
  onConfirm: () => void;
}

export function AgeGate({ onConfirm }: Props) {
  const { T, tf } = useTheme();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0d0a06',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        background: '#13100a',
        border: '1px solid #2e2010',
        maxWidth: 480,
        width: '90%',
        padding: '36px 32px',
        textAlign: 'center',
      }}>
        {/* Title */}
        <div style={{
          ...tf,
          color: '#f0c060',
          fontSize: 28,
          letterSpacing: 4,
          marginBottom: 8,
        }}>
          AETHERMOOR
        </div>

        {/* 18+ badge */}
        <div style={{
          display: 'inline-block',
          border: '2px solid #f0c060',
          color: '#f0c060',
          fontFamily: '"Cinzel", Georgia, serif',
          fontSize: 20,
          fontWeight: 'bold',
          padding: '4px 18px',
          letterSpacing: 2,
          margin: '16px 0',
        }}>
          18+
        </div>

        <p style={{ color: '#d4b896', fontSize: 15, margin: '16px 0 8px' }}>
          This game is intended for players aged <strong>18 and over</strong>.
        </p>
        <p style={{ color: '#8a6f4b', fontSize: 13, margin: '0 0 28px' }}>
          By entering you confirm that you are at least 18 years of age and agree to our{' '}
          <a href="/legal" target="_blank" rel="noopener noreferrer" style={{ color: '#c4873a' }}>
            Terms of Service
          </a>.
        </p>

        {/* Confirm button */}
        <button
          onClick={onConfirm}
          style={{
            background: '#f0c060',
            color: '#0d0a06',
            border: 'none',
            fontFamily: '"Cinzel", Georgia, serif',
            fontSize: 15,
            fontWeight: 'bold',
            letterSpacing: 1,
            padding: '12px 36px',
            cursor: 'pointer',
            width: '100%',
            marginBottom: 12,
          }}
        >
          I am 18 or older — Enter
        </button>

        {/* Deny button */}
        <button
          onClick={() => { window.location.href = 'https://www.google.com'; }}
          style={{
            background: 'none',
            color: '#8a6f4b',
            border: '1px solid #2e2010',
            fontFamily: 'Georgia, serif',
            fontSize: 13,
            padding: '8px 24px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          I am under 18 — Leave
        </button>
      </div>
    </div>
  );
}
