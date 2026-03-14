'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { FACTIONS, FACTION_JOIN_OFFERS } from '@/lib/constants';

// ────────────────────────────────────────────────────────────

interface FactionOfferModalProps {
  factionId: string;
  player: Player;
  onJoin: (factionId: string) => void;
  onDecline: (factionId: string) => void;
  onRival: (factionId: string) => void;
}

export function FactionOfferModal({
  factionId,
  player,
  onJoin,
  onDecline,
  onRival,
}: FactionOfferModalProps) {
  const { T, tf, bf } = useTheme();

  const fac = FACTIONS[factionId] ?? {
    id: factionId,
    name: factionId,
    icon: '⚔️',
    color: '#c0a030',
    group: 'world' as const,
    desc: '',
    rankAbilities: {},
    rankRewards: {},
  };

  const offer = FACTION_JOIN_OFFERS[factionId] ?? {
    title: 'An Offer of Membership',
    icon: fac.icon,
    pitch: '"We believe you have what it takes. Will you join us?"',
    gift: 'Unknown Gift',
    giftDesc: 'A gift from the faction.',
  };

  // The Forgotten has a special pitch when offered after multiple declines
  const isForgotten = factionId === 'the_forgotten';
  const declineCount = (player as any).factionDeclines?.length ?? 0;
  const pitchText =
    isForgotten && declineCount >= 2 && offer.pitchDeclined
      ? offer.pitchDeclined
      : offer.pitch;

  const rivalFacId: string | undefined = offer.rival;
  const rivalFac = rivalFacId ? (FACTIONS[rivalFacId] ?? null) : null;

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
          border: `1px solid ${fac.color}`,
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: T.panelAlt,
            borderBottom: `1px solid ${fac.color}44`,
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>{fac.icon}</span>
            <div>
              <div
                style={{
                  ...tf,
                  color: T.textMuted,
                  fontSize: 10,
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                {offer.title.toUpperCase()}
              </div>
              <div style={{ ...tf, color: fac.color, fontSize: 17, letterSpacing: 1 }}>
                {fac.name}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: T.textFaint, paddingLeft: 40 }}>
            {fac.desc}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {/* Pitch */}
          <div
            style={{
              fontStyle: 'italic',
              color: T.text,
              fontSize: 14,
              lineHeight: 1.7,
              borderLeft: `3px solid ${fac.color}`,
              paddingLeft: 14,
              marginBottom: 20,
            }}
          >
            {pitchText}
          </div>

          {/* Gift */}
          <div
            style={{
              background: T.panelAlt,
              border: `1px solid ${T.border}`,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                ...tf,
                color: T.accent,
                fontSize: 10,
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              JOINING GIFT
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  background: T.border,
                  border: `1px solid ${fac.color}44`,
                  padding: '6px 12px',
                  ...tf,
                  color: fac.color,
                  fontSize: 12,
                  flexShrink: 0,
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {offer.gift}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
                {offer.giftDesc}
              </div>
            </div>
          </div>

          {/* Rival warning */}
          {rivalFac && (
            <div
              style={{
                background: '#2a0808',
                border: '1px solid #c0303044',
                padding: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  ...tf,
                  color: '#c03030',
                  fontSize: 10,
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                RIVAL FACTION
              </div>
              <div style={{ fontSize: 12, color: T.text }}>
                {offer.rivalNote
                  ? offer.rivalNote
                  : <>Joining {fac.name} will mark you as a rival to{' '}<span style={{ color: rivalFac.color }}>{rivalFac.name}</span>. Their members will be hostile to you.</>}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => onJoin(factionId)}
              style={{
                width: '100%',
                background: fac.color + '22',
                border: `1px solid ${fac.color}`,
                color: fac.color,
                padding: '12px',
                fontSize: 13,
                ...tf,
                letterSpacing: '0.06em',
                cursor: 'pointer',
              }}
            >
              Accept — Join {fac.name}
            </button>
            <button
              onClick={() => onDecline(factionId)}
              style={{
                width: '100%',
                background: 'transparent',
                border: `1px solid ${T.border}`,
                color: T.textMuted,
                padding: '11px',
                fontSize: 13,
                ...tf,
                letterSpacing: '0.06em',
                cursor: 'pointer',
              }}
            >
              Not now — Decline
            </button>
            {rivalFac && (
              <button
                onClick={() => onRival(factionId)}
                style={{
                  width: '100%',
                  background: '#2a080822',
                  border: '1px solid #c0303066',
                  color: '#c06060',
                  padding: '11px',
                  fontSize: 13,
                  ...tf,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                Refuse outright — Side with {rivalFac.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
