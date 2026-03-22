'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player, WorldSeed, Quest } from '@/lib/types';

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

const ACT_LABELS = ['', 'I: The Hook', 'II: The Threat', 'III: The Confrontation', 'IV: The Reckoning', 'V: The Revelation', 'Complete'];
const ACT_COLORS = ['', '#c0a030', '#c07030', '#c04030', '#9030c0', '#a060c0', '#60a060'];
const ACT_SUMMARIES = [
  '',
  'The ominous signs first appeared — the world began to change.',
  "The villain's threat became clear — danger now looms over all.",
  'A great setback — loss and hardship, yet the cause endures.',
  'Betrayal and despair — but the will to fight remained.',
  'The final reckoning approaches — all roads lead to one end.',
  'Victory achieved.',
];
const ACT_HINTS = [
  '',
  'Uncover the ominous signs — seek out NPCs, investigate strange occurrences.',
  "Confront the villain's direct threat — gather allies, understand the danger.",
  'Endure a major loss or setback — press forward despite the darkness.',
  'Navigate betrayal and despair — find reason to fight on.',
  'Prepare for the final confrontation — gather what you need.',
];

interface LeaderboardEntry {
  player_id: string;
  hero_name: string;
  hero_class: string;
  hero_level: number;
  deepest_floor: number;
  ng_plus: number;
  country_code: string | null;
  updated_at: string;
}

