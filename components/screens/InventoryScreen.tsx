'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { EQUIP_SLOTS, ITEM_INFO, ITEM_STAT_BONUSES, ABILITY_INFO } from '@/lib/constants';
import * as helpers from '@/lib/helpers';
import { HP_PER_LEVEL, getProfessionLevel, getProfessionXp } from '@/lib/helpers';

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

// ── Skill tree data (mirrors SkillTreeScreen) ──
const SKILL_TREES: Record<string, { primaryStat: string; tiers: { id: number; label: string; threshold: number; skills: { id: string; name: string; icon: string; desc: string; cost: number }[] }[] }> = {
  Warrior: { primaryStat: 'str', tiers: [
    { id: 1, label: 'Tier I', threshold: 8, skills: [
      { id: 'iron_skin', name: 'Iron Skin', icon: '🛡️', desc: 'Permanently reduce all incoming damage by 1.', cost: 1 },
      { id: 'power_strike', name: 'Power Strike', icon: '⚔️', desc: 'Chance to deal double damage on a heavy swing.', cost: 1 },
      { id: 'war_shout', name: 'War Shout', icon: '📣', desc: 'Boost STR for 3 turns when combat begins.', cost: 1 },
    ]},
    { id: 2, label: 'Tier II', threshold: 14, skills: [
      { id: 'crushing_blow', name: 'Crushing Blow', icon: '💥', desc: 'Stagger the enemy, skipping their next attack.', cost: 1 },
      { id: 'toughness', name: 'Toughness', icon: '🪨', desc: 'Increase max HP by 20 permanently.', cost: 1 },
      { id: 'battle_rush', name: 'Battle Rush', icon: '⚡', desc: 'First attack each combat deals +50% damage.', cost: 1 },
    ]},
    { id: 3, label: 'Tier III', threshold: 20, skills: [
      { id: 'berserker_rage', name: 'Berserker Rage', icon: '🔥', desc: 'Below 30% HP, deal triple damage. The narrator notices.', cost: 1 },
      { id: 'unbreakable', name: 'Unbreakable', icon: '🏔️', desc: 'Survive one killing blow per dungeon with 1 HP.', cost: 1 },
      { id: 'warlords_presence', name: "Warlord's Presence", icon: '👑', desc: 'Weaker enemies may flee before combat begins.', cost: 1 },
    ]},
  ]},
  Rogue: { primaryStat: 'agi', tiers: [
    { id: 1, label: 'Tier I', threshold: 8, skills: [
      { id: 'shadowstep', name: 'Shadowstep', icon: '👤', desc: 'Vanish and reappear, guaranteeing your next attack crits.', cost: 1 },
      { id: 'pick_pocket', name: 'Pick Pocket', icon: '👜', desc: 'Steal gold from targets without entering combat.', cost: 1 },
      { id: 'knife_throw', name: 'Knife Throw', icon: '🗡️', desc: 'Open combat at range with an AGI-based throw.', cost: 1 },
    ]},
    { id: 2, label: 'Tier II', threshold: 14, skills: [
      { id: 'blade_dance', name: 'Blade Dance', icon: '💃', desc: 'Strike twice per attack turn against single targets.', cost: 1 },
      { id: 'evasion', name: 'Evasion', icon: '🌬️', desc: '+20% chance to dodge incoming attacks.', cost: 1 },
      { id: 'smoke_bomb', name: 'Smoke Bomb', icon: '💨', desc: 'Guaranteed escape from any combat encounter.', cost: 1 },
    ]},
    { id: 3, label: 'Tier III', threshold: 20, skills: [
      { id: 'master_thief', name: 'Master Thief', icon: '🏴', desc: 'Doubles all gold earned from combat and theft.', cost: 1 },
      { id: 'assassinate', name: 'Assassinate', icon: '☠️', desc: 'One-hit-kill chance on weakened targets.', cost: 1 },
      { id: 'ghost_walk', name: 'Ghost Walk', icon: '👻', desc: '25% chance to negate an incoming attack completely.', cost: 1 },
    ]},
  ]},
  Mage: { primaryStat: 'int', tiers: [
    { id: 1, label: 'Tier I', threshold: 8, skills: [
      { id: 'arcane_surge', name: 'Arcane Surge', icon: '🔮', desc: 'Cast one spell for free per combat.', cost: 1 },
      { id: 'mana_shield', name: 'Mana Shield', icon: '💧', desc: 'Absorb up to 15 damage before HP is affected.', cost: 1 },
      { id: 'spell_pierce', name: 'Spell Pierce', icon: '⚡', desc: 'Your spells ignore half of enemy defence.', cost: 1 },
    ]},
    { id: 2, label: 'Tier II', threshold: 14, skills: [
      { id: 'chain_lightning', name: 'Chain Lightning', icon: '🌩️', desc: 'Lightning bounces between up to 3 targets.', cost: 1 },
      { id: 'arcane_mind', name: 'Arcane Mind', icon: '🧠', desc: 'Permanently add INT to your WIL for spell resistance.', cost: 1 },
      { id: 'overcharge', name: 'Overcharge', icon: '💥', desc: 'Sacrifice 10 HP to boost spell damage by 50%.', cost: 1 },
    ]},
    { id: 3, label: 'Tier III', threshold: 20, skills: [
      { id: 'archmages_will', name: "Archmage's Will", icon: '✨', desc: 'All your spells automatically critically hit.', cost: 1 },
      { id: 'time_stop', name: 'Time Stop', icon: '⏳', desc: "Skip the enemy's next three turns. Once per dungeon.", cost: 1 },
      { id: 'lich_form', name: 'Lich Form', icon: '💀', desc: 'Death heals you instead of killing you, once per run.', cost: 1 },
    ]},
  ]},
  Cleric: { primaryStat: 'wil', tiers: [
    { id: 1, label: 'Tier I', threshold: 8, skills: [
      { id: 'healing_light', name: 'Healing Light', icon: '💛', desc: 'Restore 25 HP as a combat action.', cost: 1 },
      { id: 'bless', name: 'Bless', icon: '✝️', desc: "Boost your next attack's damage by WIL×2.", cost: 1 },
      { id: 'ward_undead', name: 'Ward Undead', icon: '🌟', desc: 'Undead enemies deal 30% less damage to you.', cost: 1 },
    ]},
    { id: 2, label: 'Tier II', threshold: 14, skills: [
      { id: 'smite_evil', name: 'Smite Evil', icon: '⚡', desc: 'Deal double damage against undead and demons.', cost: 1 },
      { id: 'group_heal', name: 'Group Heal', icon: '💚', desc: 'Restore HP equal to WIL×3 at start of each floor.', cost: 1 },
      { id: 'divine_aegis', name: 'Divine Aegis', icon: '🛡️', desc: 'Absorb the first attack each combat completely.', cost: 1 },
    ]},
    { id: 3, label: 'Tier III', threshold: 20, skills: [
      { id: 'resurrection_light', name: 'Resurrection Light', icon: '💫', desc: 'Survive death once per dungeon with 50% HP.', cost: 1 },
      { id: 'holy_storm', name: 'Holy Storm', icon: '⛈️', desc: 'Massive WIL-based holy damage hits all enemies present.', cost: 1 },
      { id: 'avatar_divine', name: 'Avatar of Light', icon: '☀️', desc: 'For 3 turns, all attacks heal you for 50% of damage dealt.', cost: 1 },
    ]},
  ]},
};

