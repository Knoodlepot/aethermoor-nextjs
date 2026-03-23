'use client';

import React, { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ClassInfoModal } from '@/components/modals/ClassInfoModal';
import { CLASSES } from '@/lib/constants';
import { SUBCLASSES } from '@/lib/subclasses';


interface Props {
  onStart: (name: string, cls: string, seed?: string) => void;
  isLoading: boolean;
  gravestones?: { name: string; class: string; level: number; epitaph?: string }[];
}


export function CharacterCreationScreen({ onStart, isLoading, gravestones = [] }: Props) {
  const { T, tf, isDyslexic } = useTheme();
  const [playerName, setPlayerName] = useState('');
  const [selClass, setSelClass] = useState<string>('');
  const [classInfoClass, setClassInfoClass] = useState<string | null>(null);
  const [seed, setSeed] = useState('');

  const canStart = playerName.trim().length > 0 && selClass !== '' && !isLoading;

  return (
    <div
      style={{
        background: T.bg,
        height: '100dvh',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
        fontFamily: isDyslexic ? "'OpenDyslexic',Arial,sans-serif" : "'Crimson Text',Georgia,serif",
        color: T.text,
      }}
    >
      <div style={{ maxWidth: 640, width: '100%' }}>
        {/* Header */}
        <h2
          style={{
            ...tf,
            color: T.gold,
            fontSize: 28,
            letterSpacing: 3,
            textAlign: 'center',
            marginBottom: 8,
            marginTop: 32,
          }}
        >
          FORGE YOUR HERO
        </h2>
        <div
          style={{
            textAlign: 'center',
            color: T.textMuted,
            marginBottom: gravestones.length > 0 ? 16 : 32,
            fontSize: 13,
            letterSpacing: 1,
          }}
        >
          Choose wisely. Your legend begins here.
        </div>

        {/* Legacy gravestones */}
        {gravestones.length > 0 && (
          <div
            style={{
              background: T.panelAlt,
              border: `1px solid ${T.border}`,
              padding: '12px 16px',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                ...tf,
                color: T.textMuted,
                fontSize: 10,
                letterSpacing: 2,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              THOSE WHO CAME BEFORE
            </div>
            {gravestones.slice(-3).map((g, i) => (
              <div
                key={i}
                style={{
                  borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  paddingTop: i > 0 ? 8 : 0,
                  marginTop: i > 0 ? 8 : 0,
                }}
              >
                <div style={{ color: T.text, fontSize: 12 }}>
                  {g.name} the {g.class} · Lv.{g.level}
                </div>
                {g.epitaph && (
                  <div
                    style={{
                      color: T.textFaint ?? T.textMuted,
                      fontSize: 11,
                      fontStyle: 'italic',
                    }}
                  >
                    {g.epitaph}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Name input */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              ...tf,
              color: T.accent,
              fontSize: 12,
              letterSpacing: 2,
              display: 'block',
              marginBottom: 8,
            }}
          >
            YOUR NAME
          </label>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={30}
            style={{
              width: '100%',
              background: T.inputBg ?? T.panelAlt,
              border: `1px solid ${playerName ? T.accent : T.border}`,
              color: T.text,
              padding: '12px 16px',
              fontSize: isDyslexic ? 18 : 16,
              fontFamily: isDyslexic ? "'OpenDyslexic',Arial,sans-serif" : "'Crimson Text',Georgia,serif",
              outline: 'none',
              boxSizing: 'border-box' as const,
              transition: 'border-color 0.2s',
              letterSpacing: isDyslexic ? '0.05em' : 'normal',
            }}
          />
        </div>

        {/* World Seed input */}
        <div style={{ marginBottom: 26 }}>
          <label
            style={{
              ...tf,
              color: T.accent,
              fontSize: 12,
              letterSpacing: 2,
              display: 'block',
              marginBottom: 8,
            }}
          >
            WORLD SEED (optional)
          </label>
          <input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Random if left blank"
            maxLength={32}
            style={{
              width: '100%',
              background: T.inputBg ?? T.panelAlt,
              border: `1px solid ${seed ? T.accent : T.border}`,
              color: T.text,
              padding: '12px 16px',
              fontSize: isDyslexic ? 16 : 15,
              fontFamily: isDyslexic ? "'OpenDyslexic',Arial,sans-serif" : "'Crimson Text',Georgia,serif",
              outline: 'none',
              boxSizing: 'border-box' as const,
              transition: 'border-color 0.2s',
              letterSpacing: isDyslexic ? '0.05em' : 'normal',
            }}
          />
          <div style={{ color: T.textMuted, fontSize: 11, marginTop: 4 }}>
            Enter a code to replay a world, or leave blank for a random seed.
          </div>
        </div>

        {/* Class selection */}
        <div style={{ marginBottom: 32 }}>
          <label
            style={{
              ...tf,
              color: T.accent,
              fontSize: 12,
              letterSpacing: 2,
              display: 'block',
              marginBottom: 12,
            }}
          >
            CHOOSE YOUR CLASS
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {Object.entries(CLASSES).map(([cls, data]) => {
              const active = selClass === cls;
              return (
                <div
                  key={cls}
                  onClick={() => setSelClass(cls)}
                  style={{
                    background: active ? (T.selectedBg ?? T.panelAlt) : (T.inputBg ?? T.panelAlt),
                    border: `2px solid ${active ? T.accent : T.border}`,
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: active ? `0 0 14px ${T.accent}33` : 'none',
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{data.icon}</div>
                  <div style={{ ...tf, color: active ? T.gold : T.text, fontSize: 15, marginBottom: 6 }}>
                    {cls}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.textMuted,
                      marginBottom: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    {data.desc}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const, marginBottom: 4 }}>
                    {([['STR', data.str], ['AGI', data.agi], ['INT', data.int], ['WIL', data.wil]] as [string, number][]).map(([s, v]) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 11,
                          background: T.panel ?? T.panelAlt,
                          border: `1px solid ${T.border}`,
                          padding: '2px 6px',
                          color: T.accent,
                        }}
                      >
                        {s} {v}
                      </span>
                    ))}
                    <span
                      style={{
                        fontSize: 11,
                        background: T.panel ?? T.panelAlt,
                        border: `1px solid ${T.border}`,
                        padding: '2px 6px',
                        color: '#c03030',
                      }}
                    >
                      HP {data.hp}
                    </span>
                  </div>
                  {/* Formula preview for primary stat */}
                  <div style={{ fontSize: 10, color: T.textFaint ?? T.textMuted, marginBottom: 10, lineHeight: 1.5 }}>
                    {cls === 'Warrior' && `Hits for ${5 + Math.floor(data.str / 2)} · Dodge ${Math.min(45, data.agi * 3)}%`}
                    {cls === 'Rogue'   && `Backstab ${Math.floor(data.agi * 1.5)} dmg · Dodge ${Math.min(45, data.agi * 3)}%`}
                    {cls === 'Mage'    && `Fireball ~${6 + Math.floor(data.int * 1.2)} dmg · Potions: bonus tick at INT 9`}
                    {cls === 'Cleric'  && `Divine Strike/heal ${Math.floor(data.wil * 1.5)} · Magic resist ${Math.min(30, data.wil * 2)}%`}
                  </div>

                  {/* Subclass preview */}
                  {SUBCLASSES[cls] && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 2, fontFamily: "'Cinzel','Palatino Linotype',serif", marginBottom: 6 }}>
                        SUBCLASSES · UNLOCKS AT LEVEL 10
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {Object.entries(SUBCLASSES[cls]).map(([name, sub]) => (
                          <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ fontSize: 12 }}>{sub.icon}</span>
                            <span style={{ fontSize: 11, color: T.accent, fontFamily: "'Cinzel','Palatino Linotype',serif" }}>{name}</span>
                            <span style={{ fontSize: 10, color: T.textFaint ?? T.textMuted, fontStyle: 'italic' }}>— {sub.flavour}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setClassInfoClass(cls);
                    }}
                    style={{
                      marginTop: 2,
                      width: '100%',
                      background: 'transparent',
                      border: `1px solid ${T.border}`,
                      color: T.textMuted,
                      padding: '6px 8px',
                      fontSize: 10,
                      cursor: 'pointer',
                      letterSpacing: 1,
                      fontFamily: "'Cinzel','Palatino Linotype',serif",
                    }}
                  >
                    ℹ Class Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={() => canStart && onStart(playerName.trim(), selClass, seed.trim() || undefined)}
          disabled={!canStart}
          style={{
            ...tf,
            width: '100%',
            background: canStart ? T.panel ?? T.panelAlt : T.inputBg ?? T.panelAlt,
            border: `1px solid ${canStart ? T.accent : T.border}`,
            color: canStart ? T.gold : T.textMuted,
            padding: '16px',
            fontSize: 14,
            letterSpacing: 3,
            cursor: canStart ? 'pointer' : 'default',
            textTransform: 'uppercase' as const,
            transition: 'all 0.3s',
            marginBottom: 32,
          }}
        >
          {isLoading ? 'Weaving your fate...' : 'Enter Aethermoor'}
        </button>
      </div>

      {classInfoClass && (
        <ClassInfoModal
          cls={classInfoClass as any}
          onClose={() => setClassInfoClass(null)}
        />
      )}
    </div>
  );
}
