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

  const moveBtn = (id: string, icon: string, label: string, gridArea: string) => {
    const available = !isLoading;
    return (
      <div key={id} style={{ gridArea, position: 'relative' }}>
        <button
          onClick={() => { if (available) onCommand(id); }}
          disabled={!available || isLoading}
          style={{
            width: '100%',
            height: '100%',
            background: T.panel,
            border: `1px solid ${T.border}`,
            color: available ? T.accent : T.textFaint,
            cursor: available ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            padding: '6px 4px',
            fontSize: 18,
            transition: 'all 0.15s',
            opacity: available ? 1 : 0.35,
            ...btnFont,
          }}
          onMouseEnter={(e) => {
            if (available && !isLoading) {
              e.currentTarget.style.background = T.accent + '22';
              e.currentTarget.style.borderColor = T.accent;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = T.panel;
            e.currentTarget.style.borderColor = T.border;
          }}
        >
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1, ...tf }}>
            {label.toUpperCase()}
          </span>
        </button>
      </div>
    );
  };

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
            padding: '8px 4px',
            fontSize: 20,
            transition: 'all 0.15s',
            opacity: available ? 1 : 0.25,
            ...btnFont,
          }}
          onMouseEnter={(e) => {
            if (available) {
              e.currentTarget.style.background = T.accent + '22';
              e.currentTarget.style.borderColor = T.accent;
              e.currentTarget.style.color = T.gold;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = available ? T.panel : 'transparent';
            e.currentTarget.style.borderColor = available ? T.border : T.border + '44';
            e.currentTarget.style.color = available ? T.text : T.textFaint + '66';
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{cmd.icon}</span>
          <span style={{ fontSize: 9, letterSpacing: 0.5, lineHeight: 1.2, textAlign: 'center', ...tf, color: 'inherit' }}>
            {cmd.label.toUpperCase()}
          </span>
        </button>
      </div>
    );
  };

  return (
    <div style={{ borderTop: `1px solid ${T.border}`, background: T.panelAlt }}>
      {/* Context bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderBottom: `1px solid ${T.border}`,
          background: ctxData.color + '18',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 14 }}>{ctxData.icon}</span>
        <span style={{ ...tf, color: ctxData.color, fontSize: 10, letterSpacing: 2 }}>
          {ctxData.label.toUpperCase()}
        </span>
        <div style={{ width: 1, height: 12, background: T.border, margin: '0 2px', flexShrink: 0 }} />
        <span style={{ fontSize: 13 }}>📍</span>
        <span style={{ ...tf, color: T.gold, fontSize: 10, letterSpacing: 1 }}>{player?.location}</span>
        {isLoading && (
          <span style={{ color: T.textFaint, fontSize: 10, fontStyle: 'italic', marginLeft: 'auto', fontFamily: 'Crimson Text,serif' }}>
            weaving story...
          </span>
        )}
      </div>

      {/* Button grid */}
      <div style={{ padding: '10px 12px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Movement grid */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ ...tf, color: T.textFaint, fontSize: 9, letterSpacing: 2, marginBottom: 5, textAlign: 'center' }}>
            MOVE
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateAreas: `". north ." "west center east" ". south ."`,
              gridTemplateColumns: '42px 42px 42px',
              gridTemplateRows: '36px 36px 36px',
              gap: 2,
            }}
          >
            {moveBtn('go_north', '⬆', 'N', 'north')}
            {moveBtn('go_west', '⬅', 'W', 'west')}
            <div
              style={{
                gridArea: 'center',
                background: T.bg,
                border: `1px solid ${T.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              🧭
            </div>
            {moveBtn('go_east', '➡', 'E', 'east')}
            {moveBtn('go_south', '⬇', 'S', 'south')}
          </div>
        </div>

        <div style={{ width: 1, background: T.border, alignSelf: 'stretch', flexShrink: 0 }} />

        {/* Action buttons */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMMAND_GROUPS.filter((g) => g.label !== 'Move').map((group) => {
            const hasActive = group.commands.some((c) => c.context.includes(ctx));
            return (
              <div key={group.label}>
                <div
                  style={{
                    ...tf,
                    color: hasActive ? T.accent : T.textFaint + '66',
                    fontSize: 9,
                    letterSpacing: 2,
                    marginBottom: 4,
                  }}
                >
                  {group.label.toUpperCase()}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 3 }}>
                  {group.commands.map((cmd) => actionBtn(cmd))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
