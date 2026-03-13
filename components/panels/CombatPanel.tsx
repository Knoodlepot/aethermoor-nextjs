'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Enemy } from '@/lib/types';

interface CombatPanelProps {
  enemy: Enemy | null;
  combatLog?: string[];
  playerStatusEffects?: string[];
  playerDefending?: boolean;
}

export function CombatPanel({
  enemy,
  combatLog = [],
  playerStatusEffects = [],
  playerDefending = false,
}: CombatPanelProps) {
  const { T, tf } = useTheme();

  if (!enemy) return null;

  const hpPct = Math.round((enemy.hp / enemy.maxHp) * 100);
  const hpCol = hpPct > 60 ? '#60a060' : hpPct > 30 ? '#c0a030' : '#c03030';

  const TIER_LABELS = ['minion', 'standard', 'veteran', 'boss'] as const;
  const tierKey = TIER_LABELS[enemy.tier as number] ?? 'standard';
  const tierCol = enemy.isFinalBoss
    ? '#ff4040'
    : enemy.isLieutenant
      ? '#ff8c00'
      : ({
          minion: '#808080',
          standard: '#c0a030',
          veteran: '#6080c0',
          boss: '#c040c0',
        })[tierKey] || T.accent;

  const styleLabel: Record<string, string> = {
    pack_hunter: 'Pack Hunter',
    dirty_fighter: 'Dirty Fighter',
    relentless: 'Relentless',
    shambling: 'Shambling Dread',
    spellcaster: 'Spellcaster',
    disciplined: 'Disciplined',
    enraged: 'Enraged',
    flame_breath: 'Flame Breath',
    shadow_strike: 'Shadow Strike',
    apex: 'Apex',
  };

  const SI: Record<string, string> = { burning: '🔥', poisoned: '☠️', stunned: '⚡' };
  const bossGlow = enemy.isFinalBoss
    ? '0 0 30px #ff404066, 0 0 60px #ff404022'
    : enemy.isLieutenant
      ? '0 0 20px #ff8c0044'
      : 'none';

  return (
    <div
      style={{
        background: T.panelAlt,
        border: `2px solid ${tierCol}88`,
        padding: 12,
        marginBottom: 8,
        boxShadow: bossGlow,
      }}
    >
      {enemy.isFinalBoss && (
        <div
          style={{
            textAlign: 'center',
            background: '#ff404022',
            border: '1px solid #ff404066',
            padding: '4px 8px',
            marginBottom: 8,
            ...tf,
            color: '#ff4040',
            fontSize: 10,
            letterSpacing: 3,
          }}
        >
          ⚠ FINAL CONFRONTATION ⚠
        </div>
      )}

      {enemy.isLieutenant && (
        <div
          style={{
            textAlign: 'center',
            background: '#ff8c0022',
            border: '1px solid #ff8c0066',
            padding: '3px 8px',
            marginBottom: 8,
            ...tf,
            color: '#ff8c00',
            fontSize: 9,
            letterSpacing: 3,
          }}
        >
          ⚔ VILLAIN'S LIEUTENANT
        </div>
      )}

      {/* Enemy header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: enemy.isFinalBoss ? 32 : 24 }}>{enemy.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ ...tf, color: tierCol, fontSize: enemy.isFinalBoss ? 14 : 12, letterSpacing: 1 }}>
              {enemy.name}
            </span>
            {enemy.tierLabel && (
              <span
                style={{ fontSize: 9, ...tf, color: tierCol, border: `1px solid ${tierCol}44`, padding: '1px 5px' }}
              >
                {enemy.tierLabel.toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
            {styleLabel[enemy.style || ''] || enemy.style}
            {(enemy.traitLabels?.length ?? 0) > 0 ? ` · ${enemy.traitLabels!.join(', ')}` : ''}
          </div>
          {enemy.description && (
            <div style={{ fontSize: 11, color: T.textFaint, fontStyle: 'italic', marginTop: 2, fontFamily: 'Crimson Text,serif' }}>
              {enemy.description}
            </div>
          )}
        </div>
        {enemy.statusEffects?.map((s) => (
          <span key={s} style={{ fontSize: 16 }}>
            {SI[s] || '❓'}
          </span>
        ))}
      </div>

      {/* HP bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, ...tf, color: T.textMuted, marginBottom: 3 }}>
          <span>HP</span>
          <span>{enemy.hp}/{enemy.maxHp}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: T.border, overflow: 'hidden' }}>
          <div
            style={{ height: '100%', width: `${hpPct}%`, background: hpCol, borderRadius: 3, transition: 'width 0.3s' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: (enemy.statusEffects?.length || playerDefending || playerStatusEffects.length) ? 8 : 0 }}>
        {[['STR', enemy.str, '#c07030'], ['AGI', enemy.agi, '#30a060'], ['DEF', enemy.def, '#4080c0']].map(
          ([s, v, c]) => (
            <div key={s as string} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 13, color: c as string, ...tf }}>{v}</div>
              <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: 1 }}>{s}</div>
            </div>
          )
        )}
      </div>

      {/* Player status */}
      {(playerDefending || playerStatusEffects.length > 0) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          {playerDefending && (
            <span style={{ fontSize: 11, color: '#4080c0', border: '1px solid #4080c044', padding: '2px 6px', borderRadius: 3 }}>
              🛡 Defending
            </span>
          )}
          {playerStatusEffects.map((s) => (
            <span key={s} style={{ fontSize: 11, color: '#c06030', border: '1px solid #c0603044', padding: '2px 6px', borderRadius: 3 }}>
              {SI[s] || s} {s}
            </span>
          ))}
        </div>
      )}

      {/* Combat log */}
      {combatLog.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 6, marginTop: 4 }}>
          {combatLog.slice(-3).map((entry, i) => (
            <div
              key={i}
              style={{
                fontSize: 11,
                color: i === combatLog.slice(-3).length - 1 ? T.text : T.textMuted,
                marginBottom: 2,
                fontFamily: 'Crimson Text,serif',
              }}
            >
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
