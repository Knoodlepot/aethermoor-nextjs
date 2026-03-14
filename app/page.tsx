'use client';

import React, { useState, useEffect } from 'react';
import { HowToPlayModal } from '@/components/modals/HowToPlayModal';
import { PatchNotesScreen } from '@/components/screens/PatchNotesScreen';
import { TokenShopScreen } from '@/components/screens/TokenShopScreen';
import { THEMES, type ThemeKey } from '@/components/providers/ThemeProvider';

export default function Home() {
  const [showGuide, setShowGuide] = useState(false);
  const [showPatches, setShowPatches] = useState(false);
  const [showTokenShop, setShowTokenShop] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('standard');
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/tokens/balance', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.balance != null) setTokenBalance(d.balance); })
      .catch(() => {});

    if (window.location.search.includes('payment=success')) {
      setPaymentSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setPaymentSuccess(false), 8000);
    }
  }, []);

  const tokenColor = (t: number) =>
    t > 50 ? '#80c060' : t > 20 ? '#c9a84c' : t > 10 ? '#e08030' : '#e04040';
  const tokenBorderColor = (t: number) =>
    t > 50 ? '#80c06044' : t > 20 ? '#c9a84c44' : t > 10 ? '#e0803066' : '#e0404066';

  const buttonStyle = {
    padding: '0.85rem 1.5rem',
    background: '#c9a84c',
    color: '#0d0d1a',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold' as const,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const secondaryButtonStyle = {
    padding: '0.75rem 1.25rem',
    background: 'transparent',
    color: '#c9a84c',
    border: '1px solid #c9a84c',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold' as const,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      backgroundColor: '#0d0a06',
      fontFamily: 'Georgia, serif',
      color: '#d4b896',
      padding: '1rem',
    }}>
      <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚔️</div>
          <h1 style={{
            fontSize: '3rem',
            color: '#c9a84c',
            marginBottom: '0.5rem',
            letterSpacing: '0.12em',
            fontFamily: 'Cinzel, serif',
            fontWeight: 'bold',
          }}>
            AETHERMOOR
          </h1>
          <p style={{
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
            lineHeight: '1.8',
            color: '#b8925a',
            maxWidth: '500px',
            margin: '1rem auto',
          }}>
            An AI-powered browser RPG where your choices matter, and every decision shapes your destiny.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}>
          <a href="/game?new=1" style={buttonStyle}>
            New Game
          </a>
          <a href="/game" style={buttonStyle}>
            Load Game
          </a>
          <button onClick={() => setShowGuide(true)} style={secondaryButtonStyle}>
            How to Play
          </button>
          <button onClick={() => setShowPatches(true)} style={secondaryButtonStyle}>
            Patch Notes
          </button>
        </div>

        {/* Account & Theme */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #2e2010',
        }}>
          <a href="/auth" style={secondaryButtonStyle}>
            Account
          </a>

          {tokenBalance !== null && (
            <div
              onClick={() => setShowTokenShop(true)}
              title="Buy more tokens"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                padding: '0.5rem 0.85rem',
                border: `1px solid ${tokenBorderColor(tokenBalance)}`,
                borderRadius: 4,
                background: tokenBalance <= 10 ? '#e0404022' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <span>🪙</span>
              <span style={{
                fontSize: '0.9rem',
                color: tokenColor(tokenBalance),
                fontWeight: tokenBalance <= 20 ? 'bold' : 'normal',
                fontFamily: 'Georgia, serif',
                animation: tokenBalance <= 10 ? 'pulse 1s infinite' : 'none',
              }}>
                {tokenBalance}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#b8925a' }}>Theme:</label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as ThemeKey)}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#0a0805',
                color: '#c9a84c',
                border: '1px solid #2e2010',
                borderRadius: '3px',
                fontSize: '0.9rem',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
              }}
            >
              {Object.entries(THEMES).map(([key, theme]) => (
                <option key={key} value={key}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #2e2010',
          fontSize: '0.8rem',
          color: '#7a6040',
        }}>
          <p>v0.3.0 — Next.js Migration Phase 5</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            Your theme preference resets on reload. Sign in to save your settings.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showGuide && <HowToPlayModal onClose={() => setShowGuide(false)} />}
      {showPatches && <PatchNotesScreen onClose={() => setShowPatches(false)} />}
      {showTokenShop && (
        <TokenShopScreen
          tokenBalance={tokenBalance ?? 0}
          paymentSuccess={paymentSuccess}
          onClose={() => setShowTokenShop(false)}
        />
      )}
    </div>
  );
}
