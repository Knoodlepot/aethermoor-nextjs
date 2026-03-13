'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { LOCATION_TIERS, NG_PLUS_PERKS } from '@/lib/constants';
import * as helpers from '@/lib/helpers';

// ── Helpers not yet in helpers.ts ──
const getFactionRank = (helpers as any).getFactionRank as ((xp: number) => number) | undefined;
const getLocationRank = (helpers as any).getLocationRank as ((xp: number) => number) | undefined;
const getRepTier = (helpers as any).getRepTier as ((rep: number) => any) | undefined;

// ── Local constants not yet in constants.ts ──

interface FactionRankDef { label: string; color: string; minXp: number; }
const FACTION_RANKS: FactionRankDef[] = [
  { label: 'Stranger',   color: '#6a523c', minXp: 0 },
  { label: 'Known',      color: '#9a7a55', minXp: 100 },
  { label: 'Associate',  color: '#c0a030', minXp: 300 },
  { label: 'Member',     color: '#60a060', minXp: 600 },
  { label: 'Trusted',    color: '#3090c0', minXp: 1000 },
  { label: 'Champion',   color: '#9030c0', minXp: 1500 },
];

const FACTION_XP_NEEDED = [100, 300, 600, 1000, 1500, 2100];

interface LocalFactionDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  group: 'class' | 'world';
  forClass?: string;
  desc: string;
  rankAbilities: Record<number, string>;
}

const FACTIONS: LocalFactionDef[] = [
  // Class factions
  {
    id: 'warriors_guild',
    name: "Warriors' Guild",
    icon: '⚔️',
    color: '#c03030',
    group: 'class',
    forClass: 'Warrior',
    desc: 'Brotherhood of fighters who uphold might and honour.',
    rankAbilities: { 2: 'War Cry', 4: 'Iron Wall', 6: 'Champion Strike' },
  },
  {
    id: 'thieves_guild',
    name: "Thieves' Guild",
    icon: '🗡️',
    color: '#606060',
    group: 'class',
    forClass: 'Rogue',
    desc: 'A shadow network of cutpurses, spies, and assassins.',
    rankAbilities: { 2: 'Shadow Network', 4: 'Fence Bonus', 6: 'Ghost Contract' },
  },
  {
    id: 'mages_circle',
    name: "Mages' Circle",
    icon: '🔮',
    color: '#6030c0',
    group: 'class',
    forClass: 'Mage',
    desc: 'The ancient order of scholarly spellcasters.',
    rankAbilities: { 2: 'Arcane Repository', 4: 'Spell Surge', 6: 'Archmage Rite' },
  },
  {
    id: 'order_of_light',
    name: 'Order of Light',
    icon: '✨',
    color: '#c0a030',
    group: 'class',
    forClass: 'Cleric',
    desc: 'A holy fellowship devoted to justice and healing.',
    rankAbilities: { 2: 'Lay on Hands', 4: 'Holy Seal', 6: 'Divine Mandate' },
  },
  // World factions
  {
    id: 'merchants_league',
    name: 'Merchants League',
    icon: '🏦',
    color: '#c0a030',
    group: 'world',
    desc: 'The powerful trading syndicate that controls commerce across the continent.',
    rankAbilities: { 2: 'Trade Discount', 4: 'Guild Warehouse', 6: 'Merchant Prince' },
  },
  {
    id: 'crown_guard',
    name: 'Crown Guard',
    icon: '🪖',
    color: '#3090c0',
    group: 'world',
    desc: 'Elite soldiers sworn to protect the realm and its rulers.',
    rankAbilities: { 2: 'Guard Passage', 4: 'Royal Commission', 6: 'Crown Authority' },
  },
  {
    id: 'shadow_court',
    name: 'Shadow Court',
    icon: '🌑',
    color: '#602060',
    group: 'world',
    desc: 'A clandestine council that pulls strings behind thrones and guilds.',
    rankAbilities: { 2: 'Secret Routes', 4: 'Blackmail Dossier', 6: 'Shadow Mandate' },
  },
  {
    id: 'wild_rangers',
    name: 'Wild Rangers',
    icon: '🐺',
    color: '#406030',
    group: 'world',
    desc: 'Wardens of the wilderness who protect the untamed lands.',
    rankAbilities: { 2: 'Wilderness Guide', 4: 'Beast Tamer', 6: 'Ranger Commander' },
  },
];

