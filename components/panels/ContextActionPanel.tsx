'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface ContextActionPanelProps {
  context: string;
  isLoading: boolean;
  onAction: (text: string) => void;
  playerClass?: string;
  inventory?: string[];
}

interface ActionBtn {
  icon: string;
  label: string;
  text: string;
  /** If set, button is greyed out with this tooltip */
  requiresItem?: string;
  hasItem?: boolean;
}

const TOWN_ACTIONS: ActionBtn[] = [
  { icon: '💬', label: 'Talk',         text: 'I approach someone to start a conversation, asking around for local information, news, or gossip.' },
  { icon: '🪙', label: 'Barter',       text: 'barter' },
  { icon: '📋', label: 'Notice Board', text: 'I walk over to the notice board and read what\'s posted.' },
  { icon: '🛏', label: 'Rest',         text: 'I find somewhere comfortable to rest for a few hours.' },
  { icon: '👁', label: 'Look',         text: 'I look around the town, taking in my surroundings.' },
  { icon: '⚒️', label: 'Craft',        text: 'I look for a suitable place to craft and work on my supplies.' },
];

const EXPLORE_ACTIONS: ActionBtn[] = [
  { icon: '👁',  label: 'Look',       text: 'I look around carefully, taking in my surroundings.' },
  { icon: '🔍', label: 'Search',      text: 'I search the area thoroughly.' },
  { icon: '👂', label: 'Listen',      text: 'I stop and listen carefully to my surroundings.' },
  { icon: '🛏', label: 'Rest',        text: 'I rest for a while to recover.' },
  { icon: '🔥', label: 'Camp',        text: 'I make camp here for the night.' },
  { icon: '🌿', label: 'Forage',      text: 'I forage carefully for edible plants, herbs, and useful supplies in the nearby wild.' },
  { icon: '🌾', label: 'Farm',        text: 'I look for nearby fields and work the land to gather useful crops.' },
  { icon: '🪓', label: 'Chop Wood',   text: 'I gather timber from nearby trees for shelter and supplies.', requiresItem: "Woodcutter Hatchet" },
  { icon: '⛏',  label: 'Mine Ore',   text: 'I search rocky ground and mine for ore and useful stone.', requiresItem: "Miner's Pickaxe" },
];

const COMBAT_ACTIONS: ActionBtn[] = [
  { icon: '⚔️', label: 'Attack',    text: 'I attack!' },
  { icon: '🛡',  label: 'Defend',   text: 'I take a defensive stance, bracing for the next blow.' },
  { icon: '💨', label: 'Dodge',     text: 'I dodge and look for an opening.' },
  { icon: '✨', label: 'Spell',     text: 'I cast a spell.' },
  { icon: '🎒', label: 'Use Item',  text: 'I reach into my pack and use an item.' },
  { icon: '🏃', label: 'Flee',      text: 'I attempt to flee!' },
];

function getTemplateFor(context: string): { label: string; color: string; actions: ActionBtn[] } {
  if (context === 'combat') {
    return { label: 'COMBAT', color: '#c04030', actions: COMBAT_ACTIONS };
  }
  if (context === 'town' || context === 'npc' || context === 'farm') {
    return { label: 'IN TOWN', color: '#c0a030', actions: TOWN_ACTIONS };
  }
  // explore, camp, dungeon, default
  return { label: 'EXPLORING', color: '#4a8a60', actions: EXPLORE_ACTIONS };
}

export function ContextActionPanel({ context, isLoading, onAction, inventory = [] }: ContextActionPanelProps) {
  const { T, tf } = useTheme();

  const { label, color, actions } = getTemplateFor(context);

  // Resolve per-button item requirements
  const resolvedActions = actions.map((a) => {
    if (!a.requiresItem) return { ...a, hasItem: true };
    const has = inventory.some((i) =>
      i.toLowerCase().includes(a.requiresItem!.toLowerCase())
    );
    return { ...a, hasItem: has };
  });

  return (
    <div
      style={{
        background: T.panelAlt,
        borderBottom: `1px solid ${T.border}`,
        padding: '8px 8px 6px',
      }}
    >
      {/* Header */}
      <div
        style={{
          ...tf,
          fontSize: 8,
          color,
          letterSpacing: 2,
          marginBottom: 6,
        }}
      >
        {label} ACTIONS
      </div>

      {/* Button grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {resolvedActions.map((btn) => {
          const disabled = isLoading || btn.hasItem === false;
          return (
            <button
              key={btn.label}
              title={btn.hasItem === false ? `Requires: ${btn.requiresItem}` : btn.label}
              disabled={disabled}
              onClick={() => !disabled && onAction(btn.text)}
              style={{
                background: 'transparent',
                border: `1px solid ${disabled ? T.border : color + '66'}`,
                color: disabled ? T.textFaint : T.text,
                padding: '5px 4px',
                fontSize: 10,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: "'Cinzel','Palatino Linotype',serif",
                letterSpacing: 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                transition: 'border-color 0.15s, color 0.15s',
                opacity: disabled ? 0.45 : 1,
                borderRadius: 2,
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = color + 'cc';
                  (e.currentTarget as HTMLButtonElement).style.color = color;
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = color + '66';
                  (e.currentTarget as HTMLButtonElement).style.color = T.text;
                }
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
