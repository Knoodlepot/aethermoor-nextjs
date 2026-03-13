'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player, WorldSeed } from '@/lib/types';
import { MainQuestPanel } from '@/components/panels/MainQuestPanel';

// Status / type colour maps — defined locally
const statusColors: Record<string, string> = {
  active: '#c0a030',
  completed: '#60a060',
  failed: '#c03030',
};

const typeColors: Record<string, string> = {
  main: '#9030c0',
  faction: '#3090c0',
  side: '#c0a030',
  contract: '#c06030',
};

const relColors: Record<string, string> = {
  friendly: '#60a060',
  neutral: '#9a7a55',
  hostile: '#c03030',
};

interface LeaderboardEntry {
  name: string;
  class: string;
  floor: number;
  score?: number;
}

interface QuestLogScreenProps {
  player: Player;
  worldSeed: WorldSeed | null;
  onClose: () => void;
  onDismiss?: (questId: string) => void;
}

export function QuestLogScreen({ player, worldSeed, onClose, onDismiss }: QuestLogScreenProps) {
  const { T, tf, bf } = useTheme();
  const [tab, setTab] = React.useState<'active' | 'done' | 'failed' | 'npcs' | 'dungeon'>('active');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = React.useState(false);

  React.useEffect(() => {
    if (tab === 'dungeon' && leaderboard.length === 0 && !lbLoading) {
      setLbLoading(true);
      fetch('/api/dungeon/leaderboard')
        .then((r) => r.json())
        .then((data) => setLeaderboard(Array.isArray(data) ? data : (data.entries || [])))
        .catch(() => setLeaderboard([]))
        .finally(() => setLbLoading(false));
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const allQuests = player.quests || [];
  const activeQuests = allQuests.filter((q) => (q.status as string) === 'active' && q.type !== 'main');
  const doneQuests = allQuests.filter((q) => (q.status as string) === 'completed' && q.type !== 'main');
  const failedQuests = allQuests.filter((q) => (q.status as string) === 'failed' && q.type !== 'main');
  const knownNpcs = player.knownNpcs || [];

  const TABS = [
    { id: 'active' as const, label: `Active (${activeQuests.length})` },
    { id: 'done' as const, label: `Done (${doneQuests.length})` },
    { id: 'failed' as const, label: `Failed (${failedQuests.length})` },
    { id: 'npcs' as const, label: `NPCs (${knownNpcs.length})` },
    { id: 'dungeon' as const, label: 'Dungeon' },
  ];

  function QuestItem({ q }: { q: any }) {
    const isOpen = expandedId === q.id;
    // Default to 'main' if type is missing, ensuring main quests always display correctly
    const displayType = q.type || 'main';
    const typeColor = typeColors[displayType] || T.textMuted;
    const statusColor = statusColors[(q.status as string)] || T.textMuted;
    return (
      <div
        onClick={() => setExpandedId(isOpen ? null : q.id)}
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${T.border}`,
          cursor: 'pointer',
          background: isOpen ? T.selectedBg : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
              <span style={{ ...tf, color: T.text, fontSize: 13 }}>{q.title}</span>
              <span
                style={{
                  fontSize: 9, ...tf,
                  color: typeColor,
                  border: `1px solid ${typeColor}44`,
                  padding: '1px 5px',
                  letterSpacing: 1,
                }}
              >
                {displayType.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: 9, ...tf,
                  color: statusColor,
                  border: `1px solid ${statusColor}44`,
                  padding: '1px 5px',
                  letterSpacing: 1,
                }}
              >
                {(q.status || 'active').toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{q.objective}</div>
          </div>
        </div>
        {isOpen && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}44` }}>
            {q.reward && (
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>
                Reward: <span style={{ color: T.gold }}>{q.reward}</span>
              </div>
            )}
            {q.giver && (
              <div style={{ fontSize: 11, color: T.textFaint }}>
                Given by {q.giver} on Day {q.givenDay}
              </div>
            )}
            {(q as any).location && (
              <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
                Location: {(q as any).location}
              </div>
            )}
            {onDismiss && (q.status as string) !== 'active' && (
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(q.id); }}
                style={{
                  marginTop: 8,
                  padding: '4px 10px',
                  background: 'transparent',
                  border: `1px solid ${T.border}`,
                  color: T.textFaint,
                  cursor: 'pointer',
                  fontSize: 10,
                  ...tf, letterSpacing: 1,
                }}
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.accent}`,
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
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
            📋 QUEST LOG
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              width: 28, height: 28,
              cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Main quest panel */}
        {worldSeed && (
          <div style={{ padding: '10px 14px 0', flexShrink: 0 }}>
            <MainQuestPanel worldSeed={worldSeed} />
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
            overflowX: 'auto',
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                minWidth: 60,
                background: tab === t.id ? T.selectedBg : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? T.accent : 'transparent'}`,
                color: tab === t.id ? T.gold : T.textMuted,
                padding: '10px 6px',
                cursor: 'pointer',
                fontSize: 10,
                ...tf,
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* ── ACTIVE ── */}
          {tab === 'active' && (
            activeQuests.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>
                No active quests. Talk to people, read notice boards, and explore.
              </div>
            ) : (
              activeQuests.map((q) => <QuestItem key={q.id} q={q} />)
            )
          )}

          {/* ── DONE ── */}
          {tab === 'done' && (
            doneQuests.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>
                No completed quests yet.
              </div>
            ) : (
              doneQuests.map((q) => <QuestItem key={q.id} q={q} />)
            )
          )}

          {/* ── FAILED ── */}
          {tab === 'failed' && (
            failedQuests.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>
                No failed quests. Yet.
              </div>
            ) : (
              failedQuests.map((q) => <QuestItem key={q.id} q={q} />)
            )
          )}

          {/* ── NPCs ── */}
          {tab === 'npcs' && (
            knownNpcs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>
                No NPCs met yet. Venture out and talk to people.
              </div>
            ) : (
              knownNpcs.map((npc, i) => {
                const relColor = relColors[npc.relationship] || T.textMuted;
                return (
                  <div
                    key={npc.name + i}
                    style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                          <span style={{ ...tf, color: T.text, fontSize: 13 }}>{npc.name}</span>
                          <span style={{ fontSize: 10, color: relColor }}>{npc.relationship}</span>
                          {npc.questGiver && (
                            <span
                              style={{
                                fontSize: 9, color: T.accent,
                                border: `1px solid ${T.accent}44`,
                                padding: '1px 4px',
                                ...tf, letterSpacing: 1,
                              }}
                            >
                              QUEST
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{npc.role}</div>
                        {npc.notes && (
                          <div style={{ fontSize: 11, color: T.textFaint, marginTop: 3, fontStyle: 'italic' }}>
                            {npc.notes}
                          </div>
                        )}
                        {npc.travelDestination && (
                          <div style={{ fontSize: 10, color: T.textFaint, marginTop: 2 }}>
                            Travelling to {npc.travelDestination}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: T.textFaint, textAlign: 'right', flexShrink: 0 }}>
                        Day {npc.metDay}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* ── DUNGEON DEPTHS ── */}
          {tab === 'dungeon' && (
            <div style={{ padding: 16 }}>
              {/* Player record */}
              <div
                style={{
                  background: T.panelAlt,
                  border: `1px solid ${T.border}`,
                  padding: 14,
                  marginBottom: 20,
                }}
              >
                <div style={{ ...tf, color: T.accent, fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>
                  YOUR RECORD
                </div>
                <div style={{ display: 'flex', gap: 28 }}>
                  <div>
                    <div style={{ fontSize: 26, ...tf, color: T.gold }}>
                      {player.dungeon?.deepestFloor || 0}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Deepest floor</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 26, ...tf, color: '#c04040' }}>
                      {player.deathCount || 0}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Deaths</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 26, ...tf, color: T.textMuted }}>
                      {(player.gravestones || []).length}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Gravestones</div>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div style={{ ...tf, color: T.accent, fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>
                GLOBAL LEADERBOARD
              </div>
              {lbLoading ? (
                <div style={{ color: T.textFaint, fontSize: 12, fontStyle: 'italic' }}>Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div style={{ color: T.textFaint, fontSize: 12, fontStyle: 'italic' }}>
                  No leaderboard data yet.
                </div>
              ) : (
                leaderboard.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderBottom: `1px solid ${T.border}`,
                      background: i === 0 ? '#1a1505' : 'transparent',
                    }}
                  >
                    <span style={{ ...tf, color: i < 3 ? T.gold : T.textFaint, fontSize: 13, width: 28 }}>
                      {i + 1}.
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, color: T.text }}>{entry.name}</span>
                      <span style={{ fontSize: 10, color: T.textFaint, marginLeft: 8 }}>{entry.class}</span>
                    </div>
                    <span style={{ ...tf, color: T.gold, fontSize: 14 }}>Floor {entry.floor}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
