'use client';

import React from 'react';
import { CLASSES } from '@/lib/constants';

// ── Local SKILL_TREES definition (not yet in constants.ts) ──

interface SkillDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

interface SkillTierDef {
  id: number;
  label: string;
  threshold: number;
  skills: SkillDef[];
}

interface ClassSkillTree {
  primaryStat: string;
  tiers: SkillTierDef[];
}

const SKILL_TREES: Record<string, ClassSkillTree> = {
  Warrior: {
    primaryStat: 'str',
    tiers: [
      {
        id: 1,
        label: 'Tier I',
        threshold: 8,
        skills: [
          { id: 'iron_skin', name: 'Iron Skin', icon: '🛡️', desc: 'Permanently reduce all incoming damage by 1.' },
          { id: 'power_strike', name: 'Power Strike', icon: '⚔️', desc: 'Chance to deal double damage on a heavy swing.' },
          { id: 'war_shout', name: 'War Shout', icon: '📣', desc: 'Boost STR for 3 turns when combat begins.' },
        ],
      },
      {
        id: 2,
        label: 'Tier II',
        threshold: 14,
        skills: [
          { id: 'crushing_blow', name: 'Crushing Blow', icon: '💥', desc: 'Stagger the enemy, skipping their next attack.' },
          { id: 'toughness', name: 'Toughness', icon: '🪨', desc: 'Increase max HP by 20 permanently.' },
          { id: 'battle_rush', name: 'Battle Rush', icon: '⚡', desc: 'First attack each combat deals +50% damage.' },
        ],
      },
      {
        id: 3,
        label: 'Tier III',
        threshold: 20,
        skills: [
          { id: 'berserker_rage', name: 'Berserker Rage', icon: '🔥', desc: 'Below 30% HP, deal triple damage. The narrator notices.' },
          { id: 'last_stand', name: 'Last Stand', icon: '🏔️', desc: 'Survive one killing blow per dungeon with 1 HP.' },
          { id: 'warlords_presence', name: "Warlord's Presence", icon: '👑', desc: 'Weaker enemies may flee before combat begins.' },
        ],
      },
    ],
  },
  Rogue: {
    primaryStat: 'agi',
    tiers: [
      {
        id: 1,
        label: 'Tier I',
        threshold: 8,
        skills: [
          { id: 'shadowstep', name: 'Shadowstep', icon: '👤', desc: 'Vanish and reappear, guaranteeing your next attack crits.' },
          { id: 'pick_pocket', name: 'Pick Pocket', icon: '👜', desc: 'Steal gold from targets without entering combat.' },
          { id: 'knife_throw', name: 'Knife Throw', icon: '🗡️', desc: 'Open combat at range with an AGI-based throw.' },
        ],
      },
      {
        id: 2,
        label: 'Tier II',
        threshold: 14,
        skills: [
          { id: 'blade_dance', name: 'Blade Dance', icon: '💃', desc: 'Strike twice per attack turn against single targets.' },
          { id: 'evasion', name: 'Evasion', icon: '🌬️', desc: '+20% chance to dodge incoming attacks.' },
          { id: 'smoke_bomb', name: 'Smoke Bomb', icon: '💨', desc: 'Guaranteed escape from any combat encounter.' },
        ],
      },
      {
        id: 3,
        label: 'Tier III',
        threshold: 20,
        skills: [
          { id: 'master_thief', name: 'Master Thief', icon: '🏴', desc: 'Doubles all gold earned from combat and theft.' },
          { id: 'assassinate', name: 'Assassinate', icon: '☠️', desc: 'One-hit-kill chance on weakened targets.' },
          { id: 'phantom', name: 'Phantom', icon: '👻', desc: 'You leave no trace. Even bosses struggle to track you.' },
        ],
      },
    ],
  },
  Mage: {
    primaryStat: 'int',
    tiers: [
      {
        id: 1,
        label: 'Tier I',
        threshold: 8,
        skills: [
          { id: 'arcane_surge', name: 'Arcane Surge', icon: '🔮', desc: 'Cast one spell for free per combat.' },
          { id: 'mana_shield', name: 'Mana Shield', icon: '💧', desc: 'Absorb up to 15 damage before HP is affected.' },
          { id: 'spell_pierce', name: 'Spell Pierce', icon: '⚡', desc: 'Your spells ignore half of enemy defence.' },
        ],
      },
      {
        id: 2,
        label: 'Tier II',
        threshold: 14,
        skills: [
          { id: 'chain_lightning', name: 'Chain Lightning', icon: '🌩️', desc: 'Lightning bounces between up to 3 targets.' },
          { id: 'arcane_mind', name: 'Arcane Mind', icon: '🧠', desc: 'Permanently add INT to your WIL for spell resistance.' },
          { id: 'overcharge', name: 'Overcharge', icon: '💥', desc: 'Sacrifice 10 HP to boost spell damage by 50%.' },
        ],
      },
      {
        id: 3,
        label: 'Tier III',
        threshold: 20,
        skills: [
          { id: 'archmages_will', name: "Archmage's Will", icon: '✨', desc: 'All your spells automatically critically hit. The narrator notices.' },
          { id: 'time_stop', name: 'Time Stop', icon: '⏳', desc: "Skip the enemy's next three turns. Once per dungeon." },
          { id: 'lich_form', name: 'Lich Form', icon: '💀', desc: 'Death heals you instead of killing you, once per run.' },
        ],
      },
    ],
  },
  Cleric: {
    primaryStat: 'wil',
    tiers: [
      {
        id: 1,
        label: 'Tier I',
        threshold: 8,
        skills: [
          { id: 'healing_light', name: 'Healing Light', icon: '💛', desc: 'Restore 25 HP as a combat action.' },
          { id: 'bless', name: 'Bless', icon: '✝️', desc: "Boost your next attack's damage by WIL×2." },
          { id: 'ward_undead', name: 'Ward Undead', icon: '🌟', desc: 'Undead enemies deal 30% less damage to you.' },
        ],
      },
      {
        id: 2,
        label: 'Tier II',
        threshold: 14,
        skills: [
          { id: 'smite_evil', name: 'Smite Evil', icon: '⚡', desc: 'Deal double damage against undead and demons.' },
          { id: 'group_heal', name: 'Group Heal', icon: '💚', desc: 'Restore HP equal to WIL×3 at start of each floor.' },
          { id: 'divine_aegis', name: 'Divine Aegis', icon: '🛡️', desc: 'Absorb the first attack each combat completely.' },
        ],
      },
      {
        id: 3,
        label: 'Tier III',
        threshold: 20,
        skills: [
          { id: 'resurrection_light', name: 'Resurrection Light', icon: '💫', desc: 'Survive death once per dungeon with 50% HP. The narrator notices.' },
          { id: 'holy_storm', name: 'Holy Storm', icon: '⛈️', desc: 'Massive WIL-based holy damage hits all enemies present.' },
          { id: 'avatar', name: 'Avatar of Light', icon: '☀️', desc: 'For 3 turns, all attacks heal you for 50% of damage dealt.' },
        ],
      },
    ],
  },
};

