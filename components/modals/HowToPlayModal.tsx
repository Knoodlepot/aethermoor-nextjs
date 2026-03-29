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
    title: 'ACTION BUTTONS',
    body: 'The Actions panel on the right changes depending on where you are and what you\'re doing. Three different sets of buttons are available:\n\n• Exploration — when travelling the wilds: Move, Rest, Search, Scout, Camp, and more.\n• Town — when inside a settlement: Talk, Shop, Notice Board, Visit Tavern, and others. The Shop button opens the merchant directly.\n• Combat — when fighting an enemy: Attack, Ability, Defend, and Flee.\n\nYou can also type anything freely in the input bar — the narrator responds to every action.',
  },
  {
    icon: '🧭',
    title: 'EXPLORATION',
    body: 'Between towns and dungeons you are in the wilderness. Use the exploration buttons to move through the world, search for hidden items or locations, rest to recover HP, or scout the area ahead. Open the map to fast-travel to anywhere you\'ve already visited.',
  },
  {
    icon: '🏘',
    title: 'TOWNS & SETTLEMENTS',
    body: 'Arriving at a hamlet, village, town, city, or capital switches your Actions panel to town mode automatically. Visit the Notice Board to pick up side quests, talk to locals for information, browse the Shop for supplies and gear, or head to the Tavern to rest and hear rumours. Larger settlements stock better equipment.',
  },
  {
    icon: '⚔️',
    title: 'COMBAT',
    body: 'When you encounter an enemy the Actions panel switches to combat mode. Four buttons appear:\n\n• Attack — deal damage based on your class and STR/AGI.\n• Ability — use your class skill (costs nothing but may have cooldowns).\n• Defend — brace for impact, reducing damage taken this turn.\n• Flee — attempt to escape; success depends on your AGI.\n\nWatch your HP — if it hits 0 you die and lose progress.',
  },
  {
    icon: '🧙',
    title: 'CHARACTER & STATS',
    body: 'Your hero has four core stats: STR (Strength) for physical attacks and melee power, AGI (Agility) for speed and stealth, INT (Intelligence) for magic and knowledge, and WIL (Willpower) for resistance and healing. Gain stat points and skill points each time you level up — spend them in the Character screen.',
  },
  {
    icon: '🏰',
    title: 'FACTIONS',
    body: "Nine factions shape Aethermoor's politics — from the Warriors' Guild to the Shadow Court. Join a faction to earn unique abilities and rewards. Your reputation with each faction opens doors — or closes them.",
  },
  {
    icon: '🪙',
    title: 'TOKENS',
    body: 'Each action costs 1 token. Tokens power the AI narrator. New players start with 50 free tokens — purchase more in the Token Shop when you run low. Your balance is shown at the top of the screen.',
  },
  {
    icon: '🎒',
    title: 'RATIONS & HUNGER',
    body: 'Every journey consumes rations — roughly 1 per 8 hours of travel. If you run out, hunger sets in and you lose HP on the road instead. You will be warned when you are down to your last ration. Stock up at any shop before heading into the wilderness. Rations can also be eaten manually to restore HP, and crafted into better food at a campfire.',
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
                  whiteSpace: 'pre-line',
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
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            onClick={() => {
              localStorage.removeItem('ae-tour-completed');
              window.dispatchEvent(new Event('ae:start-tour'));
              onClose();
            }}
            style={{
              flex: '0 0 auto',
              background: 'transparent',
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              padding: '11px 16px',
              fontSize: 12,
              ...tf,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
            }}
          >
            Replay Tour
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
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
