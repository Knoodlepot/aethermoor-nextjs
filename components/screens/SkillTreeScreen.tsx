'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { ABILITY_INFO } from '@/lib/constants';
import { getProfessionLevel, getProfessionXp } from '@/lib/helpers';
import { CLASS_BASELINE_SKILLS, SUBCLASSES } from '@/lib/subclasses';

// ── Skill display metadata (name + icon + short desc for UI cards) ──
const SKILL_META: Record<string, { name: string; icon: string; desc: string }> = {
  // Warrior baseline
  iron_skin:    { name: 'Iron Skin',    icon: '🛡️', desc: 'Permanently reduce all incoming damage by 1.' },
  power_strike: { name: 'Power Strike', icon: '⚔️', desc: 'Chance to deal double damage on a heavy swing.' },
  toughness:    { name: 'Toughness',    icon: '🪨', desc: 'Increase max HP by 20 permanently.' },
  battle_rush:  { name: 'Battle Rush',  icon: '⚡', desc: 'First attack each combat deals +50% damage.' },

  // Rogue baseline
  shadowstep:  { name: 'Shadowstep',  icon: '👤', desc: 'Vanish and reappear; next attack auto-crits.' },
  pick_pocket: { name: 'Pick Pocket', icon: '👜', desc: 'Steal gold from targets without combat.' },
  knife_throw: { name: 'Knife Throw', icon: '🗡️', desc: 'Open combat at range with an AGI-based throw.' },
  evasion:     { name: 'Evasion',     icon: '🌬️', desc: '+20% chance to dodge incoming attacks.' },

  // Mage baseline
  arcane_surge: { name: 'Arcane Surge', icon: '🔮', desc: 'Cast one spell for free per combat.' },
  mana_shield:  { name: 'Mana Shield',  icon: '💧', desc: 'Absorb 15 damage before HP is affected.' },
  spell_pierce: { name: 'Spell Pierce', icon: '✨', desc: 'Spells ignore half of enemy resistance.' },
  arcane_mind:  { name: 'Arcane Mind',  icon: '🧠', desc: 'Permanently add INT to WIL for spell resistance.' },

  // Cleric baseline
  healing_light: { name: 'Healing Light', icon: '💛', desc: 'Restore 25 HP as a combat action.' },
  bless:         { name: 'Bless',         icon: '✝️', desc: 'Boost next attack damage by WIL×2.' },
  ward_undead:   { name: 'Ward Undead',   icon: '🌟', desc: 'Undead deal 30% less damage to you.' },
  smite_evil:    { name: 'Smite Evil',    icon: '⚡', desc: 'Deal double damage against undead and demons.' },

  // Berserker
  berserker_rage:   { name: 'Berserker Rage',   icon: '🔥', desc: 'Below 30% HP, deal triple damage.' },
  blood_frenzy:     { name: 'Blood Frenzy',     icon: '🩸', desc: 'Each kill in combat heals 15 HP.' },
  frenzied_strikes: { name: 'Frenzied Strikes', icon: '💢', desc: 'Consecutive attacks on same enemy deal +15% more damage, stacking.' },
  war_shout:        { name: 'War Shout',        icon: '📣', desc: 'Stagger all enemies at combat start; they deal 20% less for 2 turns.' },
  death_defiant:    { name: 'Death Defiant',    icon: '💀', desc: 'Once per dungeon, survive a killing blow and counterattack immediately.' },

  // Knight
  shield_mastery:    { name: 'Shield Mastery',   icon: '🛡️', desc: 'Shields grant +2 extra DEF; chance to block incoming hits.' },
  rally:             { name: 'Rally',             icon: '💚', desc: 'Restore 20 HP at the start of each combat.' },
  mounted_charge:    { name: 'Mounted Charge',   icon: '🐴', desc: 'First attack each combat deals double damage.' },
  warlords_presence: { name: "Warlord's Presence", icon: '👑', desc: "Weaker enemies may flee; NPCs visibly respect your authority." },
  honourable_duel:   { name: 'Honourable Duel',  icon: '⚔️', desc: 'Enemies focus you — companions take 50% less damage.' },

  // Monk
  iron_fists:    { name: 'Iron Fists',    icon: '👊', desc: 'Unarmed attacks deal STR×2 damage.' },
  deflect:       { name: 'Deflect',       icon: '🌀', desc: '30% chance per turn to deflect a melee attack.' },
  stunning_blow: { name: 'Stunning Blow', icon: '⚡', desc: 'Each attack may stun the enemy, skipping their next action.' },
  chi_focus:     { name: 'Chi Focus',     icon: '🌊', desc: 'Spend 10 HP; next attack deals +80% damage.' },
  unbreakable:   { name: 'Unbreakable',   icon: '🏔️', desc: 'Once per dungeon, survive a killing blow at 1 HP.' },

  // Assassin
  venom_coat:  { name: 'Venom Coat',  icon: '☠️', desc: 'Attacks inflict poison; enemies lose HP each turn.' },
  blade_dance: { name: 'Blade Dance', icon: '💃', desc: 'Strike twice per turn against a single target.' },
  ghost_walk:  { name: 'Ghost Walk',  icon: '👻', desc: '25% chance to negate any incoming attack.' },
  assassinate: { name: 'Assassinate', icon: '🎯', desc: 'One-hit-kill chance on weakened targets from concealment.' },
  smoke_bomb:  { name: 'Smoke Bomb',  icon: '💨', desc: 'Guaranteed escape from any combat — no retribution.' },

  // Thief
  master_thief:   { name: 'Master Thief',   icon: '🏴', desc: 'Double all gold from combat and theft.' },
  lockmaster:     { name: 'Lockmaster',     icon: '🔑', desc: 'Open locked doors and containers without keys.' },
  silver_tongue:  { name: 'Silver Tongue',  icon: '🗣️', desc: 'Better prices; talk your way out of some combats.' },
  fortune_finder: { name: 'Fortune Finder', icon: '💰', desc: 'Chance to discover bonus gold in any environment.' },
  crowd_vanish:   { name: 'Crowd Vanish',   icon: '🫥', desc: 'Slip away from any non-combat situation cleanly.' },

  // Ranger
  keen_eye:       { name: 'Keen Eye',       icon: '👁️', desc: 'Never surprised; always act first in combat.' },
  hunter_mark:    { name: 'Hunter Mark',    icon: '🎯', desc: 'Marked target takes +30% damage from all your attacks.' },
  wilderness_born:{ name: 'Wilderness Born',icon: '🌲', desc: 'No penalties in the wild; food, water, shelter always findable.' },
  rapid_shot:     { name: 'Rapid Shot',     icon: '🏹', desc: 'Three quick ranged strikes per turn at reduced damage.' },
  predator:       { name: 'Predator',       icon: '🐺', desc: 'Always know enemy HP; enemies cannot flee or call for aid.' },

  // Necromancer
  raise_dead:  { name: 'Raise Dead',  icon: '💀', desc: 'After any kill, summon the fallen as an undead minion.' },
  life_drain:  { name: 'Life Drain',  icon: '🩸', desc: 'Siphon 15 HP from your target each turn.' },
  bone_shield: { name: 'Bone Shield', icon: '🦴', desc: 'Your minion absorbs one hit per combat completely.' },
  death_pact:  { name: 'Death Pact',  icon: '🔮', desc: 'If you fall, your minion sacrifices itself to revive you at 30% HP.' },
  death_aura:  { name: 'Death Aura',  icon: '🌑', desc: 'Undead are unnerved; they deal 30% less damage and may hesitate.' },

  // Elementalist
  chain_lightning:   { name: 'Chain Lightning',   icon: '🌩️', desc: 'Lightning leaps between up to three targets.' },
  overcharge:        { name: 'Overcharge',         icon: '💥', desc: 'Sacrifice 10 HP for +60% damage on next spell.' },
  elemental_mastery: { name: 'Elemental Mastery',  icon: '🌪️', desc: 'Spells exploit enemy weaknesses automatically.' },
  arcane_nova:       { name: 'Arcane Nova',        icon: '✨', desc: 'Release a burst of arcane energy hitting all enemies.' },
  archmages_will:    { name: "Archmage's Will",    icon: '🌟', desc: 'All spells auto-crit on every cast.' },

  // Illusionist
  phantom_double: { name: 'Phantom Double', icon: '🪞', desc: '50% chance the enemy attacks your decoy instead.' },
  charm:          { name: 'Charm',          icon: '💜', desc: 'Bend one enemy to your will — they fight for you this combat.' },
  vanish:         { name: 'Vanish',         icon: '🫧', desc: 'Become imperceptible; end any combat without harm.' },
  mind_shatter:   { name: 'Mind Shatter',   icon: '🔮', desc: "Fracture enemy focus — their next 3 attacks deal half damage." },
  time_stop:      { name: 'Time Stop',      icon: '⏳', desc: 'Freeze the world — enemies cannot act for 3 turns. Once per dungeon.' },

  // Paladin
  divine_strike: { name: 'Divine Strike', icon: '⚔️', desc: 'Weapon strikes carry holy fire — bonus damage against evil.' },
  divine_aegis:  { name: 'Divine Aegis',  icon: '🛡️', desc: 'The first strike against you each combat is absorbed by faith.' },
  lay_on_hands:  { name: 'Lay on Hands',  icon: '🤲', desc: 'Fully restore HP once per dungeon — self or ally.' },
  sacred_charge: { name: 'Sacred Charge', icon: '⚡', desc: 'Open each combat with a holy strike dealing WIL×3 damage.' },
  holy_wrath:    { name: 'Holy Wrath',    icon: '🔥', desc: 'Below 40% HP, divine fury surges — WIL×2 bonus damage.' },

  // Priest
  greater_mend:       { name: 'Greater Mend',       icon: '💚', desc: 'Restore 45 HP mid-combat.' },
  group_heal:         { name: 'Group Heal',          icon: '💛', desc: 'At each floor start, restore WIL×3 HP to yourself and companions.' },
  divine_shield:      { name: 'Divine Shield',       icon: '💙', desc: 'A ward absorbs 25 damage each combat before HP is touched.' },
  resurrection_light: { name: 'Resurrection Light',  icon: '💫', desc: 'Divine mercy returns you at 50% HP if you fall. Once per dungeon.' },
  purify:             { name: 'Purify',              icon: '✨', desc: 'Instantly cleanse all status effects with a spoken word.' },

  // Inquisitor
  holy_interrogation: { name: 'Holy Interrogation', icon: '🔍', desc: 'NPCs cannot deceive you; hidden truths surface.' },
  exorcise:           { name: 'Exorcise',           icon: '🕊️', desc: 'Instantly destroy undead below 30% HP with divine authority.' },
  divine_judgement:   { name: 'Divine Judgement',   icon: '⚖️', desc: 'First strike against evil-aligned enemies deals triple damage.' },
  inquisitor_mark:    { name: "Inquisitor's Mark",  icon: '🔥', desc: 'Mark a target — all your attacks deal +40% damage against them.' },
  holy_storm:         { name: 'Holy Storm',         icon: '⛈️', desc: 'Unleash WIL-based holy devastation on all enemies simultaneously.' },
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

function SkillCard({
  skillId,
  unlocked,
  canUnlock,
  onUnlock,
  T,
  tf,
}: {
  skillId: string;
  unlocked: boolean;
  canUnlock: boolean;
  onUnlock: () => void;
  T: any;
  tf: any;
}) {
  const meta = SKILL_META[skillId];
  if (!meta) return null;
  return (
    <div
      style={{
        background: unlocked ? '#1a2a1a' : T.panelAlt,
        border: `1px solid ${unlocked ? '#60a060' : T.border}`,
        padding: 10,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 4 }}>{meta.icon}</div>
      <div style={{ ...tf, fontSize: 11, color: unlocked ? '#60a060' : T.text, marginBottom: 4 }}>
        {meta.name}
      </div>
      <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4, marginBottom: 8 }}>
        {meta.desc}
      </div>
      {unlocked ? (
        <div style={{ fontSize: 10, color: '#60a060', ...tf, letterSpacing: 1 }}>UNLOCKED</div>
      ) : (
        <button
          onClick={() => { if (canUnlock) onUnlock(); }}
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
          1 pt
        </button>
      )}
    </div>
  );
}

