'use client';

import React, { useState, useEffect } from 'react';
import { HowToPlayModal } from '@/components/modals/HowToPlayModal';
import { OptionsModal, type ModelTier } from '@/components/modals/OptionsModal';
import { PatchNotesScreen } from '@/components/screens/PatchNotesScreen';
import { TokenShopScreen } from '@/components/screens/TokenShopScreen';
import { SaveSlotModal } from '@/components/modals/SaveSlotModal';
import type { SlotSummary } from '@/hooks/useStorage';

const FEATURES = [
  {
    title: 'AI-Powered Narrator',
    desc: 'Every action shapes a living story written by Claude in real time. The world remembers what you do.',
  },
  {
    title: 'Procedural Worlds',
    desc: 'A unique continent generated fresh every game — named lands, factions, roads, and dark secrets.',
  },
  {
    title: 'Four Classes',
    desc: 'Warrior, Rogue, Mage, or Cleric. Each has a full skill tree and a distinct way the world reacts to you.',
  },
  {
    title: 'Pay Per Turn',
    desc: 'Start free with 50 tokens. Top up when you want more story. No subscription, no time pressure.',
  },
];

export default function Home() {
  const [showGuide, setShowGuide] = useState(false);
  const [showPatches, setShowPatches] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [optionsTier, setOptionsTier] = useState<ModelTier>('haiku');
  const [narrativeNudges, setNarrativeNudges] = useState<boolean>(true);
  const [showTokenShop, setShowTokenShop] = useState(false);
  const [showLoadSlot, setShowLoadSlot] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [playerIdCopied, setPlayerIdCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.playerId != null) {
          setPlayerId(String(d.playerId));
          fetch('/api/tokens/balance', { credentials: 'include' })
            .then((r) => r.ok ? r.json() : null)
            .then((b) => { if (b?.balance != null) setTokenBalance(b.balance); })
            .catch(() => {});
        }
        setAuthLoaded(true);
      })
      .catch(() => { setAuthLoaded(true); });

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
      }
    } catch {}
    setShowOptions(true);
  };

  const saveOption = (key: 'modelTier' | 'narrativeNudges', value: string | boolean) => {
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

  const showMarketing = authLoaded && !playerId;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      height: '100dvh',
      overflowY: 'auto',
      backgroundColor: '#0d0a06',
      fontFamily: 'Georgia, serif',
      color: '#d4b896',
      padding: '2rem 1rem',
    }}>
      <div style={{ maxWidth: showMarketing ? '760px' : '700px', width: '100%', textAlign: 'center' }}>

        {/* Header — always visible */}
        <div style={{ marginBottom: showMarketing ? '2rem' : '3rem' }}>
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

        {/* Marketing section — only for visitors who are not logged in */}
        {showMarketing && (
          <>
            {/* Feature grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0.75rem',
              marginBottom: '2rem',
              textAlign: 'left',
            }}>
              {FEATURES.map((f) => (
                <div key={f.title} style={{
                  background: '#13100a',
                  border: '1px solid #2e2010',
                  borderRadius: '4px',
                  padding: '1rem 1.25rem',
                }}>
                  <div style={{
                    color: '#c9a84c',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    marginBottom: '0.4rem',
                  }}>
                    {f.title}
                  </div>
                  <div style={{
                    color: '#9a7f5a',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                  }}>
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="/auth?mode=register" style={{
                ...buttonStyle,
                fontSize: '1rem',
                padding: '1rem 2.5rem',
                letterSpacing: '0.08em',
              }}>
                Create Free Account — 50 Tokens Free
              </a>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <a href="/auth" style={{
                fontSize: '0.8rem',
                color: '#7a6040',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}>
                Already have an account? Log in
              </a>
            </div>

            {/* Separator */}
            <hr style={{ border: 'none', borderTop: '1px solid #2e2010', margin: '0 auto 2rem', maxWidth: 320 }} />
          </>
        )}

        {/* Main Action Buttons — always visible */}
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

          {playerId && (
            <button onClick={() => setShowTokenShop(true)} style={secondaryButtonStyle}>
              Top Up Tokens
            </button>
          )}
          {playerId && (
            <div
              onClick={() => setShowTokenShop(true)}
              title="Buy more tokens"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                padding: '0.5rem 0.85rem',
                border: `1px solid ${tokenBorderColor(tokenBalance ?? 0)}`,
                borderRadius: 4,
                background: (tokenBalance ?? 0) <= 10 && tokenBalance !== null ? '#e0404022' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <span>🪙</span>
              <span style={{
                fontSize: '0.9rem',
                color: tokenBalance !== null ? tokenColor(tokenBalance) : '#7a6040',
                fontWeight: tokenBalance !== null && tokenBalance <= 20 ? 'bold' : 'normal',
                fontFamily: 'Georgia, serif',
              }}>
                {tokenBalance !== null ? tokenBalance : '—'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #2e2010',
          fontSize: '0.8rem',
          color: '#7a6040',
        }}>
          <p>Early Access</p>
          <p style={{ marginTop: '0.75rem' }}>
            <a
              href="/pricing"
              style={{ color: '#7a6040', textDecoration: 'underline', textUnderlineOffset: 2, fontSize: '0.75rem', marginRight: '1rem' }}
            >
              Pricing
            </a>
            <a
              href="/legal"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#7a6040', textDecoration: 'underline', textUnderlineOffset: 2, fontSize: '0.75rem' }}
            >
              Terms · Privacy · Refund Policy
            </a>
          </p>
        </div>
      </div>

      {/* Modals */}
      {showOptions && (
        <OptionsModal
          currentTier={optionsTier}
          onSelectTier={(t) => { setOptionsTier(t); saveOption('modelTier', t); }}
          narrativeNudges={narrativeNudges}
          onToggleNudges={(v) => { setNarrativeNudges(v); saveOption('narrativeNudges', v); }}
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
