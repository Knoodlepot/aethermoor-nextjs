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
            return (
              <div style={{ borderTop: `1px solid ${T.border}`, background: T.panelAlt }}>
                {/* Button grid */}
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {COMMAND_GROUPS.map((group) => {
                    const hasActive = group.commands.some((c) => c.context.includes(ctx));
                    return (
                      <div key={group.label}>
                        <div
                          style={{
                            ...btnFont,
                            fontSize: 10,
                            color: T.textFaint,
                            marginBottom: 2,
                            letterSpacing: 1,
                          }}
                        >
                          {group.label}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          {group.commands.filter((c) => c.context.includes(ctx)).map(actionBtn)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          <span style={{ color: T.textFaint, fontSize: 10, fontStyle: 'italic', marginLeft: 'auto', fontFamily: 'Crimson Text,serif' }}>
            weaving story...
          </span>
        )}
      </div>

      {/* Button grid */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {COMMAND_GROUPS.map((group) => {
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
  );
}