export function SkillTreeScreen({ player, onUnlock, onClose }: SkillTreeScreenProps) {
  const { T, tf, bf } = useTheme();
  const [tab, setTab] = React.useState<'skills' | 'abilities' | 'professions'>('skills');

  const unlocked: string[] = (player as any).unlockedSkills || [];
  const skillPoints: number = (player as any).skillPoints || 0;
  const playerClass: string = player.class;
  const subclass: string | null = (player as any).subclass ?? null;
  const level: number = player.level || 1;

  const baselineSkills = CLASS_BASELINE_SKILLS[playerClass] || [];
  const subclassDef = subclass && SUBCLASSES[playerClass]?.[subclass];
  const subclassSkills = subclassDef ? subclassDef.skills : [];

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
              {playerClass}{subclass ? ` · ${subclass}` : ''} · {skillPoints} skill point{skillPoints !== 1 ? 's' : ''} available
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

              {/* Section 1: Class baseline skills */}
              <div style={{ marginBottom: 28 }}>
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
                  <span style={{ ...tf, color: T.accent, fontSize: 11, letterSpacing: 2 }}>
                    CLASS SKILLS
                  </span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>— always available</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {baselineSkills.map((skillId) => (
                    <SkillCard
                      key={skillId}
                      skillId={skillId}
                      unlocked={unlocked.includes(skillId)}
                      canUnlock={skillPoints >= 1 && !unlocked.includes(skillId)}
                      onUnlock={() => onUnlock(skillId)}
                      T={T}
                      tf={tf}
                    />
                  ))}
                </div>
              </div>

              {/* Section 2: Subclass skills */}
              <div>
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
                  <span style={{ ...tf, color: subclass ? T.gold : T.textFaint, fontSize: 11, letterSpacing: 2 }}>
                    {subclass ? subclass.toUpperCase() : 'SUBCLASS'}
                  </span>
                  {!subclass && (
                    <span style={{ fontSize: 10, color: T.textFaint }}>
                      {level < 10 ? `— unlocks at level 10 (Lv.${level} now)` : '— choose your path'}
                    </span>
                  )}
                </div>

                {!subclass && level < 10 && (
                  <div
                    style={{
                      padding: 24,
                      textAlign: 'center',
                      color: T.textFaint,
                      fontSize: 12,
                      fontStyle: 'italic',
                      border: `1px dashed ${T.border}`,
                    }}
                  >
                    Your path diverges at level 10.<br />
                    <span style={{ fontSize: 10, marginTop: 6, display: 'block' }}>
                      {10 - level} level{10 - level !== 1 ? 's' : ''} to go.
                    </span>
                  </div>
                )}

                {!subclass && level >= 10 && (
                  <div
                    style={{
                      padding: 16,
                      textAlign: 'center',
                      background: '#2a1e00',
                      border: `1px solid ${T.gold}55`,
                      color: T.gold,
                      fontSize: 12,
                    }}
                  >
                    Your subclass awaits. The choice will come when you rest.
                  </div>
                )}

                {subclass && subclassDef && (
                  <>
                    <div style={{ fontSize: 11, color: T.textMuted, fontStyle: 'italic', marginBottom: 12 }}>
                      {subclassDef.flavour}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {subclassSkills.map((skillId) => (
                        <SkillCard
                          key={skillId}
                          skillId={skillId}
                          unlocked={unlocked.includes(skillId)}
                          canUnlock={skillPoints >= 1 && !unlocked.includes(skillId)}
                          onUnlock={() => onUnlock(skillId)}
                          T={T}
                          tf={tf}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
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
