'use client';

import React, { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

const TOKEN_PACKAGES = [
  { pkg: 'starter',    label: 'Starter',    tokens: 100,   price: '£1.00' },
  { pkg: 'adventurer', label: 'Adventurer', tokens: 290,   price: '£2.50' },
  { pkg: 'hero',       label: 'Hero',       tokens: 650,   price: '£5.00' },
  { pkg: 'legend',     label: 'Legend',     tokens: 1500,  price: '£9.99' },
  { pkg: 'champion',   label: 'Champion',   tokens: 3500,  price: '£19.99' },
  { pkg: 'immortal',   label: 'Immortal',   tokens: 8500,  price: '£49.99' },
];

function tokenColor(t: number): string {
  return t > 50 ? '#80c060' : t > 20 ? '#c9a84c' : t > 10 ? '#e08030' : '#e04040';
}

interface TokenShopScreenProps {
  tokenBalance: number;
  paymentSuccess: boolean;
  onClose: () => void;
}

export function TokenShopScreen({ tokenBalance, paymentSuccess, onClose }: TokenShopScreenProps) {
  const { T, tf } = useTheme();
  const [buying, setBuying] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  const buyTokens = async (pkg: string) => {
    setBuying(pkg);
    setBuyError(null);
    try {
      const res = await fetch('/api/tokens/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBuyError('Could not start checkout. Please try again.');
        setBuying(null);
      }
    } catch {
      setBuyError('Could not reach the server. Check your connection and try again.');
      setBuying(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 8000,
        background: T.bg,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '48px 16px 40px',
      }}
    >
      {/* Back button */}
      <button
        onClick={onClose}
        style={{
          ...tf,
          background: 'transparent',
          border: 'none',
          color: T.textMuted,
          fontSize: 11,
          letterSpacing: 2,
          cursor: 'pointer',
          textTransform: 'uppercase' as const,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <h1 style={{ ...tf, fontSize: 32, color: T.gold, letterSpacing: 4, marginBottom: 8 }}>
        AETHERMOOR
      </h1>
      <div style={{ ...tf, color: T.textMuted, fontSize: 12, letterSpacing: 2, marginBottom: 24 }}>
        TOKEN SHOP
      </div>

      {/* Token Balance */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ color: tokenColor(tokenBalance), fontSize: 22, ...tf, fontWeight: 'bold' }}>
          {tokenBalance}
        </div>
        <div style={{ color: T.textMuted, fontSize: 13 }}>tokens remaining</div>
        {tokenBalance <= 20 && (
          <div
            style={{
              color: tokenColor(tokenBalance),
              fontSize: 12,
              fontWeight: 'bold',
              animation: tokenBalance <= 10 ? 'pulse 1s infinite' : 'none',
            }}
          >
            {tokenBalance <= 10 ? '⚠️ Critical!' : '⚠️ Low!'}
          </div>
        )}
      </div>

      {/* Payment success banner */}
      {paymentSuccess && (
        <div
          style={{
            background: '#2a5c2a',
            border: '1px solid #4a9c4a',
            color: '#90d890',
            padding: '10px 16px',
            marginBottom: 20,
            fontSize: 13,
            borderRadius: 3,
          }}
        >
          ✅ Payment successful! Your tokens have been added.
        </div>
      )}

      {/* Error banner */}
      {buyError && (
        <div
          style={{
            background: '#5c2a2a',
            border: '1px solid #9c4a4a',
            color: '#d89090',
            padding: '10px 16px',
            marginBottom: 20,
            fontSize: 13,
            borderRadius: 3,
          }}
        >
          {buyError}
        </div>
      )}

      {/* Package grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          maxWidth: 420,
          width: '100%',
          margin: '0 auto 20px',
        }}
      >
        {TOKEN_PACKAGES.map(({ pkg, label, tokens, price }) => (
          <button
            key={pkg}
            onClick={() => buyTokens(pkg)}
            disabled={buying === pkg}
            style={{
              background: T.panel,
              border: `1px solid ${T.border}`,
              color: T.text,
              padding: '16px 12px',
              cursor: buying === pkg ? 'wait' : 'pointer',
              textAlign: 'center' as const,
              transition: 'all 0.2s',
              fontFamily: "'Crimson Text',serif",
              opacity: buying && buying !== pkg ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = T.accent;
              (e.currentTarget as HTMLElement).style.background = T.selectedBg ?? T.panelAlt;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = T.border;
              (e.currentTarget as HTMLElement).style.background = T.panel;
            }}
          >
            <div style={{ ...tf, color: T.gold, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>
              {tokens.toLocaleString()} tokens
            </div>
            <div style={{ ...tf, color: T.accent, fontSize: 15, fontWeight: 'bold' }}>{price}</div>
          </button>
        ))}
      </div>

      <div
        style={{
          color: T.textFaint ?? T.textMuted,
          fontSize: 11,
          marginTop: 4,
          fontStyle: 'italic',
          fontFamily: "'Crimson Text',serif",
        }}
      >
        Each turn uses 1 token · Tokens never expire · New players receive 100 free tokens
      </div>
    </div>
  );
}
