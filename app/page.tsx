'use client';

import React, { useState, useEffect } from 'react';
import { HowToPlayModal } from '@/components/modals/HowToPlayModal';
import { OptionsModal, type ModelTier } from '@/components/modals/OptionsModal';
import { PatchNotesScreen } from '@/components/screens/PatchNotesScreen';
import { TokenShopScreen } from '@/components/screens/TokenShopScreen';
import { SaveSlotModal } from '@/components/modals/SaveSlotModal';
import { THEMES, type ThemeKey } from '@/components/providers/ThemeProvider';
import type { SlotSummary } from '@/hooks/useStorage';

export default function Home() {
  const [showGuide, setShowGuide] = useState(false);
  const [showPatches, setShowPatches] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [optionsTier, setOptionsTier] = useState<ModelTier>('haiku');
  const [optionsLanguage, setOptionsLanguage] = useState('English');
  const [showTokenShop, setShowTokenShop] = useState(false);
  const [showLoadSlot, setShowLoadSlot] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('standard');
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerIdCopied, setPlayerIdCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/tokens/balance', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.balance != null) setTokenBalance(d.balance); })
      .catch(() => {});

    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.playerId != null) setPlayerId(String(d.playerId)); })
      .catch(() => {});

    if (window.location.search.includes('payment=success')) {
      setPaymentSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setPaymentSuccess(false), 8000);
    }
  }, []);

  const openOptions = () => {
    try {
      const raw = localStorage.getItem('rpg-player-slot1');
      if (raw) {
        const p = JSON.parse(raw);
        if (p.modelTier) setOptionsTier(p.modelTier);
        if (p.language) setOptionsLanguage(p.language);
      }
    } catch {}
    setShowOptions(true);
  };

  const saveOption = (key: 'modelTier' | 'language', value: string) => {
    try {
      const raw = localStorage.getItem('rpg-player-slot1');
      const p = raw ? JSON.parse(raw) : {};
      p[key] = value;
      localStorage.setItem('rpg-player-slot1', JSON.stringify(p));
    } catch {}
  };

  const loadSlots = async (): Promise<SlotSummary[]> => {
    try {
      const res = await fetch('/api/save?slots=all', { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}
    return [1, 2, 3].map((s) => ({ slot: s, empty: true }));
  };

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
          <p style={{
            fontSize: '0.75rem',
            color: '#b8925a',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            fontFamily: 'Cinzel, serif',
          }}>
            The Chronicles of
          </p>
          <h1 style={{
            fontSize: '3rem',
            color: '#c9a84c',
            marginBottom: '0.4rem',
            letterSpacing: '0.12em',
            fontFamily: 'Cinzel, serif',
            fontWeight: 'bold',
          }}>
            AETHERMOOR
          </h1>
          <p style={{
            fontSize: '0.75rem',
            color: '#b8925a',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'Cinzel, serif',
            marginBottom: '1.25rem',
          }}>
            A Heroic Fantasy Adventure
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid #2e2010', maxWidth: 320, margin: '0 auto 1.25rem' }} />
          <p style={{
            fontSize: '0.95rem',
            lineHeight: '1.8',
            color: '#b8925a',
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            A darkness stirs across the continent. Ancient powers awaken. The fate of Aethermoor rests with one unlikely soul — perhaps you.
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
          <button onClick={() => setShowLoadSlot(true)} style={buttonStyle}>
            Load Game
          </button>
          <button onClick={() => setShowGuide(true)} style={secondaryButtonStyle}>
            How to Play
          </button>
          <button onClick={() => setShowPatches(true)} style={secondaryButtonStyle}>
            Patch Notes
          </button>
          <button onClick={openOptions} style={secondaryButtonStyle}>
            Options
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
          {playerId && (
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(playerId);
                  setPlayerIdCopied(true);
                  setTimeout(() => setPlayerIdCopied(false), 1500);
                } catch {}
              }}
              title="Your Player ID — share with support or friends."
              style={{ ...secondaryButtonStyle, color: playerIdCopied ? '#c9a84c' : '#b8925a', borderColor: playerIdCopied ? '#c9a84c' : '#7a6040', transition: 'color 0.2s, border-color 0.2s' }}
            >
              {playerIdCopied ? '✓ ID Copied' : '🪪 Player ID'}
            </button>
          )}

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
          <p style={{ marginTop: '0.75rem' }}>
            <a
              href="/legal"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#7a6040', textDecoration: 'underline', textUnderlineOffset: 2, fontSize: '0.75rem' }}
            >
              Legal (Terms · Privacy · Refund Policy)
            </a>
          </p>
        </div>
      </div>

      {/* Modals */}
      {showOptions && (
        <OptionsModal
          currentTier={optionsTier}
          currentLanguage={optionsLanguage}
          onSelectTier={(t) => { setOptionsTier(t); saveOption('modelTier', t); }}
          onSelectLanguage={(l) => { setOptionsLanguage(l); saveOption('language', l); }}
          onClose={() => setShowOptions(false)}
        />
      )}
      {showGuide && <HowToPlayModal onClose={() => setShowGuide(false)} />}
      {showPatches && <PatchNotesScreen onClose={() => setShowPatches(false)} />}
      {showTokenShop && (
        <TokenShopScreen
          tokenBalance={tokenBalance ?? 0}
          paymentSuccess={paymentSuccess}
          onClose={() => setShowTokenShop(false)}
        />
      )}
      {showLoadSlot && (
        <SaveSlotModal
          mode="load"
          currentSlot={1}
          loadSlots={loadSlots}
          onLoad={(slot) => { window.location.href = `/game?slot=${slot}`; }}
          onClose={() => setShowLoadSlot(false)}
        />
      )}
    </div>
  );
}