// ── Helpers ──

const CLASS_PRIMARY_STAT: Record<string, string> = {
  Warrior: 'STR',
  Rogue: 'AGI',
  Mage: 'INT',
  Cleric: 'WIL',
};

const CLASS_PASSIVE_NOTE: Record<string, string> = {
  Warrior: 'High HP and STR make you a natural frontliner. Level STR to unlock higher skill tiers.',
  Rogue: 'Speed and cunning over brute force. Level AGI to become untouchable.',
  Mage: 'Low survivability, devastating offense. Level INT to unlock the full arcane repertoire.',
  Cleric: 'The most versatile class — heals, buffs, and holy damage all in one. Level WIL to reach divine power.',
};

const STAT_COLORS: Record<string, string> = {
  STR: '#c03030',
  AGI: '#309060',
  INT: '#6030c0',
  WIL: '#3090c0',
  HP: '#b04020',
};

// ── Hardcoded dark fantasy styles (no useTheme per design rule) ──

const DS = {
  bg: '#0d0a06',
  panel: '#13100a',
  panelAlt: '#0a0805',
  border: '#2e2010',
  text: '#d4b896',
  textMuted: '#9a7a55',
  textFaint: '#6a523c',
  gold: '#f0c060',
  accent: '#c4873a',
};

const tf = { fontFamily: "'Cinzel','Palatino Linotype',serif" } as const;
const bf = { fontFamily: "'Crimson Text',Georgia,serif" } as const;

