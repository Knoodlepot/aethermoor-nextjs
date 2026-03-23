'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { SUBCLASSES } from '@/lib/subclasses';

interface SubclassScreenProps {
  player: Player;
  onChoose: (subclassName: string) => void;
}

export function SubclassScreen({ player, onChoose }: SubclassScreenProps) {
  const { T, tf, bf } = useTheme();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [confirming, setConfirming] = React.useState(false);

  const classSubclasses = SUBCLASSES[player.class];
  if (!classSubclasses) return null;

  const subclassEntries = Object.entries(classSubclasses);

  function handleConfirm() {
    if (!selected) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onChoose(selected);
  }

  return (
    <div
      style={{
        ...bf,
        position: 'fixed',
        inset: 0,
        background: T.bg + 'f5',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.gold}`,
          width: '100%',
          maxWidth: 760,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 60px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: T.panelAlt,
            borderBottom: `1px solid ${T.gold}55`,
            padding: '18px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ ...tf, color: T.gold, fontSize: 18, letterSpacing: 3, marginBottom: 6 }}>
            CHOOSE YOUR PATH
          </div>
          <div style={{ fontSize: 12, color: T.textMuted }}>
            {player.name} the {player.class} has reached level 10. Your specialisation awaits.
          </div>
          <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4 }}>
            This choice is permanent.
          </div>
        </div>

        {/* Subclass cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {subclassEntries.map(([name, def]) => {
              const isSelected = selected === name;
              return (
                <div
                  key={name}
                  onClick={() => { setSelected(name); setConfirming(false); }}
                  style={{
                    background: isSelected ? T.selectedBg : T.panelAlt,
                    border: `2px solid ${isSelected ? T.gold : T.border}`,
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {/* Icon + name */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{def.icon}</div>
                    <div style={{ ...tf, color: isSelected ? T.gold : T.text, fontSize: 14, letterSpacing: 1 }}>
                      {name.toUpperCase()}
                    </div>
                  </div>

                  {/* Flavour */}
                  <div
                    style={{
                      fontSize: 11,
                      color: T.gold,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      borderTop: `1px solid ${T.border}`,
                      borderBottom: `1px solid ${T.border}`,
                      padding: '6px 0',
                    }}
                  >
                    "{def.flavour}"
                  </div>

                  {/* Description */}
                  <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
                    {def.desc}
                  </div>

                  {/* Skill list */}
                  <div style={{ marginTop: 4 }}>
                    <div style={{ ...tf, fontSize: 9, color: T.textFaint, letterSpacing: 1, marginBottom: 6 }}>
                      SKILLS
                    </div>
                    {def.skills.map((skillId) => (
                      <div
                        key={skillId}
                        style={{
                          fontSize: 10,
                          color: T.textMuted,
                          padding: '2px 0',
                          borderBottom: `1px solid ${T.border}22`,
                        }}
                      >
                        · {skillId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </div>
                    ))}
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div
                      style={{
                        marginTop: 4,
                        textAlign: 'center',
                        ...tf,
                        fontSize: 9,
                        color: T.gold,
                        letterSpacing: 2,
                      }}
                    >
                      ✓ SELECTED
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: T.panelAlt,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 11, color: T.textFaint, fontStyle: 'italic' }}>
            {confirming && selected
              ? `Are you sure? The path of the ${selected} cannot be undone.`
              : selected
              ? `You have chosen the path of the ${selected}.`
              : 'Select a path above to continue.'}
          </div>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            style={{
              padding: '8px 24px',
              background: confirming ? '#8B0000' : selected ? T.accent : 'transparent',
              border: `1px solid ${confirming ? '#cc0000' : selected ? T.accent : T.border}`,
              color: selected ? '#fff' : T.textFaint,
              cursor: selected ? 'pointer' : 'default',
              ...tf,
              fontSize: 12,
              letterSpacing: 2,
              transition: 'all 0.2s',
            }}
          >
            {confirming ? 'CONFIRM — THIS IS FINAL' : 'CHOOSE PATH'}
          </button>
        </div>
      </div>
    </div>
  );
}