interface LocationRankDef { label: string; color: string; minXp: number; }
const LOCATION_RANKS: LocationRankDef[] = [
  { label: 'Outsider',   color: '#6a523c', minXp: 0 },
  { label: 'Visitor',    color: '#9a7a55', minXp: 50 },
  { label: 'Regular',    color: '#c0a030', minXp: 150 },
  { label: 'Local',      color: '#60a060', minXp: 350 },
  { label: 'Respected',  color: '#3090c0', minXp: 700 },
  { label: 'Pillar',     color: '#9030c0', minXp: 1200 },
];

const LOCATION_XP_NEEDED = [50, 150, 350, 700, 1200, 1800];
const LOCATION_REWARDS: Record<number, string> = {
  1: 'Locals speak to you openly',
  2: 'Access to back-room traders',
  3: 'XP bonus in this location',
  4: 'Safe house and storage',
  5: 'Honorary citizenship',
};

interface RepTier { label: string; color: string; min: number; }
const REP_TIERS: RepTier[] = [
  { min: 500,  label: 'Living Legend',        color: '#f0c060' },
  { min: 300,  label: 'Renowned Hero',        color: '#c0a030' },
  { min: 150,  label: 'Respected Adventurer', color: '#60a060' },
  { min: 50,   label: 'Recognised Name',      color: '#609060' },
  { min: 0,    label: 'Unknown Traveller',    color: '#9a7a55' },
  { min: -50,  label: 'Notorious Outlaw',     color: '#c06030' },
  { min: -9999, label: 'Outcast',             color: '#c03030' },
];

function getFactionRankLocal(xp: number): number {
  if (getFactionRank) return getFactionRank(xp);
  let rank = 0;
  for (let i = 0; i < FACTION_XP_NEEDED.length; i++) {
    if (xp >= FACTION_XP_NEEDED[i]) rank = i + 1;
    else break;
  }
  return Math.min(rank, FACTION_RANKS.length - 1);
}

function getLocationRankLocal(xp: number): number {
  if (getLocationRank) return getLocationRank(xp);
  let rank = 0;
  for (let i = 0; i < LOCATION_XP_NEEDED.length; i++) {
    if (xp >= LOCATION_XP_NEEDED[i]) rank = i + 1;
    else break;
  }
  return Math.min(rank, LOCATION_RANKS.length - 1);
}

function getRepTierLocal(rep: number): RepTier {
  if (getRepTier) return getRepTier(rep) as RepTier;
  return REP_TIERS.find((t) => rep >= t.min) || REP_TIERS[REP_TIERS.length - 1];
}

interface StandingsScreenProps {
  player: Player;
  onClose: () => void;
}