// ────────────────────────────────────────────────────────────

interface ClassInfoModalProps {
  cls: string;
  onClose: () => void;
}

export function ClassInfoModal({ cls, onClose }: ClassInfoModalProps) {
  const classData = (CLASSES as any)[cls];
  const tree = SKILL_TREES[cls];
  const primaryStat = CLASS_PRIMARY_STAT[cls] || 'STR';
  const passiveNote = CLASS_PASSIVE_NOTE[cls] || '';

  if (!classData) {
    return null;
  }

  const stats = [
    { key: 'STR', val: classData.str },
    { key: 'AGI', val: classData.agi },
    { key: 'INT', val: classData.int },
    { key: 'WIL', val: classData.wil },
    { key: 'HP', val: classData.hp },
  ];

  return (
    <div
      style={{
        ...bf,
        position: 'fixed',
        inset: 0,
        background: DS.bg + 'ee',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        color: DS.text,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: DS.panel,
          border: `1px solid ${DS.accent}`,
          width: '100%',
          maxWidth: 580,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: DS.panelAlt,
            borderBottom: `1px solid ${DS.border}`,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 32 }}>{classData.icon}</span>
            <div>
              <div style={{ ...tf, color: DS.gold, fontSize: 18, letterSpacing: 2 }}>
                {cls.toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: DS.textMuted, marginTop: 2 }}>
                Primary: {primaryStat} · Starting Ability: {classData.ability}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${DS.border}`,
              color: DS.textMuted,
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* Description */}
          <div style={{ fontSize: 14, color: DS.text, lineHeight: 1.65, marginBottom: 6 }}>
            {classData.desc}
          </div>
          {passiveNote && (
            <div
              style={{
                fontSize: 12,
                color: DS.textMuted,
                fontStyle: 'italic',
                marginBottom: 20,
              }}
            >
              {passiveNote}
            </div>
          )}

          {/* Stat badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {stats.map((s) => (
              <div
                key={s.key}
                style={{
                  background: STAT_COLORS[s.key] + '22',
                  border: `1px solid ${STAT_COLORS[s.key]}66`,
                  padding: '6px 14px',
                  textAlign: 'center',
                  minWidth: 60,
                }}
              >
                <div
                  style={{
                    ...tf,
                    color: STAT_COLORS[s.key],
                    fontSize: 10,
                    letterSpacing: 2,
                    marginBottom: 2,
                  }}
                >
                  {s.key}
                </div>
                <div style={{ color: DS.text, fontSize: 16, fontWeight: 600 }}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>

          {/* Skill tree tier overview */}
          {tree && (
            <>
              <div
                style={{
                  ...tf,
                  color: DS.accent,
                  fontSize: 10,
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                SKILL TREE OVERVIEW
              </div>
              {tree.tiers.map((tier) => {
                const tierLabel =
                  tier.id === 1 ? 'PRIMARY' : tier.id === 2 ? 'ADVANCED' : 'MASTERY';
                return (
                  <div key={tier.id} style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        ...tf,
                        color: DS.textMuted,
                        fontSize: 10,
                        letterSpacing: 2,
                        marginBottom: 8,
                        paddingBottom: 4,
                        borderBottom: `1px solid ${DS.border}`,
                      }}
                    >
                      {tier.label.toUpperCase()} — {tierLabel}
                      <span style={{ color: DS.textFaint, marginLeft: 8 }}>
                        (requires {primaryStat} {tier.threshold})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {tier.skills.map((skill) => (
                        <div
                          key={skill.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            padding: '8px 10px',
                            background: DS.panelAlt,
                            border: `1px solid ${DS.border}`,
                          }}
                        >
                          <span style={{ fontSize: 18, flexShrink: 0 }}>{skill.icon}</span>
                          <div>
                            <div
                              style={{
                                ...tf,
                                color: DS.text,
                                fontSize: 12,
                                marginBottom: 2,
                              }}
                            >
                              {skill.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: DS.textMuted,
                                lineHeight: 1.4,
                              }}
                            >
                              {skill.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: `1px solid ${DS.border}`,
            background: DS.panelAlt,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: DS.accent + '22',
              border: `1px solid ${DS.accent}`,
              color: DS.gold,
              padding: '11px',
              fontSize: 13,
              ...tf,
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
