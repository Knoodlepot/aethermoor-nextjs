'use client';

import React, { useState, useMemo } from 'react';
import type { Player } from '../../lib/types';

interface Props {
  player: Player;
  worldSeed: any;
  onNewGame: () => void;
  onLogout: () => void;
}

const EPITAPHS = [
  'The darkness does not gloat. It simply remains.',
  'No bard will sing of this. The songs were silenced with everything else.',
  'The world waited for a hero. The hero did not return.',
  'Some stories do not end — they simply stop.',
  'Even the ravens fell quiet in the end.',
];

export default function BadEndingScreen({ player, worldSeed, onNewGame, onLogout }: Props) {
  const [copied, setCopied] = useState(false);

  const villainName = worldSeed?.villainName || 'the Darkness';
  const questTitle  = worldSeed?.questTitle  || 'The Quest';

  const doneQuests = useMemo(() =>
    (player.quests ?? []).filter((q: any) => (q.status as string) === 'done').length,
    [player.quests]
  );
  const totalKills = useMemo(() =>
    (player.bestiary ?? []).reduce((sum: number, e: any) => sum + (e.count ?? 0), 0),
    [player.bestiary]
  );
  const achievementCount = (player.achievements ?? []).length;

  // Pick a deterministic epitaph based on player name length
  const epitaph = EPITAPHS[player.name.length % EPITAPHS.length];

  const runSummary = [
    `💀  Aethermoor — The Darkness Prevails`,
    ``,
    `${villainName} was not stopped.`,
    `${player.name}, ${player.class} Lv.${player.level} — fell on Day ${player.gameDay ?? 1}.`,
    ``,
    `"${epitaph}"`,
    ``,
    `📜 Run Stats`,
    `  Days survived:  ${player.gameDay ?? 1}`,
    `  Quests done:    ${doneQuests}`,
    `  Enemies slain:  ${totalKills}`,
    `  Actions taken:  ${player.actionCount ?? 0}`,
    `  Achievements:   ${achievementCount} / 30`,
  ].join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(runSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const DARK = '#4a3040';
  const ACCENT = '#8b4a6b';

  const btnBase: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: 'var(--color-panel-alt)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '0.85rem', fontFamily: 'inherit',
    textAlign: 'left', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 10,
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'var(--color-bg)',
        border: `1px solid ${ACCENT}44`,
        width: '100%', maxWidth: 520,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '24px 20px 18px',
          borderBottom: `1px solid ${ACCENT}44`,
          textAlign: 'center',
          background: `linear-gradient(180deg, ${DARK}33 0%, transparent 100%)`,
        }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🌑</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: ACCENT, letterSpacing: 2, textTransform: 'uppercase' }}>
            The World Falls
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 6, fontStyle: 'italic' }}>
            {questTitle} — {villainName} was not stopped
          </div>
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: 'var(--color-panel-alt)',
            border: `1px solid ${ACCENT}33`,
            fontSize: '0.8rem', color: 'var(--color-text-muted)',
            fontStyle: 'italic', lineHeight: 1.6,
          }}>
            "{epitaph}"
          </div>
        </div>

        {/* Stats */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>
            Final Record
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Hero',          value: `${player.name}, ${player.class}` },
              { label: 'Level reached', value: String(player.level) },
              { label: 'Days survived', value: String(player.gameDay ?? 1) },
              { label: 'Quests done',   value: String(doneQuests) },
              { label: 'Enemies slain', value: String(totalKills) },
              { label: 'Actions taken', value: String(player.actionCount ?? 0) },
              { label: 'Achievements',  value: `${achievementCount} / 30` },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '10px 12px',
                background: 'var(--color-panel-alt)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: 3, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: `${DARK}22`,
            border: `1px solid ${ACCENT}33`,
            fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5,
          }}>
            <span style={{ color: ACCENT }}>New Game carries over:</span> all achievements, your title, and the memory of what was lost.
          </div>
        </div>

        {/* Buttons */}
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={onNewGame}
            style={{ ...btnBase, borderColor: ACCENT + '66', color: ACCENT }}
          >
            <span>🕯️</span>
            <div>
              <div style={{ fontWeight: 600 }}>Rise again — begin New Game+</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>A new world. The same darkness. This time, you know what it costs.</div>
            </div>
          </button>

          <button onClick={handleCopy} style={{ ...btnBase }}>
            <span>{copied ? '✅' : '📋'}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{copied ? 'Copied!' : 'Copy run summary'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Shareable record of the fall</div>
            </div>
          </button>

          <button onClick={onLogout} style={{ ...btnBase }}>
            <span>🚪</span>
            <div>
              <div style={{ fontWeight: 600 }}>Return to main menu</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Log out or switch account</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
