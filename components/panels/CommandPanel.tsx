'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { COMMAND_GROUPS } from '@/lib/constants';
import type { Player } from '@/lib/types';

interface CommandPanelProps {
  player: Player | null;
  onCommand: (commandId: string) => void;
  isLoading: boolean;
  isDyslexic?: boolean;
}

export function CommandPanel({ player, onCommand, isLoading, isDyslexic }: CommandPanelProps) {
  const { T } = useTheme();
  const ctx = player?.context || 'explore';

  const tf = {
    fontFamily: isDyslexic
      ? "'OpenDyslexic',Arial,sans-serif"
      : "'Cinzel','Palatino Linotype',serif",
  };
  const btnFont = {
    fontFamily: isDyslexic
      ? "'OpenDyslexic',Arial,sans-serif"
      : "'Crimson Text',Georgia,serif",
  };

  const ctxInfo: Record<string, { label: string; color: string; icon: string }> = {
    explore: { label: 'Exploring', color: '#4a8040', icon: '🌲' },
    town: { label: 'In Town', color: '#7060a0', icon: '🏘️' },
    combat: { label: 'In Combat!', color: '#c03030', icon: '⚔️' },
    npc: { label: 'Talking', color: '#4070a0', icon: '💬' },
    camp: { label: 'Camped', color: '#a06020', icon: '🔥' },
  };
  const ctxData = ctxInfo[ctx] || ctxInfo.explore;

  const actionBtn = (cmd: { id: string; icon: string; label: string; desc: string; context: string[] }) => {
    const available = cmd.context.includes(ctx) && !isLoading;
    return (
      <div key={cmd.id} style={{ position: 'relative' }}>
        <button
          onClick={() => { if (available) onCommand(cmd.id); }}
          disabled={!available}
          style={{
            width: '100%',
            background: available ? T.panel : 'transparent',
            border: `1px solid ${available ? T.border : T.border + '44'}`,
            color: available ? T.text : T.textFaint + '66',
            cursor: available ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            ...btnFont,
            fontSize: 15,
            padding: '8px 0',
          }}
        >
          <span style={{ fontSize: 18, marginBottom: 2 }}>{cmd.icon}</span>
          <span style={{ fontSize: 11 }}>{cmd.label}</span>
        </button>
      </div>
    );
  };