const PROFESSION_KEYS = ['survival', 'social', 'farming', 'gathering', 'crafting'] as const;
const PROFESSION_META: Record<string, { label: string; icon: string; desc: string }> = {
  survival:  { label: 'Survival',  icon: '🏕️', desc: 'Foraging, camping, and roughing it in the wild.' },
  social:    { label: 'Social',    icon: '🗣️', desc: 'Persuasion, bartering, and gathering information.' },
  farming:   { label: 'Farming',   icon: '🌾', desc: 'Working fields and harvesting crops.' },
  gathering: { label: 'Gathering', icon: '⛏️', desc: 'Mining ore and chopping timber.' },
  crafting:  { label: 'Crafting',  icon: '⚒️', desc: 'Alchemy, cooking, smithing, and enchanting.' },
};

// Attribute descriptions for the Attributes tab
const ATTR_INFO: Record<string, { icon: string; label: string; desc: string; effects: string[] }> = {
  str: { icon: '💪', label: 'Strength', desc: 'Raw physical power.',
    effects: ['Increases melee damage', 'Required for heavy armour and weapons', 'Unlocks Warrior skill tree tiers', 'Intimidates weaker enemies in conversation'] },
  agi: { icon: '🌬️', label: 'Agility', desc: 'Speed, precision, and reflexes.',
    effects: ['Increases dodge chance in combat', 'Improves stealth and pickpocket success', 'Unlocks Rogue skill tree tiers', 'Lets you strike first against slower enemies'] },
  int: { icon: '🔮', label: 'Intelligence', desc: 'Arcane knowledge and mental acuity.',
    effects: ['Increases spell damage and magical ability power', 'Unlocks advanced crafting options', 'Unlocks Mage skill tree tiers', 'Opens unique dialogue options with scholars and mages'] },
  wil: { icon: '🕯️', label: 'Willpower', desc: 'Mental fortitude and spiritual resilience.',
    effects: ['Reduces status effect duration', 'Increases resistance to curses and dark magic', 'Unlocks Cleric skill tree tiers', 'Improves healing received from all sources'] },
};

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
  onUnlock: (skillId: string) => void;
  onSpendStats: (allocations: Record<string, number>) => void;
  onClose: () => void;
}

