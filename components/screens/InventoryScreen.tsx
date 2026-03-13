'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { EQUIP_SLOTS, ITEM_INFO, ITEM_STAT_BONUSES } from '@/lib/constants';
import * as helpers from '@/lib/helpers';

// ── Helpers not yet in helpers.ts — accessed via module cast ──
const getItemInfo = (helpers as any).getItemInfo as ((name: string) => any) | undefined;
const getItemSlotEx = (helpers as any).getItemSlotEx as ((name: string) => string | null) | undefined;
const getConsumableEffect = (helpers as any).getConsumableEffect as ((name: string) => any) | undefined;
const isDisguisedItem = (helpers as any).isDisguisedItem as ((name: string) => boolean) | undefined;
const getDisguisedItemTrueName = (helpers as any).getDisguisedItemTrueName as ((name: string) => string) | undefined;
const getDisguisedItemDisplay = (helpers as any).getDisguisedItemDisplay as ((name: string, revealed: boolean) => any) | undefined;
const getActiveSetBonuses = (helpers as any).getActiveSetBonuses as ((equipped: Record<string, string | null>) => any[]) | undefined;
const getAllEquipmentBonuses = (helpers as any).getAllEquipmentBonuses as ((equipped: Record<string, string | null>) => Record<string, number>) | undefined;
const getItemSet = (helpers as any).getItemSet as ((name: string) => string | null) | undefined;

// ── Local constants not yet in constants.ts ──

// Items that cannot be dropped
const PROTECTED_ITEMS = new Set([
  'map', 'journal', 'legacy item', 'key', 'quest item',
]);

// Faction set definitions for partial set display
interface FactionSetDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  pieces: string[];
  bonuses: Record<number, string>;
}

const FACTION_SETS: FactionSetDef[] = [
  {
    id: 'shadowmere',
    name: 'Shadowmere Set',
    icon: '🌑',
    color: '#606060',
    pieces: ['Shadowmere Cloak', 'Shadow Boots', 'Dagger'],
    bonuses: { 2: '+2 AGI', 3: 'Shadow Step ability' },
  },
  {
    id: 'ember',
    name: 'Ember Set',
    icon: '🔥',
    color: '#c06030',
    pieces: ['Ember Robes', 'Amulet of Warding', 'Arcane Wand'],
    bonuses: { 2: '+2 INT', 3: 'Flame Shield ability' },
  },
  {
    id: 'guardian',
    name: "Guardian's Set",
    icon: '🛡️',
    color: '#3060c0',
    pieces: ['Plate Armour', 'Tower Shield', 'War Hammer'],
    bonuses: { 2: '+2 STR, +1 WIL', 3: 'Unbreakable ability' },
  },
];

// ── Helper fallbacks ──

function resolveItemInfo(name: string): { icon: string; type: string; desc: string } {
  if (getItemInfo) {
    const info = getItemInfo(name);
    if (info) return info;
  }
  const key = name.toLowerCase();
  const fromConst = (ITEM_INFO as Record<string, { icon: string; type: string; desc: string }>)[key];
  if (fromConst) return fromConst;
  return { icon: '📦', type: 'Item', desc: '' };
}

function resolveItemSlot(name: string): string | null {
  if (getItemSlotEx) return getItemSlotEx(name);
  const info = resolveItemInfo(name);
  if (!info) return null;
  for (const [slot, def] of Object.entries(EQUIP_SLOTS)) {
    if ((def as any).types?.includes(info.type)) return slot;
  }
  return null;
}

function resolveIsDisguised(name: string): boolean {
  if (isDisguisedItem) return isDisguisedItem(name);
  return false;
}

function resolveTrueName(name: string): string {
  if (getDisguisedItemTrueName) return getDisguisedItemTrueName(name);
  return name;
}

function resolveSetBonuses(equipped: Record<string, string | null>): any[] {
  if (getActiveSetBonuses) return getActiveSetBonuses(equipped);
  return [];
}

