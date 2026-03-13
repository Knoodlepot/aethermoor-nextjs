'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { NG_PLUS_PERKS } from '@/lib/constants';

interface NGPlusScreenProps {
  player: Player;
  worldSeed: any;
  onConfirm: (opts: any) => void;
  onCancel: () => void;
}

export function NGPlusScreen({
  player,
  worldSeed,
  onConfirm,
  onCancel,
}: NGPlusScreenProps) {
  const { T, tf, bf } = useTheme();
  const [selectedPerk, setSelectedPerk] = React.useState<string | null>(null);

  // _pendingLegacyItem is attached transiently by the game loop; not in the TS type
  const legItem = (player as any)._pendingLegacyItem as
    | { name: string; desc: string }
    | undefined;

  const ngCount = (player.ngPlusCount || 0) + 1;
  const carriedGold = Math.floor((player.gold || 0) * 0.5);
  const carriedRep = Math.floor((player.reputation || 0) * 0.5);

  function handleConfirm() {
    if (!selectedPerk) return;

    const newPerks = [...(player.legacyPerks || []), selectedPerk];
    const newItems = legItem
      ? [...(player.legacyItems || []), legItem]
      : player.legacyItems || [];

    const newFS: Record<string, number> = {};
    Object.entries(player.factionStandings || {}).forEach(([id, xp]) => {
      newFS[id] = Math.floor((xp as number) / 2);
    });

    onConfirm({
      count: ngCount,
      perks: newPerks,
      items: newItems,
      gold: carriedGold,
      factionStandings: newFS,
      reputation: carriedRep,
      level: player.level,
      xp: player.xp,
      equipped: player.equipped,
      inventory: player.inventory,
    });
  }

  // Perks the player hasn't already chosen
  const availablePerks = NG_PLUS_PERKS.filter(
    (pk) => !(player.legacyPerks || []).includes(pk.id)
  );
  const alreadyHavePerks = (player.legacyPerks || [])
    .map((id) => NG_PLUS_PERKS.find((p) => p.id === id)?.name || id)
    .join(', ');

  return (
    <div
      style={{
        ...bf,
        position: 'fixed',
        inset: 0,
        background: '#050210ee',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: T.panel,
          border: `2px solid ${T.gold}`,
          width: '100%',
          maxWidth: 600,
          boxShadow: `0 0 80px ${T.gold}44`,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: T.panelAlt,
            borderBottom: `1px solid ${T.gold}44`,
            padding: '16px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌟</div>
          <div style={{ ...tf, color: T.gold, fontSize: 20, letterSpacing: 3 }}>
            NEW GAME+
          </div>
          <div
            style={{
              fontSize: 12,
              color: T.textMuted,
              marginTop: 4,
              ...tf,
              letterSpacing: 1,
            }}
          >
            CYCLE {ngCount} BEGINS
          </div>
        </div>

        {/* Legacy item (if any) */}
        {legItem && (
          <div
            style={{
              padding: '14px 20px',
              borderBottom: `1px solid ${T.border}`,
              background: '#0a0a1a',
            }}
          >
            <div
              style={{
                ...tf,
                color: T.gold,
                fontSize: 10,
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              LEGACY ITEM — CARRIED FORWARD
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>👑</span>
              <div>
                <div style={{ color: T.text, fontSize: 14, ...tf }}>{legItem.name}</div>
                <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>
                  {legItem.desc}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carries over summary */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}` }}>
          <div
            style={{
              ...tf,
              color: T.accent,
              fontSize: 10,
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            CARRIES OVER
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              fontSize: 12,
              color: T.textMuted,
            }}
          >
            <span>✓ Level {player.level} &amp; all XP</span>
            <span>✓ All equipment &amp; inventory</span>
            <span>✓ {carriedGold}g (50% of gold)</span>
            <span>✓ Reputation {carriedRep} (50%)</span>
            <span>✓ Faction standings halved</span>
            <span>✓ All gravestones</span>
            {(player.legacyPerks || []).length > 0 && (
              <span>
                ✓ {player.legacyPerks.length} previous perk
                {player.legacyPerks.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: '#c06030',
              ...tf,
              letterSpacing: 1,
            }}
          >
            ✗ Main quest resets · ✗ NPCs reset · ✗ Location standings reset · ✗ Enemy
            difficulty +{Math.round(ngCount * 20)}%
          </div>
        </div>

        {/* Perk selection */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}` }}>
          <div
            style={{
              ...tf,
              color: T.accent,
              fontSize: 10,
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            CHOOSE YOUR LEGACY PERK
          </div>

          {availablePerks.length === 0 ? (
            <div style={{ fontSize: 12, color: T.textFaint, fontStyle: 'italic' }}>
              You have unlocked all legacy perks.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              {availablePerks.map((perk) => {
                const isSelected = selectedPerk === perk.id;
                return (
                  <div
                    key={perk.id}
                    onClick={() => setSelectedPerk(perk.id)}
                    style={{
                      padding: '10px 12px',
                      border: `1px solid ${isSelected ? T.gold : T.border}`,
                      background: isSelected ? T.selectedBg : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 6,
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{perk.icon}</span>
                      <span
                        style={{
                          ...tf,
                          color: isSelected ? T.gold : T.text,
                          fontSize: 11,
                          letterSpacing: 0.5,
                        }}
                      >
                        {perk.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>
                      {perk.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {alreadyHavePerks && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: T.textFaint,
                fontStyle: 'italic',
              }}
            >
              Already have: {alreadyHavePerks}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          style={{
            padding: '14px 20px',
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              ...tf,
              background: 'transparent',
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              padding: '10px 20px',
              fontSize: 12,
              letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            Keep Playing
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPerk}
            style={{
              ...tf,
              background: selectedPerk ? '#1a1040' : 'transparent',
              border: `1px solid ${selectedPerk ? T.gold : T.border}`,
              color: selectedPerk ? T.gold : T.textFaint,
              padding: '10px 24px',
              fontSize: 12,
              letterSpacing: 2,
              cursor: selectedPerk ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            ✦ BEGIN NG+ CYCLE {ngCount}
          </button>
        </div>
      </div>
    </div>
  );
}