export function StandingsScreen({ player, onClose }: StandingsScreenProps) {
  const { T, tf, bf } = useTheme();
  const [tab, setTab] = React.useState<'rep' | 'class' | 'world' | 'locations'>('rep');

  const TABS = [
    { id: 'rep' as const, label: 'Reputation' },
    { id: 'class' as const, label: 'Class Faction' },
    { id: 'world' as const, label: 'World Factions' },
    { id: 'locations' as const, label: 'Locations' },
  ];

  // ── Inner components ──

  function RankBar({ current, max, color }: { current: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
    return (
      <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transition: 'width 0.3s',
          }}
        />
      </div>
    );
  }

  function FactionCard({ fid }: { fid: string }) {
    const faction = FACTIONS.find((f) => f.id === fid);
    const xp: number = (player.factionStandings || {})[fid] || 0;
    const rankIdx = getFactionRankLocal(xp);
    const rankDef = FACTION_RANKS[rankIdx] || FACTION_RANKS[0];
    const nextXp = FACTION_XP_NEEDED[rankIdx] || FACTION_XP_NEEDED[FACTION_XP_NEEDED.length - 1];
    const prevXp = rankIdx > 0 ? FACTION_XP_NEEDED[rankIdx - 1] : 0;
    const xpInRank = xp - prevXp;
    const xpNeeded = nextXp - prevXp;
    const isJoined = (player.joinedFactions || []).includes(fid);

    if (!faction) {
      return (
        <div style={{ padding: 12, borderBottom: `1px solid ${T.border}`, color: T.textFaint, fontSize: 12 }}>
          {fid} — unknown faction
        </div>
      );
    }

    return (
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>{faction.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ ...tf, color: faction.color, fontSize: 13 }}>{faction.name}</span>
              {isJoined && (
                <span
                  style={{
                    fontSize: 9, ...tf,
                    color: faction.color,
                    border: `1px solid ${faction.color}44`,
                    padding: '1px 5px',
                    letterSpacing: 1,
                  }}
                >
                  JOINED
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: T.textFaint }}>{faction.desc}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: rankDef.color, ...tf }}>{rankDef.label}</div>
            <div style={{ fontSize: 10, color: T.textFaint }}>{xp} XP</div>
          </div>
        </div>
        <RankBar current={xpInRank} max={xpNeeded} color={rankDef.color} />
        {/* Rank abilities */}
        {Object.entries(faction.rankAbilities).length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(faction.rankAbilities).map(([rank, ability]) => {
              const unlocked = rankIdx >= Number(rank);
              return (
                <span
                  key={rank}
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    background: unlocked ? '#1a2a1a' : T.panelAlt,
                    color: unlocked ? '#60a060' : T.textFaint,
                    border: `1px solid ${unlocked ? '#60a060' : T.border}`,
                  }}
                >
                  {ability}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function LocationCard({ locName }: { locName: string }) {
    const xp: number = (player.locationStandings || {})[locName] || 0;
    const rankIdx = getLocationRankLocal(xp);
    const rankDef = LOCATION_RANKS[rankIdx] || LOCATION_RANKS[0];
    const tier = LOCATION_TIERS[locName] || 'unknown';
    const nextXp = LOCATION_XP_NEEDED[rankIdx] || LOCATION_XP_NEEDED[LOCATION_XP_NEEDED.length - 1];
    const prevXp = rankIdx > 0 ? LOCATION_XP_NEEDED[rankIdx - 1] : 0;
    const xpInRank = xp - prevXp;
    const xpNeeded = nextXp - prevXp;
    const reward = LOCATION_REWARDS[rankIdx];

    return (
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ ...tf, color: T.text, fontSize: 13 }}>{locName}</span>
              <span
                style={{
                  fontSize: 9, ...tf,
                  color: T.textFaint,
                  border: `1px solid ${T.border}`,
                  padding: '1px 4px',
                  letterSpacing: 1,
                }}
              >
                {tier.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 10, color: rankDef.color }}>{rankDef.label}</div>
          </div>
          <div style={{ fontSize: 10, color: T.textFaint, textAlign: 'right', flexShrink: 0 }}>
            {xp} XP
          </div>
        </div>
        <RankBar current={xpInRank} max={xpNeeded} color={rankDef.color} />
        {reward && rankIdx > 0 && (
          <div style={{ fontSize: 10, color: '#60a060', marginTop: 4 }}>
            {reward}
          </div>
        )}
      </div>
    );
  }

  // ── Data prep ──
  const repTier = getRepTierLocal(player.reputation || 0);
  const classFactions = FACTIONS.filter((f) => f.group === 'class' && f.forClass === player.class);
  const worldFactions = FACTIONS.filter((f) => f.group === 'world');
  const locationKeys = Object.keys(player.locationStandings || {}).filter(
    (k) => (player.locationStandings![k] || 0) > 0
  );

  // NG+ faction bonus note
  const ngConnected = (player.legacyPerks || []).includes('connected');

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
          <div style={{ ...tf, color: T.gold, fontSize: 16, letterSpacing: 2 }}>
            ⭐ STANDINGS
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
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
            overflowX: 'auto',
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                minWidth: 70,
                background: tab === t.id ? T.selectedBg : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? T.accent : 'transparent'}`,
                color: tab === t.id ? T.gold : T.textMuted,
                padding: '10px 8px',
                cursor: 'pointer',
                fontSize: 11,
                ...tf,
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* ── REPUTATION ── */}
          {tab === 'rep' && (
            <div style={{ padding: 16 }}>
              <div
                style={{
                  background: T.panelAlt,
                  border: `1px solid ${repTier.color}44`,
                  padding: 16,
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>
                  {player.reputation >= 300 ? '🌟' : player.reputation >= 0 ? '⭐' : '💀'}
                </div>
                <div style={{ ...tf, color: repTier.color, fontSize: 18, letterSpacing: 1, marginBottom: 4 }}>
                  {repTier.label}
                </div>
                <div style={{ fontSize: 28, color: repTier.color, ...tf, marginBottom: 4 }}>
                  {player.reputation > 0 ? '+' : ''}{player.reputation}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Global Reputation</div>
              </div>

              {/* Reputation tiers reference */}
              <div style={{ ...tf, color: T.accent, fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>
                REPUTATION TIERS
              </div>
              {REP_TIERS.slice(0, -1).map((tier) => {
                const isCurrent = getRepTierLocal(player.reputation).label === tier.label;
                return (
                  <div
                    key={tier.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 10px',
                      background: isCurrent ? T.selectedBg : 'transparent',
                      borderLeft: isCurrent ? `3px solid ${tier.color}` : '3px solid transparent',
                      marginBottom: 2,
                    }}
                  >
                    <div style={{ flex: 1, fontSize: 12, color: isCurrent ? tier.color : T.textMuted }}>
                      {tier.label}
                    </div>
                    <div style={{ fontSize: 11, color: T.textFaint }}>
                      {tier.min >= 0 ? `${tier.min}+` : `${tier.min}`} rep
                    </div>
                  </div>
                );
              })}

              {/* Wanted level */}
              {(player.wantedLevel || 0) > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    background: '#2a0808',
                    border: '1px solid #c0303044',
                    padding: 12,
                  }}
                >
                  <div style={{ ...tf, color: '#c03030', fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>
                    WANTED STATUS
                  </div>
                  <div style={{ fontSize: 12, color: T.text }}>
                    Wanted Level {player.wantedLevel} —{' '}
                    {player.wantedLevel === 1 ? '100g bounty' : player.wantedLevel === 2 ? '500g bounty' : '5000g bounty (Extreme)'}
                  </div>
                </div>
              )}

              {/* NG+ connected perk note */}
              {ngConnected && (
                <div style={{ marginTop: 12, fontSize: 11, color: T.accent }}>
                  {NG_PLUS_PERKS.find((p) => p.id === 'connected')?.desc}
                </div>
              )}
            </div>
          )}

          {/* ── CLASS FACTION ── */}
          {tab === 'class' && (
            classFactions.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic' }}>
                No class faction defined for {player.class}.
              </div>
            ) : (
              classFactions.map((f) => <FactionCard key={f.id} fid={f.id} />)
            )
          )}

          {/* ── WORLD FACTIONS ── */}
          {tab === 'world' && (
            <div>
              {worldFactions.map((f) => <FactionCard key={f.id} fid={f.id} />)}
            </div>
          )}

          {/* ── LOCATIONS ── */}
          {tab === 'locations' && (
            locationKeys.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic' }}>
                No location standings yet. Spend time in settlements to build ties.
              </div>
            ) : (
              locationKeys.map((loc) => <LocationCard key={loc} locName={loc} />)
            )
          )}
        </div>
      </div>
    </div>
  );
}
