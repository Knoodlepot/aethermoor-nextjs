'use client';

import React, { useState, useMemo } from 'react';
import type { Player } from '../../lib/types';

interface Props {
  player: Player;
  worldSeed: any;
  onClose: () => void;
  onNewGame: () => void;
  onLogout: () => void;
}

const TONE_CONFIG: Record<string, { heading: string; colour: string; icon: string }> = {
  triumphant:  { heading: 'Victory',           colour: '#f0c060', icon: '⚔️' },
  pyrrhic:     { heading: 'A Costly Victory',  colour: '#c08040', icon: '🩸' },
  bittersweet: { heading: 'The Price of Dawn', colour: '#8090c0', icon: '🌅' },
  ambiguous:   { heading: 'The Road Not Taken',colour: '#80a080', icon: '🌫️' },
  hollow:      { heading: 'The Last One Left', colour: '#707070', icon: '💀' },
};

export default function EndingScreen({ player, worldSeed, onClose, onNewGame, onLogout }: Props) {
  const [view, setView] = useState<'ending' | 'bestiary'>('ending');
  const [copied, setCopied] = useState(false);

  const tone      = worldSeed?.finalTone     || 'triumphant';
  const toneDesc  = worldSeed?.finalToneDesc || '';
  const villainName = worldSeed?.villainName || 'the Villain';
  const questTitle  = worldSeed?.questTitle  || 'The Quest';
  const cfg = TONE_CONFIG[tone] ?? TONE_CONFIG.triumphant;

  const totalKills = useMemo(() =>
    (player.bestiary ?? []).reduce((sum: number, e: any) => sum + (e.count ?? 0), 0),
    [player.bestiary]
  );
  const doneQuests = useMemo(() =>
    (player.quests ?? []).filter((q: any) => (q.status as string) === 'done').length,
    [player.quests]
  );
  const achievementCount = (player.achievements ?? []).length;
  const ngCount = (player.ngPlusCount ?? 0) + 1;

  const ngLabel = ngCount === 1 ? '' : ` (NG+${ngCount - 1})`;

  // Build the run summary text for clipboard
  const runSummary = [
    `⚔️  Aethermoor — Run Complete${ngLabel}`,
    ``,
    `${cfg.icon} ${cfg.heading}: ${questTitle}`,
    `${villainName} has fallen.`,
    toneDesc ? `"${toneDesc}"` : '',
    ``,
    `📜 Run Stats`,
    `  Hero:           ${player.name}, ${player.class} Lv.${player.level}`,
    `  Days survived:  ${player.gameDay ?? 1}`,
    `  Quests done:    ${doneQuests}`,
    `  Enemies slain:  ${totalKills}`,
    `  Actions taken:  ${player.actionCount ?? 0}`,
    `  Achievements:   ${achievementCount} / 30`,
  ].filter((l) => l !== undefined).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(runSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const sortedBestiary = useMemo(() =>
    [...(player.bestiary ?? [])].sort((a: any, b: any) => (b.count ?? 0) - (a.count ?? 0)),
    [player.bestiary]
  );

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
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: 'var(--color-bg)',
        border: `1px solid ${cfg.colour}44`,
        width: '100%', maxWidth: 560,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${cfg.colour}44`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{cfg.icon}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: cfg.colour, letterSpacing: 1 }}>
            {cfg.heading}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4, fontStyle: 'italic' }}>
            {questTitle} — {villainName} has fallen
          </div>
          {toneDesc && (
            <div style={{
              marginTop: 12, padding: '8px 12px',
              background: 'var(--color-panel-alt)',
              border: `1px solid var(--color-border)`,
              fontSize: '0.8rem', color: 'var(--color-text-muted)',
              fontStyle: 'italic', lineHeight: 1.5,
            }}>
              "{toneDesc}"
            </div>
          )}
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
          {(['ending', 'bestiary'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                flex: 1, padding: '8px 0',
                background: view === v ? 'var(--color-panel-alt)' : 'transparent',
                border: 'none', borderBottom: view === v ? `2px solid ${cfg.colour}` : '2px solid transparent',
                color: view === v ? cfg.colour : 'var(--color-text-muted)',
                fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer',
                letterSpacing: 1, textTransform: 'uppercase',
              }}
            >
              {v === 'ending' ? 'Run Summary' : 'Hall of Legends'}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {view === 'ending' && (
            <>
              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Hero',           value: `${player.name}, ${player.class}` },
                  { label: 'Level reached',  value: String(player.level) },
                  { label: 'Days survived',  value: String(player.gameDay ?? 1) },
                  { label: 'Quests done',    value: String(doneQuests) },
                  { label: 'Enemies slain',  value: String(totalKills) },
                  { label: 'Actions taken',  value: String(player.actionCount ?? 0) },
                  { label: 'Achievements',   value: `${achievementCount} / 30` },
                  { label: 'New Game+',      value: ngCount === 1 ? 'First run' : `NG+${ngCount - 1}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    padding: '10px 12px',
                    background: 'var(--color-panel-alt)',
                    border: '1px solid var(--color-border)',
                  }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: 3, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* NG+ legacy preview */}
              <div style={{
                padding: '10px 12px', marginBottom: 16,
                background: '#1a1a0a',
                border: `1px solid ${cfg.colour}44`,
              }}>
                <div style={{ fontSize: '0.7rem', color: cfg.colour, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>New Game+ Carries Over</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span>🏷️  Title: <span style={{ color: 'var(--color-text)' }}>{
                    TONE_CONFIG[tone]?.heading === 'Victory'
                      ? `Slayer of ${villainName}`
                      : TONE_CONFIG[tone]?.heading === 'A Costly Victory'
                      ? 'The Hollow Victor'
                      : TONE_CONFIG[tone]?.heading === 'The Price of Dawn'
                      ? 'Who Paid the Price'
                      : TONE_CONFIG[tone]?.heading === 'The Road Not Taken'
                      ? 'Who Walked Away'
                      : 'The Last Standing'
                  }</span></span>
                  <span>🗝️  Keepsake: <span style={{ color: 'var(--color-text)' }}>{villainName}'s Signet</span></span>
                  <span>💰  Starting bonus: <span style={{ color: 'var(--color-text)' }}>+100 gold</span></span>
                  <span>🏆  All {achievementCount} achievements</span>
                </div>
              </div>
            </>
          )}

          {view === 'bestiary' && (
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>
                {sortedBestiary.length} enemy types · {totalKills} total kills
              </div>
              {sortedBestiary.length === 0 && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 24 }}>
                  No enemies recorded.
                </div>
              )}
              {sortedBestiary.map((entry: any) => (
                <div key={entry.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 10px', marginBottom: 4,
                  background: 'var(--color-panel-alt)',
                  border: '1px solid var(--color-border)',
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{entry.name}</span>
                  <span style={{ fontSize: '0.85rem', color: cfg.colour, fontWeight: 600 }}>{entry.count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>

          <button
            onClick={onClose}
            style={{ ...btnBase, borderColor: cfg.colour + '66', color: cfg.colour }}
          >
            <span>⚔️</span>
            <div>
              <div style={{ fontWeight: 600 }}>Continue your legend</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Keep exploring — the world lives on</div>
            </div>
          </button>

          <button
            onClick={onNewGame}
            style={{ ...btnBase }}
          >
            <span>✨</span>
            <div>
              <div style={{ fontWeight: 600 }}>Begin NG+{ngCount > 1 ? ngCount - 1 : ''}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>New world · keep title, keepsake & achievements</div>
            </div>
          </button>

          <button
            onClick={handleCopy}
            style={{ ...btnBase }}
          >
            <span>{copied ? '✅' : '📋'}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{copied ? 'Copied!' : 'Copy run summary'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Shareable text for Discord, Reddit, anywhere</div>
            </div>
          </button>

          <button
            onClick={onLogout}
            style={{ ...btnBase }}
          >
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
