'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player, Companion } from '../../lib/types';

interface Props {
  player: Player;
  onDismiss: () => void;
  onClose: () => void;
}

const RELATIONSHIP_LABEL: Record<string, string> = {
  neutral: 'Neutral',
  friendly: 'Friendly',
  loyal: 'Loyal',
};

const RELATIONSHIP_COLOR: Record<string, string> = {
  neutral: '#9a9a9a',
  friendly: '#6dbf6d',
  loyal: '#c9a84c',
};

export default function CompanionScreen({ player, onDismiss, onClose }: Props) {
  const { T } = useTheme();
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const companion = player.companion as Companion | null | undefined;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: '8px',
        width: '100%', maxWidth: '420px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: T.text }}>
            Companion
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: T.textMuted, fontSize: '1.2rem', lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          {!companion ? (
            <NoCompanion />
          ) : (
            <CompanionDetails
              companion={companion}
              confirmDismiss={confirmDismiss}
              setConfirmDismiss={setConfirmDismiss}
              onDismiss={onDismiss}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function NoCompanion() {
  const { T } = useTheme();
  return (
    <div style={{ textAlign: 'center', padding: '24px 8px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧭</div>
      <div style={{ fontWeight: 600, color: T.text, marginBottom: '6px' }}>
        Travelling Alone
      </div>
      <div style={{ fontSize: '0.8rem', color: T.textMuted, lineHeight: 1.5 }}>
        You have no companion. Meet someone worth trusting on your travels — a sellsword at a tavern, a scholar in need of an escort, a wanderer who owes you a debt — and they may offer to join you.
      </div>
    </div>
  );
}

function CompanionDetails({
  companion,
  confirmDismiss,
  setConfirmDismiss,
  onDismiss,
}: {
  companion: Companion;
  confirmDismiss: boolean;
  setConfirmDismiss: (v: boolean) => void;
  onDismiss: () => void;
}) {
  const { T } = useTheme();
  const hpPct = Math.round((companion.hp / companion.maxHp) * 100);
  const hpColor = hpPct > 60 ? '#6dbf6d' : hpPct > 30 ? '#c9a84c' : '#c94c4c';
  const relColor = RELATIONSHIP_COLOR[companion.relationship] ?? '#9a9a9a';
  const relLabel = RELATIONSHIP_LABEL[companion.relationship] ?? companion.relationship;

  return (
    <div>
      {/* Portrait row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{
          fontSize: '3rem', lineHeight: 1,
          background: T.panel ?? T.panelAlt,
          border: `1px solid ${T.border}`,
          borderRadius: '8px',
          width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {companion.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: T.text }}>
            {companion.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: T.textMuted, marginTop: '2px' }}>
            {companion.role}
          </div>
          <div style={{
            display: 'inline-block',
            marginTop: '4px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: relColor,
            border: `1px solid ${relColor}`,
            borderRadius: '3px',
            padding: '1px 6px',
            letterSpacing: 0.5,
          }}>
            {relLabel}
          </div>
        </div>
      </div>

      {/* HP bar */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.72rem', color: T.textMuted, marginBottom: '4px',
        }}>
          <span>HP</span>
          <span style={{ color: hpColor }}>{companion.hp} / {companion.maxHp}</span>
        </div>
        <div style={{
          height: '6px', background: T.border, borderRadius: '3px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${hpPct}%`,
            background: hpColor,
            transition: 'width 0.3s, background 0.3s',
          }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px', marginBottom: '14px',
      }}>
        {([['STR', companion.str], ['AGI', companion.agi], ['WIL', companion.wil]] as [string, number][]).map(([label, val]) => (
          <div key={label} style={{
            background: T.panel ?? T.panelAlt,
            border: `1px solid ${T.border}`,
            borderRadius: '6px',
            padding: '6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.65rem', color: T.textMuted, letterSpacing: 1 }}>{label}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: T.text }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Ability */}
      <div style={{
        background: T.panel ?? T.panelAlt,
        border: `1px solid ${T.border}`,
        borderRadius: '6px',
        padding: '10px 12px',
        marginBottom: '12px',
      }}>
        <div style={{ fontSize: '0.65rem', color: T.textMuted, letterSpacing: 1, marginBottom: '4px' }}>
          PASSIVE ABILITY
        </div>
        <div style={{ fontSize: '0.82rem', color: T.text }}>
          {companion.ability}
        </div>
      </div>

      {/* Status effects */}
      {companion.statusEffects && companion.statusEffects.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.65rem', color: T.textMuted, letterSpacing: 1, marginBottom: '4px' }}>STATUS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {companion.statusEffects.map((e) => (
              <span key={e} style={{
                fontSize: '0.72rem', padding: '2px 7px',
                background: '#c94c4c22', color: '#c94c4c',
                border: '1px solid #c94c4c66', borderRadius: '3px',
              }}>{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {companion.notes && (
        <div style={{
          fontSize: '0.78rem', color: T.textMuted,
          fontStyle: 'italic', lineHeight: 1.5,
          marginBottom: '16px',
          padding: '0 2px',
        }}>
          "{companion.notes}"
        </div>
      )}

      {/* Recruited day */}
      <div style={{ fontSize: '0.68rem', color: T.textMuted, opacity: 0.6, marginBottom: '16px' }}>
        Joined on day {companion.recruitedDay}
      </div>

      {/* Dismiss */}
      {!confirmDismiss ? (
        <button
          onClick={() => setConfirmDismiss(true)}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid #c94c4c88',
            color: '#c94c4c',
            borderRadius: '5px',
            padding: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Dismiss companion
        </button>
      ) : (
        <div style={{
          background: '#c94c4c11',
          border: '1px solid #c94c4c66',
          borderRadius: '6px',
          padding: '12px',
        }}>
          <div style={{ fontSize: '0.82rem', color: T.text, marginBottom: '10px' }}>
            Dismiss {companion.name}? This will be narrated next turn.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onDismiss}
              style={{
                flex: 1, background: '#c94c4c', border: 'none',
                color: '#fff', borderRadius: '4px', padding: '7px',
                fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Confirm dismiss
            </button>
            <button
              onClick={() => setConfirmDismiss(false)}
              style={{
                flex: 1, background: 'transparent',
                border: `1px solid ${T.border}`,
                color: T.textMuted,
                borderRadius: '4px', padding: '7px',
                fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
