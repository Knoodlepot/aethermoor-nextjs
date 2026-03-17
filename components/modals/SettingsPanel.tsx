'use client';

import React from 'react';

export type ModelTier = 'haiku' | 'sonnet' | 'opus';

interface SettingsPanelProps {
  currentTier: ModelTier;
  onSelectTier: (tier: ModelTier) => void;
  onClose: () => void;
}

const TIERS: {
  id: ModelTier;
  name: string;
  model: string;
  cost: number;
  desc: string;
  colour: string;
}[] = [
  {
    id: 'haiku',
    name: 'Haiku',
    model: 'claude-haiku-4-5',
    cost: 1,
    desc: 'Fast and responsive. Great for everyday adventuring — quick narration, snappy combat, smooth exploration.',
    colour: '#4a7a4a',
  },
  {
    id: 'sonnet',
    name: 'Sonnet',
    model: 'claude-sonnet-4-6',
    cost: 4,
    desc: 'Richer prose and deeper world-building. Ideal for roleplayers who want more vivid, detailed storytelling.',
    colour: '#4a6a9a',
  },
  {
    id: 'opus',
    name: 'Opus',
    model: 'claude-opus-4-6',
    cost: 20,
    desc: 'The most powerful model available. Exceptional creative depth, nuanced characters, and complex narrative reasoning.',
    colour: '#8a4a9a',
  },
];

export function SettingsPanel({ currentTier, onSelectTier, onClose }: SettingsPanelProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#13100a',
          border: '1px solid #2e2515',
          maxWidth: 460,
          width: '100%',
          padding: '24px 20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 3, color: '#c9a84c' }}>
              AI NARRATOR
            </div>
            <div style={{ fontSize: 11, color: '#5a4a2a', marginTop: 2 }}>
              Choose your model — higher tiers cost more tokens per turn
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#5a4a2a', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Tier cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TIERS.map((t) => {
            const active = currentTier === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { onSelectTier(t.id); onClose(); }}
                style={{
                  background: active ? t.colour + '22' : 'transparent',
                  border: `1px solid ${active ? t.colour : '#2e2515'}`,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  transition: 'border-color 0.15s, background 0.15s',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {active && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.colour, display: 'inline-block', flexShrink: 0 }} />
                    )}
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: active ? t.colour : '#8a7a5a', letterSpacing: 1 }}>
                      {t.name}
                    </span>
                    <span style={{ fontSize: 10, color: '#5a4a2a', fontFamily: 'monospace' }}>
                      {t.model}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: active ? t.colour : '#5a4a2a', whiteSpace: 'nowrap' as const }}>
                    {t.cost} {t.cost === 1 ? 'token' : 'tokens'} / turn
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#8a7a5a', fontFamily: "'Crimson Text',Georgia,serif", lineHeight: 1.4, paddingLeft: active ? 14 : 0 }}>
                  {t.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 14, fontSize: 11, color: '#3a2a1a', fontFamily: "'Cinzel',serif", letterSpacing: 1, textAlign: 'center' as const }}>
          SELECTION SAVED TO YOUR ACCOUNT
        </div>
      </div>
    </div>
  );
}
