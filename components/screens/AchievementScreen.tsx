'use client';

import React, { useState, useMemo } from 'react';
import type { Player } from '../../lib/types';
import { ACHIEVEMENTS, type AchievementDef } from '../../lib/achievements';

interface Props {
  player: Player;
  onClose: () => void;
}

type Tab = 'all' | 'combat' | 'dungeon' | 'progression' | 'world' | 'legacy';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',         label: 'All' },
  { id: 'combat',      label: 'Combat' },
  { id: 'dungeon',     label: 'Dungeon' },
  { id: 'progression', label: 'Progression' },
  { id: 'world',       label: 'World' },
  { id: 'legacy',      label: 'Legacy' },
];

export default function AchievementScreen({ player, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('all');

  const unlockedIds = useMemo(
    () => new Set((player.achievements ?? []).map((a) => a.id)),
    [player.achievements]
  );

  const filtered = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => tab === 'all' || a.category === tab);
  }, [tab]);

  const unlockedCount = useMemo(
    () => ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).length,
    [unlockedIds]
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        width: '100%', maxWidth: '600px',
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
              Achievements
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {unlockedCount} / {ACHIEVEMENTS.length} unlocked
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: '1.2rem', lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '8px 12px',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
          flexShrink: 0,
        }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                background: tab === t.id ? 'var(--color-primary)' : 'transparent',
                color: tab === t.id ? 'var(--color-bg)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                fontWeight: tab === t.id ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Achievement list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 12px' }}>
          {filtered.map((def) => (
            <AchievementRow
              key={def.id}
              def={def}
              unlocked={unlockedIds.has(def.id)}
              unlockedDay={(player.achievements ?? []).find((a) => a.id === def.id)?.unlockedDay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AchievementRow({
  def,
  unlocked,
  unlockedDay,
}: {
  def: AchievementDef;
  unlocked: boolean;
  unlockedDay?: number;
}) {
  const isHiddenLocked = def.hidden && !unlocked;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '10px 8px',
      borderBottom: '1px solid var(--color-border)',
      opacity: unlocked ? 1 : 0.55,
    }}>
      {/* Icon */}
      <div style={{
        fontSize: '1.6rem',
        lineHeight: 1,
        minWidth: '32px',
        textAlign: 'center',
        filter: unlocked ? 'none' : 'grayscale(1)',
      }}>
        {isHiddenLocked ? '?' : def.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: unlocked ? 'var(--color-text)' : 'var(--color-text-muted)',
        }}>
          {isHiddenLocked ? '???' : def.title}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          marginTop: '2px',
        }}>
          {unlocked
            ? def.description
            : isHiddenLocked
              ? 'Hidden achievement'
              : def.hint}
        </div>
        {unlocked && unlockedDay !== undefined && (
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '3px', opacity: 0.7 }}>
            Unlocked day {unlockedDay}
          </div>
        )}
      </div>

      {/* Badge */}
      {unlocked && (
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--color-primary)',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          paddingTop: '2px',
        }}>
          DONE
        </div>
      )}
    </div>
  );
}