function resolveEquipBonuses(equipped: Record<string, string | null>): Record<string, number> {
  if (getAllEquipmentBonuses) return getAllEquipmentBonuses(equipped);
  // Simple fallback from ITEM_STAT_BONUSES
  const total: Record<string, number> = {};
  Object.values(equipped).forEach((itemName) => {
    if (!itemName) return;
    const bonuses = (ITEM_STAT_BONUSES as Record<string, Record<string, number>>)[itemName];
    if (bonuses) {
      Object.entries(bonuses).forEach(([stat, val]) => {
        total[stat] = (total[stat] || 0) + val;
      });
    }
  });
  return total;
}

function resolveItemSet(name: string): string | null {
  if (getItemSet) return getItemSet(name);
  for (const set of FACTION_SETS) {
    if (set.pieces.includes(name)) return set.id;
  }
  return null;
}

interface InventoryScreenProps {
  player: Player;
  onEquip: (itemName: string) => void;
  onUnequip: (slot: string) => void;
  onUse: (itemName: string) => void;
  onDrop: (itemName: string) => void;
  onClose: () => void;
}

export function InventoryScreen({ player, onEquip, onUnequip, onUse, onDrop, onClose }: InventoryScreenProps) {
  const { T, tf, bf } = useTheme();
  const [tab, setTab] = React.useState<'equipped' | 'items'>('equipped');
  const [dropConfirm, setDropConfirm] = React.useState<string | null>(null);
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);

  const equipped = player.equipped || {};
  const inventory = player.inventory || [];
  const revealed = player.disguisedItemsRevealed || [];

  const equipBonuses = resolveEquipBonuses(equipped);
  const setBonuses = resolveSetBonuses(equipped);

  const TABS = [
    { id: 'equipped' as const, label: 'Equipped' },
    { id: 'items' as const, label: `Inventory (${inventory.length})` },
  ];

  const statNames: Record<string, string> = { str: 'STR', agi: 'AGI', int: 'INT', wil: 'WIL' };

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
          maxWidth: 600,
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
          <div>
            <div style={{ ...tf, color: T.gold, fontSize: 16, letterSpacing: 2 }}>
              🎒 INVENTORY
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {inventory.length} items · {player.gold}g
            </div>
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

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                background: tab === t.id ? T.selectedBg : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? T.accent : 'transparent'}`,
                color: tab === t.id ? T.gold : T.textMuted,
                padding: '10px 8px',
                cursor: 'pointer',
                fontSize: 11,
                ...tf,
                letterSpacing: 1,
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* ── EQUIPPED TAB ── */}
          {tab === 'equipped' && (
            <div style={{ padding: 12 }}>
              {/* Stat bonuses from equipment */}
              {Object.keys(equipBonuses).length > 0 && (
                <div
                  style={{
                    background: T.panelAlt,
                    border: `1px solid ${T.border}`,
                    padding: 10,
                    marginBottom: 12,
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontSize: 10, ...tf, color: T.accent, letterSpacing: 2, width: '100%', marginBottom: 4 }}>
                    EQUIPMENT BONUSES
                  </div>
                  {Object.entries(equipBonuses).map(([stat, val]) => (
                    <div key={stat} style={{ fontSize: 12, color: '#60a060' }}>
                      +{val} {statNames[stat] || stat.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}

              {/* Set bonuses */}
              {setBonuses.length > 0 && (
                <div
                  style={{
                    background: '#0a1a0a',
                    border: '1px solid #60a06044',
                    padding: 10,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 10, ...tf, color: '#60a060', letterSpacing: 2, marginBottom: 6 }}>
                    ACTIVE SET BONUSES
                  </div>
                  {setBonuses.map((bonus: any, i: number) => (
                    <div key={i} style={{ fontSize: 12, color: '#60a060', marginBottom: 2 }}>
                      {bonus.name || bonus}: {bonus.desc || ''}
                    </div>
                  ))}
                </div>
              )}

              {/* Equipment slots */}
              {Object.entries(EQUIP_SLOTS).map(([slotId, slotDef]) => {
                const itemName = equipped[slotId] || null;
                const isRevealed = itemName ? revealed.includes(itemName) : false;
                const trueName = itemName && resolveIsDisguised(itemName) && isRevealed
                  ? resolveTrueName(itemName)
                  : itemName;
                const displayInfo = itemName ? resolveItemInfo(trueName || itemName) : null;

                return (
                  <div
                    key={slotId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <div style={{ width: 80, flexShrink: 0 }}>
                      <div style={{ fontSize: 10, ...tf, color: T.textFaint, letterSpacing: 1 }}>
                        {(slotDef as any).icon} {(slotDef as any).label.toUpperCase()}
                      </div>
                    </div>
                    {itemName ? (
                      <>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 18 }}>{displayInfo?.icon || '📦'}</span>
                            <span
                              style={{
                                fontSize: 12,
                                color: isRevealed ? '#c0a030' : T.text,
                                ...tf,
                              }}
                            >
                              {trueName || itemName}
                            </span>
                            {isRevealed && (
                              <span
                                style={{
                                  fontSize: 9,
                                  color: '#c0a030',
                                  border: '1px solid #c0a03044',
                                  padding: '1px 4px',
                                  ...tf,
                                  letterSpacing: 1,
                                }}
                              >
                                REVEALED
                              </span>
                            )}
                          </div>
                          {/* Stat bonuses for this item */}
                          {(() => {
                            const itemBonuses = (ITEM_STAT_BONUSES as Record<string, Record<string, number>>)[itemName] ||
                              (ITEM_STAT_BONUSES as Record<string, Record<string, number>>)[trueName || ''];
                            if (!itemBonuses) return null;
                            return (
                              <div style={{ fontSize: 10, color: '#60a060', marginTop: 2 }}>
                                {Object.entries(itemBonuses).map(([s, v]) => `+${v} ${s.toUpperCase()}`).join(' ')}
                              </div>
                            );
                          })()}
                        </div>
                        <button
                          onClick={() => onUnequip(slotId)}
                          style={{
                            padding: '4px 10px',
                            background: 'transparent',
                            border: `1px solid ${T.border}`,
                            color: T.textMuted,
                            cursor: 'pointer',
                            fontSize: 10,
                            ...tf, letterSpacing: 1,
                            flexShrink: 0,
                          }}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div style={{ flex: 1, fontSize: 11, color: T.textFaint, fontStyle: 'italic' }}>
                        — empty —
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Partial set progress */}
              {FACTION_SETS.map((set) => {
                const equippedPieces = set.pieces.filter((p) =>
                  Object.values(equipped).some((e) => e === p)
                );
                if (equippedPieces.length === 0) return null;
                return (
                  <div
                    key={set.id}
                    style={{
                      marginTop: 12,
                      background: T.panelAlt,
                      border: `1px solid ${set.color}44`,
                      padding: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span>{set.icon}</span>
                      <span style={{ ...tf, color: set.color, fontSize: 11, letterSpacing: 1 }}>
                        {set.name}
                      </span>
                      <span style={{ fontSize: 10, color: T.textFaint }}>
                        {equippedPieces.length}/{set.pieces.length}
                      </span>
                    </div>
                    {Object.entries(set.bonuses).map(([count, bonus]) => {
                      const active = equippedPieces.length >= Number(count);
                      return (
                        <div
                          key={count}
                          style={{
                            fontSize: 11,
                            color: active ? '#60a060' : T.textFaint,
                            marginBottom: 2,
                          }}
                        >
                          ({count}) {bonus}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── INVENTORY TAB ── */}
          {tab === 'items' && (
            inventory.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic' }}>
                Your pack is empty.
              </div>
            ) : (
              inventory.map((itemName, i) => {
                const key = itemName + i;
                const isExpanded = expandedItem === key;
                const isRevealed = revealed.includes(itemName);
                const disguised = resolveIsDisguised(itemName);
                const trueName = disguised && isRevealed ? resolveTrueName(itemName) : itemName;
                const info = resolveItemInfo(trueName || itemName);
                const slotId = resolveItemSlot(itemName);
                const isEquippable = !!slotId;
                const isUsable = !!(getConsumableEffect ? getConsumableEffect(itemName) : (info?.type === 'Consumable' || info?.type === 'Food'));
                const isProtected = PROTECTED_ITEMS.has(itemName.toLowerCase());
                const setId = resolveItemSet(itemName);
                const setDef = setId ? FACTION_SETS.find((s) => s.id === setId) : null;

                return (
                  <div
                    key={key}
                    style={{
                      padding: '10px 14px',
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedItem(isExpanded ? null : key)}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{info.icon || '📦'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: 13,
                              color: isRevealed ? '#c0a030' : T.text,
                              ...tf,
                            }}
                          >
                            {trueName}
                          </span>
                          {isRevealed && (
                            <span
                              style={{
                                fontSize: 9,
                                color: '#c0a030',
                                border: '1px solid #c0a03044',
                                padding: '1px 4px',
                                ...tf, letterSpacing: 1,
                              }}
                            >
                              REVEALED
                            </span>
                          )}
                          {setDef && (
                            <span
                              style={{
                                fontSize: 9,
                                color: setDef.color,
                                border: `1px solid ${setDef.color}44`,
                                padding: '1px 4px',
                                ...tf, letterSpacing: 1,
                              }}
                            >
                              SET
                            </span>
                          )}
                        </div>
                        {info.type && (
                          <div style={{ fontSize: 10, color: T.textFaint }}>{info.type}</div>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 8, paddingLeft: 30 }}>
                        {info.desc && (
                          <div
                            style={{
                              fontSize: 12,
                              color: T.textMuted,
                              fontStyle: 'italic',
                              marginBottom: 8,
                              lineHeight: 1.5,
                            }}
                          >
                            {info.desc}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {isEquippable && (
                            <button
                              onClick={() => onEquip(itemName)}
                              style={{
                                padding: '4px 12px',
                                background: T.accent,
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 10,
                                ...tf, letterSpacing: 1,
                              }}
                            >
                              Equip
                            </button>
                          )}
                          {isUsable && (
                            <button
                              onClick={() => onUse(itemName)}
                              style={{
                                padding: '4px 12px',
                                background: '#1a3a1a',
                                border: '1px solid #60a060',
                                color: '#60a060',
                                cursor: 'pointer',
                                fontSize: 10,
                                ...tf, letterSpacing: 1,
                              }}
                            >
                              Use
                            </button>
                          )}
                          {!isProtected && (
                            dropConfirm === key ? (
                              <>
                                <button
                                  onClick={() => { setDropConfirm(null); onDrop(itemName); }}
                                  style={{
                                    padding: '4px 10px',
                                    background: '#3a1a1a',
                                    border: '1px solid #c04040',
                                    color: '#c04040',
                                    cursor: 'pointer',
                                    fontSize: 10,
                                    ...tf,
                                  }}
                                >
                                  Confirm Drop
                                </button>
                                <button
                                  onClick={() => setDropConfirm(null)}
                                  style={{
                                    padding: '4px 10px',
                                    background: 'transparent',
                                    border: `1px solid ${T.border}`,
                                    color: T.textMuted,
                                    cursor: 'pointer',
                                    fontSize: 10,
                                    ...tf,
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setDropConfirm(key)}
                                style={{
                                  padding: '4px 12px',
                                  background: 'transparent',
                                  border: `1px solid ${T.border}`,
                                  color: T.textFaint,
                                  cursor: 'pointer',
                                  fontSize: 10,
                                  ...tf, letterSpacing: 1,
                                }}
                              >
                                Drop
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}