export function InventoryScreen({ player, onEquip, onUnequip, onUse, onDrop, onUnlock, onSpendStats, onClose }: InventoryScreenProps) {
  const { T, tf, bf } = useTheme();
  const [tab, setTab] = React.useState<'equipped' | 'items' | 'skills' | 'attributes'>('equipped');
  const [dropConfirm, setDropConfirm] = React.useState<string | null>(null);
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
  const [skillSubTab, setSkillSubTab] = React.useState<'tree' | 'abilities' | 'professions'>('tree');
  const [pendingStats, setPendingStats] = React.useState<Record<string, number>>({ str: 0, agi: 0, int: 0, wil: 0 });

  const equipped = player.equipped || {};
  const inventory = player.inventory || [];
  const revealed = player.disguisedItemsRevealed || [];

  const equipBonuses = resolveEquipBonuses(equipped);
  const setBonuses = resolveSetBonuses(equipped);

  // Skills tab data
  const classTree = SKILL_TREES[player.class];
  const unlocked: string[] = (player as any).unlockedSkills || [];
  const skillPoints: number = (player as any).skillPoints || 0;
  const primaryStat = classTree?.primaryStat || 'str';
  const statValue: number = (player as any)[primaryStat] || 0;

  const TABS = [
    { id: 'equipped' as const, label: 'Equipped' },
    { id: 'items' as const, label: `Pack (${inventory.length})` },
    { id: 'skills' as const, label: 'Skills' },
    { id: 'attributes' as const, label: 'Attributes' },
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
              {t.id === 'skills' && (player.skillPoints ?? 0) > 0 && (
                <span style={{ marginLeft: 4, color: '#f0c060', fontSize: 8, animation: 'pulse 1s infinite' }}>✦ {player.skillPoints}</span>
              )}
              {t.id === 'attributes' && (player.statPoints ?? 0) > 0 && (
                <span style={{ marginLeft: 4, color: '#f0c060', fontSize: 8, animation: 'pulse 1s infinite' }}>●</span>
              )}
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
          {/* ── SKILLS TAB ── */}
          {tab === 'skills' && (
            <div>
              {/* Sub-tab bar */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
                {(['tree', 'abilities', 'professions'] as const).map((st) => (
                  <button key={st} onClick={() => setSkillSubTab(st)}
                    style={{ flex: 1, background: skillSubTab === st ? T.selectedBg : 'transparent', border: 'none',
                      borderBottom: `2px solid ${skillSubTab === st ? T.accent : 'transparent'}`,
                      color: skillSubTab === st ? T.gold : T.textMuted, padding: '8px 4px',
                      cursor: 'pointer', fontSize: 10, ...tf, letterSpacing: 1 }}>
                    {st === 'tree' ? 'Skill Tree' : st === 'abilities' ? 'Abilities' : 'Professions'}
                  </button>
                ))}
              </div>

              {/* Skill points banner */}
              {skillSubTab === 'tree' && skillPoints > 0 && (
                <div style={{ background: '#1a2a1a', borderBottom: `1px solid #60a06044`, padding: '6px 16px',
                  fontSize: 11, color: '#60a060', ...tf, letterSpacing: 1 }}>
                  ⬆ {skillPoints} skill point{skillPoints !== 1 ? 's' : ''} available
                </div>
              )}

              {/* Skill Tree */}
              {skillSubTab === 'tree' && (
                <div style={{ padding: 16 }}>
                  {!classTree ? (
                    <div style={{ padding: 40, textAlign: 'center' as const, color: T.textFaint, fontStyle: 'italic' }}>
                      No skill tree defined for {player.class}.
                    </div>
                  ) : classTree.tiers.map((tier, ti) => {
                    const prevUnlocked = ti === 0 || classTree.tiers[ti - 1].skills.some((s) => unlocked.includes(s.id));
                    const accessible = statValue >= tier.threshold && prevUnlocked;
                    return (
                      <div key={tier.id} style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                          paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>
                          <span style={{ ...tf, color: accessible ? T.accent : T.textFaint, fontSize: 11, letterSpacing: 2 }}>
                            {tier.label.toUpperCase()}
                          </span>
                          {!accessible && (
                            <span style={{ fontSize: 10, color: T.textFaint }}>
                              — requires {primaryStat.toUpperCase()} {tier.threshold}{ti > 0 ? ' + unlock from previous tier' : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          {tier.skills.map((skill) => {
                            const isUnlocked = unlocked.includes(skill.id);
                            const canUnlock = accessible && skillPoints >= skill.cost && !isUnlocked;
                            return (
                              <div key={skill.id} style={{ background: isUnlocked ? '#1a2a1a' : T.panelAlt,
                                border: `1px solid ${isUnlocked ? '#60a060' : accessible ? T.border : T.border + '55'}`,
                                padding: 10, opacity: accessible ? 1 : 0.5 }}>
                                <div style={{ fontSize: 22, marginBottom: 4 }}>{skill.icon}</div>
                                <div style={{ ...tf, fontSize: 11, color: isUnlocked ? '#60a060' : T.text, marginBottom: 4 }}>{skill.name}</div>
                                <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4, marginBottom: 8 }}>{skill.desc}</div>
                                {isUnlocked ? (
                                  <div style={{ fontSize: 10, color: '#60a060', ...tf, letterSpacing: 1 }}>UNLOCKED</div>
                                ) : (
                                  <button onClick={() => { if (canUnlock) onUnlock(skill.id); }} disabled={!canUnlock}
                                    style={{ width: '100%', padding: '4px 0', background: canUnlock ? T.accent : 'transparent',
                                      border: `1px solid ${canUnlock ? T.accent : T.border}`,
                                      color: canUnlock ? '#fff' : T.textFaint, cursor: canUnlock ? 'pointer' : 'default',
                                      fontSize: 10, ...tf, letterSpacing: 1 }}>
                                    {skill.cost} pt
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Abilities */}
              {skillSubTab === 'abilities' && (
                <div>
                  {(player.abilities || []).length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center' as const, color: T.textFaint, fontStyle: 'italic' }}>
                      No abilities learned yet.
                    </div>
                  ) : (player.abilities || []).map((abilityName) => {
                    const info = (ABILITY_INFO as Record<string, { icon: string; type: string; desc: string }>)[abilityName];
                    return (
                      <div key={abilityName} style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <span style={{ fontSize: 26, lineHeight: '1', flexShrink: 0 }}>{info?.icon || '✨'}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ ...tf, color: T.text, fontSize: 13 }}>{abilityName}</span>
                              {info?.type && (
                                <span style={{ fontSize: 9, ...tf, color: T.textMuted, border: `1px solid ${T.border}`, padding: '1px 5px', letterSpacing: 1 }}>
                                  {info.type.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{info?.desc || 'A learned ability.'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Professions */}
              {skillSubTab === 'professions' && (
                <div style={{ padding: '8px 16px 16px' }}>
                  {PROFESSION_KEYS.map((key) => {
                    const lvl = getProfessionLevel((player as any).professions || {}, key);
                    const xp = getProfessionXp((player as any).professions || {}, key);
                    const threshold = lvl * 60;
                    const pct = threshold > 0 ? Math.min(100, Math.round((xp / threshold) * 100)) : 100;
                    const meta = PROFESSION_META[key];
                    return (
                      <div key={key} style={{ padding: '14px 0', borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 20 }}>{meta.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ ...tf, color: T.text, fontSize: 13 }}>{meta.label}</span>
                              <span style={{ fontSize: 10, ...tf, color: lvl >= 5 ? T.gold : T.accent,
                                border: `1px solid ${lvl >= 5 ? T.gold : T.accent}`, padding: '1px 6px', letterSpacing: 1 }}>
                                LV.{lvl}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{meta.desc}</div>
                          </div>
                        </div>
                        {lvl < 5 ? (
                          <>
                            <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: T.accent, borderRadius: 2, transition: 'width 0.3s' }} />
                            </div>
                            <div style={{ fontSize: 10, color: T.textFaint, textAlign: 'right' as const }}>{xp} / {threshold} XP to next level</div>
                          </>
                        ) : (
                          <div style={{ fontSize: 11, color: T.gold, ...tf, letterSpacing: 1 }}>MAX LEVEL</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ATTRIBUTES TAB ── */}
          {tab === 'attributes' && (() => {
            const availablePoints = (player.statPoints ?? 0);
            const pendingTotal = Object.values(pendingStats).reduce((a, b) => a + b, 0);
            const remaining = availablePoints - pendingTotal;
            return (
            <div style={{ padding: 16 }}>
              {/* Unspent points banner */}
              {availablePoints > 0 && (
                <div style={{ marginBottom: 12, padding: '8px 12px', background: '#1a2a1a', border: '1px solid #60a06066',
                  fontSize: 11, color: '#60a060', ...tf, letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>⬆ {remaining} point{remaining !== 1 ? 's' : ''} remaining to spend</span>
                  {pendingTotal > 0 && (
                    <button
                      onClick={() => {
                        onSpendStats(pendingStats);
                        setPendingStats({ str: 0, agi: 0, int: 0, wil: 0 });
                      }}
                      style={{ background: '#60a060', border: 'none', color: '#0d0d1a', padding: '4px 14px',
                        ...tf, fontSize: 10, letterSpacing: 1, cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      CONFIRM
                    </button>
                  )}
                </div>
              )}

              {/* Stat cards */}
              {(['str', 'agi', 'int', 'wil'] as const).map((key) => {
                const info = ATTR_INFO[key];
                const base: number = (player as any)[key] ?? 0;
                const pending = pendingStats[key] ?? 0;
                const displayed = base + pending;
                return (
                  <div key={key} style={{ background: T.panelAlt, border: `1px solid ${pending > 0 ? '#60a06066' : T.border}`,
                    padding: '12px 14px', marginBottom: 10, transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 22 }}>{info.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ ...tf, color: T.gold, fontSize: 14, letterSpacing: 1 }}>{key.toUpperCase()}</span>
                          <span style={{ color: T.text, fontSize: 13 }}>{info.label}</span>
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{info.desc}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {availablePoints > 0 && (
                          <button
                            onClick={() => pending > 0 && setPendingStats((p) => ({ ...p, [key]: p[key] - 1 }))}
                            disabled={pending === 0}
                            style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted,
                              width: 22, height: 22, cursor: pending > 0 ? 'pointer' : 'default',
                              fontSize: 14, lineHeight: '1', opacity: pending > 0 ? 1 : 0.3,
                              display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >−</button>
                        )}
                        <div style={{ ...tf, color: pending > 0 ? '#60a060' : T.gold, fontSize: 22, minWidth: 32, textAlign: 'center' as const }}>
                          {displayed}{pending > 0 && <span style={{ fontSize: 11, color: '#60a060' }}> (+{pending})</span>}
                        </div>
                        {availablePoints > 0 && (
                          <button
                            onClick={() => remaining > 0 && setPendingStats((p) => ({ ...p, [key]: p[key] + 1 }))}
                            disabled={remaining === 0}
                            style={{ background: remaining > 0 ? '#1a3a1a' : 'transparent',
                              border: `1px solid ${remaining > 0 ? '#60a060' : T.border}`,
                              color: remaining > 0 ? '#60a060' : T.textMuted,
                              width: 22, height: 22, cursor: remaining > 0 ? 'pointer' : 'default',
                              fontSize: 14, lineHeight: '1', opacity: remaining > 0 ? 1 : 0.3,
                              display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >+</button>
                        )}
                      </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                      {info.effects.map((effect, i) => (
                        <div key={i} style={{ fontSize: 11, color: T.textMuted, marginBottom: 3, display: 'flex', gap: 6 }}>
                          <span style={{ color: T.accent, flexShrink: 0 }}>›</span>
                          <span>{effect}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Level-up rewards */}
              <div style={{ background: T.panelAlt, border: `1px solid ${T.border}`, padding: '12px 14px', marginTop: 6 }}>
                <div style={{ ...tf, color: T.accent, fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>LEVEL UP REWARDS</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6, display: 'flex', gap: 6 }}>
                  <span style={{ color: T.accent }}>›</span>
                  <span>+3 Stat Points to spend on STR / AGI / INT / WIL</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6, display: 'flex', gap: 6 }}>
                  <span style={{ color: T.accent }}>›</span>
                  <span>+1 Skill Point to unlock a class skill</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, display: 'flex', gap: 6 }}>
                  <span style={{ color: T.accent }}>›</span>
                  <span>+{HP_PER_LEVEL[player.class] ?? 5} Max HP <span style={{ color: T.textFaint }}>({player.class} class bonus)</span></span>
                </div>
              </div>
            </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
