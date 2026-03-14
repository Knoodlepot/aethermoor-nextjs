'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Quest } from '@/lib/types';

const typeColors: Record<string, string> = {
  faction: '#3090c0',
  side: '#c0a030',
  contract: '#c06030',
};

interface SideQuestPanelProps {
  quests: Quest[];
  onOpenQuest: (questId: string) => void;
  onToggleTrack: (questId: string) => void;
  onAbandon: (questId: string) => void;
  onOpenLog: () => void;
}

const MAX_VISIBLE = 5;

export function SideQuestPanel({ quests, onOpenQuest, onToggleTrack, onAbandon, onOpenLog }: SideQuestPanelProps) {
  const { T, tf } = useTheme();
  const [confirmAbandonId, setConfirmAbandonId] = React.useState<string | null>(null);

  // Only show active, non-main quests that are tracked (tracked defaults to true)
  const active = quests.filter((q) => (q.status as string) === 'active' && q.type !== 'main' && !!q.type && (q.tracked ?? true));
  const visible = active.slice(-MAX_VISIBLE);
  const overflow = active.length - visible.length;

  const borderColor = '#3090c044';

  return (
    <div
      style={{
        background: T.panelAlt,
        border: `1px solid ${borderColor}`,
        padding: 10,
        marginBottom: 8,
      }}
    >
      {/* Header */}
      <div
        onClick={onOpenLog}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, cursor: 'pointer' }}
      >
        <span style={{ fontSize: 13 }}>📜</span>
        <div style={{ flex: 1 }}>
          <div style={{ ...tf, fontSize: 9, color: '#3090c0', letterSpacing: 2, marginBottom: 1 }}>
            SIDE QUESTS
          </div>
        </div>
      </div>

      {/* Quest list */}
      {visible.length === 0 ? (
        <div
          style={{
            fontSize: 10,
            color: T.textFaint,
            fontStyle: 'italic',
            fontFamily: 'Crimson Text, Georgia, serif',
            lineHeight: 1.5,
            textAlign: 'center',
            padding: '6px 0 4px',
          }}
        >
          No roads taken yet, wanderer...
        </div>
      ) : (
        <>
          {visible.map((q) => {
            const typeColor = typeColors[q.type] || T.textMuted;
            const isConfirming = confirmAbandonId === q.id;
            return (
              <div
                key={q.id}
                style={{
                  borderTop: `1px solid ${T.border}44`,
                  paddingTop: 5,
                  marginTop: 5,
                }}
              >
                {isConfirming ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, color: '#c04030', ...tf, flex: 1 }}>Give up?</span>
                    <button
                      onClick={() => { onAbandon(q.id); setConfirmAbandonId(null); }}
                      style={{ padding: '2px 7px', background: '#c0403022', border: `1px solid #c04030`, color: '#c04030', cursor: 'pointer', fontSize: 9, ...tf }}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmAbandonId(null)}
                      style={{ padding: '2px 7px', background: 'transparent', border: `1px solid ${T.border}`, color: T.textFaint, cursor: 'pointer', fontSize: 9, ...tf }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {/* Quest title — click to open log at this quest */}
                    <div
                      onClick={() => onOpenQuest(q.id)}
                      style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 5, height: 5,
                            borderRadius: '50%',
                            background: typeColor,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 10, color: T.text,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap', flex: 1,
                            ...tf,
                          }}
                          title={q.title}
                        >
                          {q.title}
                        </span>
                      </div>
                    </div>

                    {/* Track toggle */}
                    <button
                      onClick={() => onToggleTrack(q.id)}
                      title={(q.tracked ?? true) ? 'Untrack' : 'Track'}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${(q.tracked ?? true) ? T.accent + '66' : T.border}`,
                        color: (q.tracked ?? true) ? T.accent : T.textFaint,
                        width: 18, height: 18,
                        cursor: 'pointer', fontSize: 9,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, padding: 0,
                      }}
                    >
                      {(q.tracked ?? true) ? '👁' : '○'}
                    </button>

                    {/* Give up button */}
                    <button
                      onClick={() => setConfirmAbandonId(q.id)}
                      title="Give up quest"
                      style={{
                        background: 'transparent',
                        border: `1px solid ${T.border}`,
                        color: '#c06030',
                        width: 18, height: 18,
                        cursor: 'pointer', fontSize: 9,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {overflow > 0 && (
            <div
              onClick={onOpenLog}
              style={{ fontSize: 9, color: T.textFaint, marginTop: 6, textAlign: 'center', cursor: 'pointer' }}
            >
              +{overflow} more — view all
            </div>
          )}
        </>
      )}

      {/* Click to open log hint */}
      <div style={{ fontSize: 8, color: T.textMuted, marginTop: 5, textAlign: 'center' }}>
        Click title to view in quest log
      </div>
    </div>
  );
}