function countryFlag(code: string | null): string {
  if (!code || code.length !== 2) return '';
  return code.toUpperCase().split('').map(
    c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('');
}

function floorBiome(floor: number): string {
  if (floor <= 0)  return '—';
  if (floor <= 5)  return 'Shallow Halls';
  if (floor <= 10) return 'The Ossuary';
  if (floor <= 16) return 'Flooded Tunnels';
  if (floor <= 22) return 'Fungal Depths';
  if (floor <= 28) return 'The Burning Dark';
  if (floor <= 35) return 'Frost Crypts';
  return 'The Abyss';
}

const RANK_MEDAL = ['🥇', '🥈', '🥉'];

interface QuestLogScreenProps {
  player: Player;
  worldSeed: WorldSeed | null;
  onClose: () => void;
  onDismiss?: (questId: string) => void;
  onAbandon?: (questId: string) => void;
  onToggleTrack?: (questId: string) => void;
  initialQuestId?: string | null;
  onInitialQuestIdConsumed?: () => void;
}

type TabId = 'mainquest' | 'active' | 'faction' | 'done' | 'failed' | 'npcs' | 'dungeon';

export function QuestLogScreen({
  player,
  worldSeed,
  onClose,
  onDismiss,
  onAbandon,
  onToggleTrack,
  initialQuestId,
  onInitialQuestIdConsumed,
}: QuestLogScreenProps) {
  const { T, tf, bf } = useTheme();

  const allQuests = player.quests || [];
  const activeQuests = allQuests.filter((q) => (q.status as string) === 'active' && q.type !== 'main' && q.type !== 'faction');
  const factionQuests = allQuests.filter((q) => (q.status as string) === 'active' && q.type === 'faction');
  const doneQuests = allQuests.filter((q) => (q.status as string) === 'completed' && q.type !== 'main');
  const failedQuests = allQuests.filter((q) => (q.status as string) === 'failed' && q.type !== 'main');
  const knownNpcs = player.knownNpcs || [];

  const getInitialTab = (): TabId => {
    if (initialQuestId) {
      const q = allQuests.find((q) => q.id === initialQuestId);
      if (q) {
        if (q.type === 'faction') return 'faction';
        if ((q.status as string) === 'completed') return 'done';
        if ((q.status as string) === 'failed') return 'failed';
        return 'active';
      }
    }
    return 'active';
  };

  const [tab, setTab] = React.useState<TabId>(getInitialTab);
  const [expandedId, setExpandedId] = React.useState<string | null>(initialQuestId || null);
  const [confirmAbandonId, setConfirmAbandonId] = React.useState<string | null>(null);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = React.useState(false);
  const expandedRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (initialQuestId && onInitialQuestIdConsumed) {
      onInitialQuestIdConsumed();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expandedId]);

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

  const TABS: { id: TabId; label: string }[] = [
    { id: 'mainquest', label: 'Main Quest' },
    { id: 'active', label: `Side (${activeQuests.length})` },
    { id: 'faction', label: `Faction (${factionQuests.length})` },
    { id: 'done', label: `Done (${doneQuests.length})` },
    { id: 'failed', label: `Failed (${failedQuests.length})` },
    { id: 'npcs', label: `NPCs (${knownNpcs.length})` },
    { id: 'dungeon', label: 'Dungeon' },
  ];

  function QuestItem({ q, showAbandon = false }: { q: Quest; showAbandon?: boolean }) {
    const isOpen = expandedId === q.id;
    const displayType = q.type || 'side';
    const typeColor = typeColors[displayType] || T.textMuted;
    const statusColor = statusColors[(q.status as string)] || T.textMuted;
    const isTracked = q.tracked ?? true;
    const isConfirmingAbandon = confirmAbandonId === q.id;

    return (
      <div
        ref={isOpen ? (expandedRef as React.RefObject<HTMLDivElement>) : null}
        style={{ borderBottom: `1px solid ${T.border}`, background: isOpen ? T.selectedBg : 'transparent', transition: 'background 0.15s' }}
      >
        <div onClick={() => setExpandedId(isOpen ? null : q.id)} style={{ padding: '12px 16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                <span style={{ ...tf, color: T.text, fontSize: 13 }}>{q.title}</span>
                <span style={{ fontSize: 9, ...tf, color: typeColor, border: `1px solid ${typeColor}44`, padding: '1px 5px', letterSpacing: 1 }}>
                  {displayType.toUpperCase()}
                </span>
                <span style={{ fontSize: 9, ...tf, color: statusColor, border: `1px solid ${statusColor}44`, padding: '1px 5px', letterSpacing: 1 }}>
                  {(q.status || 'active').toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{q.objective}</div>
            </div>
            {(q.status as string) === 'active' && onToggleTrack && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleTrack(q.id); }}
                title={isTracked ? 'Untrack quest' : 'Track quest'}
                style={{
                  background: 'transparent',
                  border: `1px solid ${isTracked ? T.accent + '88' : T.border}`,
                  color: isTracked ? T.accent : T.textFaint,
                  width: 24, height: 24,
                  cursor: 'pointer', fontSize: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isTracked ? '👁' : '○'}
              </button>
            )}
          </div>
        </div>

        {isOpen && (
          <div style={{ padding: '0 16px 12px', borderTop: `1px solid ${T.border}44` }}>
            {q.reward && (
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>
                Reward: <span style={{ color: T.gold }}>{q.reward}</span>
              </div>
            )}
            {q.giver && (
              <div style={{ fontSize: 11, color: T.textFaint }}>Given by {q.giver} on Day {q.givenDay}</div>
            )}
            {q.location && (
              <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>Location: {q.location}</div>
            )}
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {onDismiss && (q.status as string) !== 'active' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDismiss(q.id); }}
                  style={{ padding: '4px 10px', background: 'transparent', border: `1px solid ${T.border}`, color: T.textFaint, cursor: 'pointer', fontSize: 10, ...tf, letterSpacing: 1 }}
                >
                  Dismiss
                </button>
              )}
              {showAbandon && onAbandon && (q.status as string) === 'active' && (
                isConfirmingAbandon ? (
                  <>
                    <span style={{ fontSize: 10, color: '#c04030', ...tf, alignSelf: 'center' }}>Give up this quest?</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAbandon(q.id); setConfirmAbandonId(null); }}
                      style={{ padding: '4px 10px', background: '#c0403022', border: `1px solid #c04030`, color: '#c04030', cursor: 'pointer', fontSize: 10, ...tf, letterSpacing: 1 }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmAbandonId(null); }}
                      style={{ padding: '4px 10px', background: 'transparent', border: `1px solid ${T.border}`, color: T.textFaint, cursor: 'pointer', fontSize: 10, ...tf, letterSpacing: 1 }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmAbandonId(q.id); }}
                    style={{ padding: '4px 10px', background: 'transparent', border: `1px solid ${T.border}`, color: '#c06030', cursor: 'pointer', fontSize: 10, ...tf, letterSpacing: 1 }}
                  >
                    Give Up
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function MainQuestTab() {
    if (!worldSeed) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>
          The main quest has not yet begun.
        </div>
      );
    }
    const act = Math.min(worldSeed.currentAct || 1, 6);
    const done = worldSeed.mainQuestComplete;

    return (
      <div style={{ padding: 16 }}>
        <div style={{ ...tf, color: T.accent, fontSize: 10, letterSpacing: 2, marginBottom: 14 }}>
          {worldSeed.templateIcon || '⚔️'} {worldSeed.questTitle}
        </div>
        {[1, 2, 3, 4, 5].map((a) => {
          const isComplete =
            (a === 1 && worldSeed.act1Complete) ||
            (a === 2 && worldSeed.act2Complete) ||
            (a === 3 && worldSeed.act3Complete) ||
            (a === 4 && (worldSeed as any).act4Complete) ||
            (a === 5 && done) ||
            false;
          const isCurrent = act === a && !done;
          const isLocked = act < a && !done;
          const col = ACT_COLORS[a];

          return (
            <div key={a} style={{ display: 'flex', gap: 12, marginBottom: 14, opacity: isLocked ? 0.35 : 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: isComplete ? '#60a060' : isCurrent ? col : T.border,
                  border: `2px solid ${isComplete ? '#60a060' : isCurrent ? col : T.border}`,
                  flexShrink: 0,
                }} />
                {a < 5 && (
                  <div style={{ width: 2, flex: 1, minHeight: 10, background: isComplete ? '#60a06066' : T.border + '44', marginTop: 3 }} />
                )}
              </div>
              <div style={{ paddingBottom: a < 5 ? 8 : 0 }}>
                <div style={{ ...tf, fontSize: 10, color: isComplete ? '#60a060' : isCurrent ? col : T.textFaint, letterSpacing: 1, marginBottom: 2 }}>
                  ACT {ACT_LABELS[a]}{isComplete ? ' · COMPLETE' : isCurrent ? ' · IN PROGRESS' : ''}
                </div>
                {(isComplete || isCurrent) && (
                  <div style={{ fontSize: 11, color: T.textMuted, fontStyle: 'italic', lineHeight: 1.5 }}>
                    {isComplete ? ACT_SUMMARIES[a] : `💡 ${ACT_HINTS[a]}`}
                  </div>
                )}
                {a === 2 && (isComplete || isCurrent) && worldSeed.villainName && (
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
                    Villain: <span style={{ color: '#c04030' }}>{worldSeed.villainName}</span>
                    <span style={{ color: T.textFaint }}> · {worldSeed.villainType}</span>
                  </div>
                )}
                {a === 3 && worldSeed.allyRevealed && worldSeed.allyName && (
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
                    Ally: {worldSeed.allyName.split(',')[0]}
                    {worldSeed.betrayalSprung && <span style={{ color: '#c04030' }}> ⚠ Betrayed</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {done && (
          <div style={{ marginTop: 8, padding: 12, background: '#60a06022', border: `1px solid #60a06044`, ...tf, color: '#60a060', fontSize: 12, letterSpacing: 1 }}>
            ✓ VICTORY · {(worldSeed.finalTone || '').toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  function FactionTab() {
    if (factionQuests.length === 0) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>
          No active faction quests. Earn rank and favour with a faction to receive tasks.
        </div>
      );
    }
    const groups: Record<string, Quest[]> = {};
    for (const q of factionQuests) {
      const key = q.factionId || 'Unknown Faction';
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    }
    return (
      <>
        {Object.entries(groups).map(([factionId, qs]) => (
          <div key={factionId}>
            <div style={{ padding: '8px 16px', background: T.panelAlt, borderBottom: `1px solid ${T.border}`, ...tf, color: '#3090c0', fontSize: 9, letterSpacing: 2 }}>
              {factionId.toUpperCase()}
            </div>
            {qs.map((q) => <QuestItem key={q.id} q={q} showAbandon />)}
          </div>
        ))}
      </>
    );
  }

  return (
    <div
      style={{ ...bf, position: 'fixed', inset: 0, background: T.bg + 'ee', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{ background: T.panel, border: `1px solid ${T.accent}`, width: '100%', maxWidth: 640, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px #00000099' }}
      >
        {/* Header */}
        <div style={{ background: T.panelAlt, borderBottom: `1px solid ${T.border}`, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ ...tf, color: T.gold, fontSize: 16, letterSpacing: 2 }}>📋 QUEST LOG</div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, minWidth: 60,
                background: tab === t.id ? T.selectedBg : 'transparent',
                border: 'none', borderBottom: `2px solid ${tab === t.id ? T.accent : 'transparent'}`,
                color: tab === t.id ? T.gold : T.textMuted,
                padding: '10px 6px', cursor: 'pointer', fontSize: 10,
                ...tf, letterSpacing: 0.5, whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'mainquest' && <MainQuestTab />}

          {tab === 'active' && (
            activeQuests.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>
                No active side quests. Talk to people, read notice boards, and explore.
              </div>
            ) : (
              activeQuests.map((q) => <QuestItem key={q.id} q={q} showAbandon />)
            )
          )}

          {tab === 'faction' && <FactionTab />}

          {tab === 'done' && (
            doneQuests.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>No completed quests yet.</div>
            ) : (
              doneQuests.map((q) => <QuestItem key={q.id} q={q} />)
            )
          )}

          {tab === 'failed' && (
            failedQuests.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>No failed quests. Yet.</div>
            ) : (
              failedQuests.map((q) => <QuestItem key={q.id} q={q} />)
            )
          )}

          {tab === 'npcs' && (
            knownNpcs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic', fontSize: 14 }}>
                No NPCs met yet. Venture out and talk to people.
              </div>
            ) : (
              knownNpcs.map((npc, i) => {
                const relColor = relColors[npc.relationship] || T.textMuted;
                return (
                  <div key={npc.name + i} style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                          <span style={{ ...tf, color: T.text, fontSize: 13 }}>{npc.name}</span>
                          <span style={{ fontSize: 10, color: relColor }}>{npc.relationship}</span>
                          {npc.questGiver && (
                            <span style={{ fontSize: 9, color: T.accent, border: `1px solid ${T.accent}44`, padding: '1px 4px', ...tf, letterSpacing: 1 }}>QUEST</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{npc.role}</div>
                        {npc.notes && <div style={{ fontSize: 11, color: T.textFaint, marginTop: 3, fontStyle: 'italic' }}>{npc.notes}</div>}
                        {npc.travelDestination && <div style={{ fontSize: 10, color: T.textFaint, marginTop: 2 }}>Travelling to {npc.travelDestination}</div>}
                      </div>
                      <div style={{ fontSize: 10, color: T.textFaint, textAlign: 'right', flexShrink: 0 }}>Day {npc.metDay}</div>
                    </div>
                  </div>
                );
              })
            )
          )}

          {tab === 'dungeon' && (
            <div style={{ padding: 16 }}>
              <div style={{ background: T.panelAlt, border: `1px solid ${T.border}`, padding: 14, marginBottom: 20 }}>
                <div style={{ ...tf, color: T.accent, fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>YOUR RECORD</div>
                <div style={{ display: 'flex', gap: 28 }}>
                  <div>
                    <div style={{ fontSize: 26, ...tf, color: T.gold }}>{player.dungeon?.deepestFloor || 0}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Deepest floor</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 26, ...tf, color: '#c04040' }}>{player.deathCount || 0}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Deaths</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 26, ...tf, color: T.textMuted }}>{(player.gravestones || []).length}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Gravestones</div>
                  </div>
                </div>
              </div>
              <div style={{ ...tf, color: T.accent, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>LEADERBOARD</div>
              <div style={{ fontSize: 10, color: T.textFaint, marginBottom: 12, padding: '6px 10px', border: `1px solid ${T.border}`, lineHeight: 1.5 }}>
                When you enter the dungeon, your country (derived from your IP address — never your precise location) is recorded alongside your deepest floor and shown as a flag on this leaderboard.
              </div>
              {lbLoading ? (
                <div style={{ color: T.textFaint, fontSize: 12, fontStyle: 'italic' }}>Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div style={{ color: T.textFaint, fontSize: 12, fontStyle: 'italic' }}>No records yet — be the first to descend.</div>
              ) : leaderboard.map((entry, i) => {
                const isMe = entry.hero_name === player.name && entry.hero_class === player.class;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderBottom: `1px solid ${T.border}`,
                      background: isMe ? T.selectedBg : i === 0 ? T.panelAlt : 'transparent',
                      borderLeft: isMe ? `3px solid ${T.accent}` : '3px solid transparent',
                    }}
                  >
                    <span style={{ ...tf, fontSize: i < 3 ? 18 : 13, width: 32, textAlign: 'center', color: T.textFaint }}>
                      {i < 3 ? RANK_MEDAL[i] : `${i + 1}.`}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {countryFlag(entry.country_code) && (
                          <span style={{ fontSize: 14 }} title={entry.country_code || ''}>{countryFlag(entry.country_code)}</span>
                        )}
                        <span style={{ fontSize: 13, color: isMe ? T.gold : T.text, ...tf }}>{entry.hero_name}</span>
                        <span style={{ fontSize: 10, color: T.textFaint }}>{entry.hero_class} Lv.{entry.hero_level}</span>
                        {entry.ng_plus > 0 && (
                          <span style={{ fontSize: 9, color: T.accent, border: `1px solid ${T.accent}44`, padding: '1px 4px', ...tf, letterSpacing: 1 }}>
                            NG+{entry.ng_plus}
                          </span>
                        )}
                        {isMe && (
                          <span style={{ fontSize: 9, color: T.gold, border: `1px solid ${T.gold}44`, padding: '1px 4px', ...tf, letterSpacing: 1 }}>YOU</span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: T.textFaint, marginTop: 2 }}>{floorBiome(entry.deepest_floor)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ ...tf, color: T.gold, fontSize: 15 }}>Floor {entry.deepest_floor}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
