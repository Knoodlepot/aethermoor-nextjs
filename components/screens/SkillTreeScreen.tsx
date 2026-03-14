'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { ABILITY_INFO } from '@/lib/constants';
import { getProfessionLevel, getProfessionXp } from '@/lib/helpers';

// ── Local SKILL_TREES definition (not yet in constants.ts) ──
interface SkillDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost: number;
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
        id: 1, label: 'Tier I', threshold: 8,
        skills: [
          { id: 'iron_skin', name: 'Iron Skin', icon: '🛡️', desc: 'Permanently reduce all incoming damage by 1.', cost: 1 },
          { id: 'power_strike', name: 'Power Strike', icon: '⚔️', desc: 'Chance to deal double damage on a heavy swing.', cost: 1 },
          { id: 'war_shout', name: 'War Shout', icon: '📣', desc: 'Boost STR for 3 turns when combat begins.', cost: 1 },
        ],
      },
      {
        id: 2, label: 'Tier II', threshold: 14,
        skills: [
          { id: 'crushing_blow', name: 'Crushing Blow', icon: '💥', desc: 'Stagger the enemy, skipping their next attack.', cost: 1 },
          { id: 'toughness', name: 'Toughness', icon: '🪨', desc: 'Increase max HP by 20 permanently.', cost: 1 },
          { id: 'battle_rush', name: 'Battle Rush', icon: '⚡', desc: 'First attack each combat deals +50% damage.', cost: 1 },
        ],
      },
      {
        id: 3, label: 'Tier III', threshold: 20,
        skills: [
          { id: 'berserker_rage', name: 'Berserker Rage', icon: '🔥', desc: 'Below 30% HP, deal triple damage. The narrator notices.', cost: 1 },
          { id: 'unbreakable', name: 'Unbreakable', icon: '🏔️', desc: 'Survive one killing blow per dungeon with 1 HP. The narrator notices.', cost: 1 },
          { id: 'warlords_presence', name: "Warlord's Presence", icon: '👑', desc: 'Weaker enemies may flee before combat begins. The narrator notices.', cost: 1 },
        ],
      },
    ],
  },
  Rogue: {
    primaryStat: 'agi',
    tiers: [
      {
        id: 1, label: 'Tier I', threshold: 8,
        skills: [
          { id: 'shadowstep', name: 'Shadowstep', icon: '👤', desc: 'Vanish and reappear, guaranteeing your next attack crits.', cost: 1 },
          { id: 'pick_pocket', name: 'Pick Pocket', icon: '👜', desc: 'Steal gold from targets without entering combat.', cost: 1 },
          { id: 'knife_throw', name: 'Knife Throw', icon: '🗡️', desc: 'Open combat at range with an AGI-based throw.', cost: 1 },
        ],
      },
      {
        id: 2, label: 'Tier II', threshold: 14,
        skills: [
          { id: 'blade_dance', name: 'Blade Dance', icon: '💃', desc: 'Strike twice per attack turn against single targets.', cost: 1 },
          { id: 'evasion', name: 'Evasion', icon: '🌬️', desc: '+20% chance to dodge incoming attacks.', cost: 1 },
          { id: 'smoke_bomb', name: 'Smoke Bomb', icon: '💨', desc: 'Guaranteed escape from any combat encounter.', cost: 1 },
        ],
      },
      {
        id: 3, label: 'Tier III', threshold: 20,
        skills: [
          { id: 'master_thief', name: 'Master Thief', icon: '🏴', desc: 'Doubles all gold earned from combat and theft. The narrator notices.', cost: 1 },
          { id: 'assassinate', name: 'Assassinate', icon: '☠️', desc: 'One-hit-kill chance on weakened targets.', cost: 1 },
          { id: 'ghost_walk', name: 'Ghost Walk', icon: '👻', desc: '25% chance to negate an incoming attack completely. The narrator notices.', cost: 1 },
        ],
      },
    ],
  },
  Mage: {
    primaryStat: 'int',
    tiers: [
      {
        id: 1, label: 'Tier I', threshold: 8,
        skills: [
          { id: 'arcane_surge', name: 'Arcane Surge', icon: '🔮', desc: 'Cast one spell for free per combat.', cost: 1 },
          { id: 'mana_shield', name: 'Mana Shield', icon: '💧', desc: 'Absorb up to 15 damage before HP is affected.', cost: 1 },
          { id: 'spell_pierce', name: 'Spell Pierce', icon: '⚡', desc: 'Your spells ignore half of enemy defence.', cost: 1 },
        ],
      },
      {
        id: 2, label: 'Tier II', threshold: 14,
        skills: [
          { id: 'chain_lightning', name: 'Chain Lightning', icon: '🌩️', desc: 'Lightning bounces between up to 3 targets.', cost: 1 },
          { id: 'arcane_mind', name: 'Arcane Mind', icon: '🧠', desc: 'Permanently add INT to your WIL for spell resistance.', cost: 1 },
          { id: 'overcharge', name: 'Overcharge', icon: '💥', desc: 'Sacrifice 10 HP to boost spell damage by 50%.', cost: 1 },
        ],
      },
      {
        id: 3, label: 'Tier III', threshold: 20,
        skills: [
          { id: 'archmages_will', name: "Archmage's Will", icon: '✨', desc: 'All your spells automatically critically hit. The narrator notices.', cost: 1 },
          { id: 'time_stop', name: 'Time Stop', icon: '⏳', desc: "Skip the enemy's next three turns. Once per dungeon.", cost: 1 },
          { id: 'lich_form', name: 'Lich Form', icon: '💀', desc: 'Death heals you instead of killing you, once per run.', cost: 1 },
        ],
      },
    ],
  },
  Cleric: {
    primaryStat: 'wil',
    tiers: [
      {
        id: 1, label: 'Tier I', threshold: 8,
        skills: [
          { id: 'healing_light', name: 'Healing Light', icon: '💛', desc: 'Restore 25 HP as a combat action.', cost: 1 },
          { id: 'bless', name: 'Bless', icon: '✝️', desc: "Boost your next attack's damage by WIL×2.", cost: 1 },
          { id: 'ward_undead', name: 'Ward Undead', icon: '🌟', desc: 'Undead enemies deal 30% less damage to you.', cost: 1 },
        ],
      },
      {
        id: 2, label: 'Tier II', threshold: 14,
        skills: [
          { id: 'smite_evil', name: 'Smite Evil', icon: '⚡', desc: 'Deal double damage against undead and demons.', cost: 1 },
          { id: 'group_heal', name: 'Group Heal', icon: '💚', desc: 'Restore HP equal to WIL×3 at start of each floor.', cost: 1 },
          { id: 'divine_aegis', name: 'Divine Aegis', icon: '🛡️', desc: 'Absorb the first attack each combat completely.', cost: 1 },
        ],
      },
      {
        id: 3, label: 'Tier III', threshold: 20,
        skills: [
          { id: 'resurrection_light', name: 'Resurrection Light', icon: '💫', desc: 'Survive death once per dungeon with 50% HP. The narrator notices.', cost: 1 },
          { id: 'holy_storm', name: 'Holy Storm', icon: '⛈️', desc: 'Massive WIL-based holy damage hits all enemies present.', cost: 1 },
          { id: 'avatar_divine', name: 'Avatar of Light', icon: '☀️', desc: 'For 3 turns, all attacks heal you for 50% of damage dealt. The narrator notices.', cost: 1 },
        ],
      },
    ],
  },
};

