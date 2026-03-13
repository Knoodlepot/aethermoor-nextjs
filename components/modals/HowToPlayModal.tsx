'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface HowToPlayModalProps {
  onClose: () => void;
}

const SECTIONS = [
  {
    icon: '⚔',
    title: 'THE WORLD',
    body: 'Aethermoor is a text-driven fantasy RPG powered by an AI narrator. A darkness stirs across the continent — ancient powers, warring factions, and forgotten ruins await. Every choice you make shapes the world around you.',
  },
  {
    icon: '🕹',
    title: 'HOW TO PLAY',
    body: 'Use the action buttons in the command panel to interact with the world. Type freely in the input bar to speak with NPCs, explore, or take custom actions. The narrator responds to everything.',
  },
  {
    icon: '🧙',
    title: 'CHARACTER & STATS',
    body: 'Your hero has four core stats that determine success: STR (Strength) for physical attacks and carrying, AGI (Agility) for speed and stealth, INT (Intelligence) for magic and knowledge, and WIL (Willpower) for magic resistance and healing.',
  },
  {
    icon: '⚔️',
    title: 'COMBAT',
    body: 'Each combat turn offers four choices: Attack (deal damage), Ability (use your class skill), Defend (reduce incoming damage), or Flee (escape based on AGI). Watch your HP — if it hits 0, you die and lose progress.',
  },
  {
    icon: '🏰',
    title: 'FACTIONS',
    body: "Nine factions shape Aethermoor's politics — from the Warriors' Guild to the Shadow Court. Join a faction to earn unique abilities and rewards. Your reputation with each faction opens doors — or closes them.",
  },
  {
    icon: '🪙',
    title: 'TOKENS',
    body: 'Each action costs 1 token. Tokens power the AI narrator. You start with a free balance — purchase more in the Token Shop when you run low. Your balance is shown at the top of the screen.',
  },
  {
    icon: '💾',
    title: 'SAVING',
    body: "Your adventure saves automatically after every action. Sign in to sync your save to the cloud — otherwise it's stored locally in your browser. Do not clear your browser data if you haven't signed in.",
  },
];

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const { T, tf, bf } = useTheme();

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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.accent}`,
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: T.panelAlt,
            borderBottom: `1px solid ${T.border}`,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ ...tf, color: T.gold, fontSize: 16, letterSpacing: 2 }}>
            HOW TO PLAY
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Sections */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {SECTIONS.map((sec) => (
            <div
              key={sec.title}
              style={{
                padding: '14px 20px',
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>{sec.icon}</span>
                <span
                  style={{
                    ...tf,
                    color: T.gold,
                    fontSize: 11,
                    letterSpacing: 3,
                    fontWeight: 600,
                  }}
                >
                  {sec.title}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: T.text,
                  lineHeight: 1.65,
                  paddingLeft: 28,
                }}
              >
                {sec.body}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: `1px solid ${T.border}`,
            background: T.panelAlt,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: T.accent + '22',
              border: `1px solid ${T.accent}`,
              color: T.gold,
              padding: '11px',
              fontSize: 13,
              ...tf,
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            Begin Your Quest
          </button>
        </div>
      </div>
    </div>
  );
}
