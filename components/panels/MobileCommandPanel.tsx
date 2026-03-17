'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { COMMAND_GROUPS } from '@/lib/constants';
import type { Player } from '@/lib/types';

interface MobileCommandPanelProps {
  player: Player | null;
  onCommand: (commandId: string) => void;
  isLoading: boolean;
  isDyslexic?: boolean;
}

export function MobileCommandPanel({ player, onCommand, isLoading, isDyslexic }: MobileCommandPanelProps) {
  const { T, t } = useTheme();
  const ctx = player?.context || 'explore';

  const tf = {
    fontFamily: isDyslexic
      ? "'OpenDyslexic',Arial,sans-serif"
      : "'Cinzel','Palatino Linotype',serif",
  };

  const ctxInfo: Record<string, { label: string; color: string; icon: string }> = {
    explore: { label: t('exploring'), color: '#4a8040', icon: '🌲' },
    town: { label: t('inTown'), color: '#7060a0', icon: '🏘️' },
    combat: { label: t('inCombat'), color: '#c03030', icon: '⚔️' },
    npc: { label: t('talking'), color: '#4070a0', icon: '💬' },
    camp: { label: t('camped'), color: '#a06020', icon: '🔥' },
  };
  const ctxData = ctxInfo[ctx] || ctxInfo.explore;

  return (
    <div>
      {/* Context bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: ctxData.color + '22',
          border: `1px solid ${ctxData.color}44`,
          borderRadius: 6,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 18 }}>{ctxData.icon}</span>
        <span style={{ ...tf, color: ctxData.color, fontSize: 12, letterSpacing: 2 }}>
          {ctxData.label.toUpperCase()}
        </span>
        <span style={{ fontSize: 13, marginLeft: 'auto' }}>📍</span>
        <span style={{ ...tf, color: T.gold, fontSize: 11 }}>{player?.location}</span>
      </div>

      {/* Action groups */}
      {COMMAND_GROUPS.map((group) => {
        const cmds = group.commands.filter(
          (c) => c.context.includes(ctx) && (!c.requiresLocation || player?.location === c.requiresLocation)
        );
        if (cmds.length === 0) return null;

        return (
          <div key={group.label} style={{ marginBottom: 14 }}>
            <div style={{ ...tf, color: T.accent, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>
              {group.label.toUpperCase()}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {group.commands.map((cmd) => {
                const available = cmd.context.includes(ctx) && !isLoading;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { if (available) onCommand(cmd.id); }}
                    disabled={!available}
                    style={{
                      background: available ? T.panel : 'transparent',
                      border: `1px solid ${available ? T.border : T.border + '44'}`,
                      color: available ? T.text : T.textFaint + '55',
                      padding: '14px 10px',
                      cursor: available ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 6,
                      opacity: available ? 1 : 0.3,
                      transition: 'all 0.15s',
                    }}
                    onTouchStart={(e) => {
                      if (available) e.currentTarget.style.background = T.accent + '33';
                    }}
                    onTouchEnd={(e) => {
                      if (available) e.currentTarget.style.background = T.panel;
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{cmd.icon}</span>
                    <span style={{ fontSize: 11, ...tf, letterSpacing: 0.5, textAlign: 'center', color: 'inherit' }}>
                      {cmd.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            textAlign: 'center',
            color: T.textFaint,
            fontSize: 13,
            fontStyle: 'italic',
            padding: '16px 0',
          }}
        >
          {t('weavingStory')}
        </div>
      )}
    </div>
  );
}