const PROFESSION_KEYS = ['survival', 'social', 'farming', 'gathering', 'crafting'] as const;
const PROFESSION_META: Record<string, { label: string; icon: string; desc: string }> = {
  survival:  { label: 'Survival',  icon: '🏕️', desc: 'Foraging, camping, and roughing it in the wild.' },
  social:    { label: 'Social',    icon: '🗣️', desc: 'Persuasion, bartering, and gathering information.' },
  farming:   { label: 'Farming',   icon: '🌾', desc: 'Working fields and harvesting crops.' },
  gathering: { label: 'Gathering', icon: '⛏️', desc: 'Mining ore and chopping timber.' },
  crafting:  { label: 'Crafting',  icon: '⚒️', desc: 'Alchemy, cooking, smithing, and enchanting.' },
};

interface SkillTreeScreenProps {
  player: Player;
  onUnlock: (skillId: string) => void;
  onClose: () => void;
}

export function SkillTreeScreen({ player, onUnlock, onClose }: SkillTreeScreenProps) {
  const { T, tf, bf } = useTheme();
  const [tab, setTab] = React.useState<'skills' | 'abilities' | 'professions'>('skills');

  const classTree = SKILL_TREES[player.class];
  const unlocked: string[] = (player as any).unlockedSkills || [];
  const skillPoints: number = (player as any).skillPoints || 0;
  const primaryStat = classTree?.primaryStat || 'str';
  const statValue: number = (player as any)[primaryStat] || 0;

  const TABS = [
    { id: 'skills' as const, label: 'Skill Tree' },
    { id: 'abilities' as const, label: 'Abilities' },
    { id: 'professions' as const, label: 'Professions' },
  ];

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
          maxWidth: 640,
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
              ✨ SKILLS
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {player.class} · {skillPoints} skill point{skillPoints !== 1 ? 's' : ''} available
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

          {/* ── SKILL TREE TAB ── */}
          {tab === 'skills' && (
            <div style={{ padding: 16 }}>
              {!classTree ? (
                <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic' }}>
                  No skill tree defined for {player.class}.
                </div>
              ) : (
                classTree.tiers.map((tier, ti) => {
                  const prevTierHasUnlock = ti === 0 || classTree.tiers[ti - 1].skills.some((s) => unlocked.includes(s.id));
                  const tierAccessible = statValue >= tier.threshold && prevTierHasUnlock;
                  return (
                    <div key={tier.id} style={{ marginBottom: 24 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 10,
                          paddingBottom: 6,
                          borderBottom: `1px solid ${T.border}`,
                        }}
                      >
                        <span style={{ ...tf, color: tierAccessible ? T.accent : T.textFaint, fontSize: 11, letterSpacing: 2 }}>
                          {tier.label.toUpperCase()}
                        </span>
                        {!tierAccessible && (
                          <span style={{ fontSize: 10, color: T.textFaint }}>
                            — requires {primaryStat.toUpperCase()} {tier.threshold}
                            {ti > 0 ? ' + unlock from previous tier' : ''}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {tier.skills.map((skill) => {
                          const isUnlocked = unlocked.includes(skill.id);
                          const canUnlock = tierAccessible && skillPoints >= skill.cost && !isUnlocked;
                          return (
                            <div
                              key={skill.id}
                              style={{
                                background: isUnlocked ? '#1a2a1a' : T.panelAlt,
                                border: `1px solid ${isUnlocked ? '#60a060' : tierAccessible ? T.border : T.border + '55'}`,
                                padding: 10,
                                opacity: tierAccessible ? 1 : 0.5,
                              }}
                            >
                              <div style={{ fontSize: 22, marginBottom: 4 }}>{skill.icon}</div>
                              <div style={{ ...tf, fontSize: 11, color: isUnlocked ? '#60a060' : T.text, marginBottom: 4 }}>
                                {skill.name}
                              </div>
                              <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4, marginBottom: 8 }}>
                                {skill.desc}
                              </div>
                              {isUnlocked ? (
                                <div style={{ fontSize: 10, color: '#60a060', ...tf, letterSpacing: 1 }}>UNLOCKED</div>
                              ) : (
                                <button
                                  onClick={() => { if (canUnlock) onUnlock(skill.id); }}
                                  disabled={!canUnlock}
                                  style={{
                                    width: '100%',
                                    padding: '4px 0',
                                    background: canUnlock ? T.accent : 'transparent',
                                    border: `1px solid ${canUnlock ? T.accent : T.border}`,
                                    color: canUnlock ? '#fff' : T.textFaint,
                                    cursor: canUnlock ? 'pointer' : 'default',
                                    fontSize: 10,
                                    ...tf,
                                    letterSpacing: 1,
                                  }}
                                >
                                  {skill.cost} pt
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── ABILITIES TAB ── */}
          {tab === 'abilities' && (
            <div>
              {(player.abilities || []).length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic' }}>
                  No abilities learned yet.
                </div>
              ) : (
                (player.abilities || []).map((abilityName) => {
                  const info = (ABILITY_INFO as Record<string, { icon: string; type: string; desc: string }>)[abilityName];
                  return (
                    <div
                      key={abilityName}
                      style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <span style={{ fontSize: 26, lineHeight: '1', flexShrink: 0 }}>{info?.icon || '✨'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ ...tf, color: T.text, fontSize: 13 }}>{abilityName}</span>
                            {info?.type && (
                              <span
                                style={{
                                  fontSize: 9,
                                  ...tf,
                                  color: T.textMuted,
                                  border: `1px solid ${T.border}`,
                                  padding: '1px 5px',
                                  letterSpacing: 1,
                                }}
                              >
                                {info.type.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
                            {info?.desc || 'A learned ability.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── PROFESSIONS TAB ── */}
          {tab === 'professions' && (
            <div style={{ padding: '8px 16px 16px' }}>
              {PROFESSION_KEYS.map((key) => {
                const lvl = getProfessionLevel(player.professions || {}, key);
                const xp = getProfessionXp(player.professions || {}, key);
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
                          <span
                            style={{
                              fontSize: 10,
                              ...tf,
                              color: lvl >= 5 ? T.gold : T.accent,
                              border: `1px solid ${lvl >= 5 ? T.gold : T.accent}`,
                              padding: '1px 6px',
                              letterSpacing: 1,
                            }}
                          >
                            LV.{lvl}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{meta.desc}</div>
                      </div>
                    </div>
                    {lvl < 5 ? (
                      <>
                        <div
                          style={{
                            height: 4,
                            background: T.border,
                            borderRadius: 2,
                            overflow: 'hidden',
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: T.accent,
                              borderRadius: 2,
                              transition: 'width 0.3s',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 10, color: T.textFaint, textAlign: 'right' }}>
                          {xp} / {threshold} XP to next level
                        </div>
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
      </div>
    </div>
  );
}
