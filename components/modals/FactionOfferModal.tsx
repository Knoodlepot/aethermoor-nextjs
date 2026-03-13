'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';

// ── Local faction data (not yet in constants.ts) ──

interface FactionDef {
  name: string;
  icon: string;
  color: string;
  group: 'class' | 'world';
  desc: string;
  rival?: string;
}

interface FactionOffer {
  title: string;
  pitch: string;
  pitchForgotten?: string;
  gift: string;
  giftDesc: string;
  rival?: string;
}

const FACTIONS: Record<string, FactionDef> = {
  warriors_guild: {
    name: "Warriors' Guild",
    icon: '⚔️',
    color: '#c03030',
    group: 'class',
    desc: 'Brotherhood of fighters who uphold might and honour.',
    rival: 'thieves_guild',
  },
  thieves_guild: {
    name: "Thieves' Guild",
    icon: '🗡️',
    color: '#606060',
    group: 'class',
    desc: 'A shadow network of cutpurses, spies, and assassins.',
    rival: 'warriors_guild',
  },
  mages_circle: {
    name: "Mages' Circle",
    icon: '🔮',
    color: '#6030c0',
    group: 'class',
    desc: 'The ancient order of scholarly spellcasters.',
  },
  order_of_light: {
    name: 'Order of Light',
    icon: '✨',
    color: '#c0a030',
    group: 'class',
    desc: 'A holy fellowship devoted to justice and healing.',
    rival: 'shadow_court',
  },
  merchants_league: {
    name: 'Merchants League',
    icon: '🏦',
    color: '#c0a030',
    group: 'world',
    desc: 'The powerful trading syndicate that controls commerce across the continent.',
  },
  crown_guard: {
    name: 'Crown Guard',
    icon: '🪖',
    color: '#3090c0',
    group: 'world',
    desc: 'Elite soldiers sworn to protect the realm and its rulers.',
    rival: 'shadow_court',
  },
  shadow_court: {
    name: 'Shadow Court',
    icon: '🌑',
    color: '#602060',
    group: 'world',
    desc: 'A clandestine council that pulls strings behind thrones and guilds.',
    rival: 'order_of_light',
  },
  wild_rangers: {
    name: 'Wild Rangers',
    icon: '🐺',
    color: '#406030',
    group: 'world',
    desc: 'Wardens of the wilderness who protect the untamed lands.',
  },
  the_forgotten: {
    name: 'The Forgotten',
    icon: '💀',
    color: '#805050',
    group: 'world',
    desc: 'A secret order of those who walk between worlds.',
  },
};

const FACTION_JOIN_OFFERS: Record<string, FactionOffer> = {
  warriors_guild: {
    title: "A Proposition from the Warriors' Guild",
    pitch: '"We have heard of your deeds in battle. The Warriors\' Guild would count you among our ranks — if you have the steel for it."',
    gift: 'Iron Shield',
    giftDesc: "A battered iron shield, standard issue for new recruits. It has seen better days — but so have its wielders.",
    rival: 'thieves_guild',
  },
  thieves_guild: {
    title: 'An Offer You Should Not Refuse',
    pitch: '"Word travels fast in this city. Someone with your... particular talents would be an asset to the Guild. We look after our own."',
    gift: 'Lockpick',
    giftDesc: 'A quality steel lockpick, better than the bent copper ones sold in market stalls. A gift — for now.',
    rival: 'warriors_guild',
  },
  mages_circle: {
    title: "An Invitation to the Mages' Circle",
    pitch: '"The Circle does not extend invitations lightly. Your aptitude for the arcane has been noted. Study with us, and the secrets of Aethermoor will open to you."',
    gift: 'Scroll of Mending',
    giftDesc: 'A carefully prepared scroll of restorative energy. Consider it a demonstration of what knowledge can achieve.',
  },
  order_of_light: {
    title: 'A Call to the Order of Light',
    pitch: '"The light calls to those who are worthy. The Order has watched you and found a steadfast spirit. Stand with us against the growing dark."',
    gift: 'Health Potion',
    giftDesc: "A vial blessed by the Order's healers. Its effect is noticeably more potent than market brews.",
    rival: 'shadow_court',
  },
  merchants_league: {
    title: 'A Business Proposal',
    pitch: '"Connections are worth more than gold — and you have been making the right kind. The League offers partnership, protection, and profit. What more could an adventurer want?"',
    gift: 'Gold Coin',
    giftDesc: "A signing bonus of fifty gold coins, stamped with the League's seal. A promise of more to come.",
  },
  crown_guard: {
    title: 'A Commission from the Crown Guard',
    pitch: '"The realm needs capable swords. You have proven yours. Swear to uphold the law and serve the Crown, and you shall be rewarded with rank, resources, and purpose."',
    gift: 'Chainmail',
    giftDesc: 'Standard Guard-issue chainmail, well-maintained and solid. The Crown expects its agents to look the part.',
    rival: 'shadow_court',
  },
  shadow_court: {
    title: 'A Whisper in the Dark',
    pitch: '"Pretend you did not hear this. The Court has interests that require someone... unattached. Serve those interests discreetly, and you will find doors opening that were never meant to be found."',
    gift: 'Dagger',
    giftDesc: "A slim unmarked blade, perfectly balanced. It leaves no identifying marks. A professional's tool.",
    rival: 'order_of_light',
  },
  wild_rangers: {
    title: 'An Offer from the Wild Rangers',
    pitch: '"The land itself called your name. We heard it. Walk with the Rangers — protect what cannot protect itself, and in return the wilderness will guard you as one of its own."',
    gift: 'Forager Kit',
    giftDesc: 'A worn but well-loved kit of wildcrafting tools, assembled by Ranger hands over many seasons.',
  },
  the_forgotten: {
    title: 'A Message Without a Sender',
    pitch: '"You should not have been able to read this. And yet here you are. We do not recruit — we recognise. You already know what we are. You have always known."',
    pitchForgotten:
      '"The line between the living and what waits beyond is thinner for you than for others. The Forgotten do not ask you to cross it — only to acknowledge it."',
    gift: 'Amulet',
    giftDesc: 'A carved stone amulet that hums faintly with power. It feels like it was already yours.',
  },
};

// ────────────────────────────────────────────────────────────

interface FactionOfferModalProps {
  factionId: string;
  player: Player;
  onJoin: (factionId: string) => void;
  onDecline: (factionId: string) => void;
  onRival: (factionId: string) => void;
}

export function FactionOfferModal({
  factionId,
  onJoin,
  onDecline,
  onRival,
}: FactionOfferModalProps) {
  const { T, tf, bf } = useTheme();

  const fac: FactionDef = (FACTIONS as any)?.[factionId] ?? {
    name: factionId,
    icon: '⚔️',
    color: '#c0a030',
    group: 'world' as const,
    desc: '',
  };

  const offer: FactionOffer = (FACTION_JOIN_OFFERS as any)?.[factionId] ?? {
    title: 'An Offer of Membership',
    pitch: '"We believe you have what it takes. Will you join us?"',
    gift: 'Unknown Gift',
    giftDesc: 'A gift from the faction.',
  };

  const isForgotten = factionId === 'the_forgotten';
  const pitchText =
    isForgotten && offer.pitchForgotten ? offer.pitchForgotten : offer.pitch;

  const rivalFacId: string | undefined = offer.rival ?? fac.rival;
  const rivalFac: FactionDef | null = rivalFacId
    ? ((FACTIONS as any)?.[rivalFacId] ?? null)
    : null;

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
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${fac.color}`,
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: T.panelAlt,
            borderBottom: `1px solid ${fac.color}44`,
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>{fac.icon}</span>
            <div>
              <div
                style={{
                  ...tf,
                  color: T.textMuted,
                  fontSize: 10,
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                {offer.title.toUpperCase()}
              </div>
              <div style={{ ...tf, color: fac.color, fontSize: 17, letterSpacing: 1 }}>
                {fac.name}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: T.textFaint, paddingLeft: 40 }}>
            {fac.desc}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {/* Pitch */}
          <div
            style={{
              fontStyle: 'italic',
              color: T.text,
              fontSize: 14,
              lineHeight: 1.7,
              borderLeft: `3px solid ${fac.color}`,
              paddingLeft: 14,
              marginBottom: 20,
            }}
          >
            {pitchText}
          </div>

          {/* Gift */}
          <div
            style={{
              background: T.panelAlt,
              border: `1px solid ${T.border}`,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                ...tf,
                color: T.accent,
                fontSize: 10,
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              JOINING GIFT
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  background: T.border,
                  border: `1px solid ${fac.color}44`,
                  padding: '6px 12px',
                  ...tf,
                  color: fac.color,
                  fontSize: 12,
                  flexShrink: 0,
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {offer.gift}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
                {offer.giftDesc}
              </div>
            </div>
          </div>

          {/* Rival warning */}
          {rivalFac && (
            <div
              style={{
                background: '#2a0808',
                border: '1px solid #c0303044',
                padding: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  ...tf,
                  color: '#c03030',
                  fontSize: 10,
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                RIVAL FACTION
              </div>
              <div style={{ fontSize: 12, color: T.text }}>
                Joining {fac.name} will mark you as a rival to{' '}
                <span style={{ color: rivalFac.color }}>{rivalFac.name}</span>.
                Their members will be hostile to you.
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => onJoin(factionId)}
              style={{
                width: '100%',
                background: fac.color + '22',
                border: `1px solid ${fac.color}`,
                color: fac.color,
                padding: '12px',
                fontSize: 13,
                ...tf,
                letterSpacing: '0.06em',
                cursor: 'pointer',
              }}
            >
              Accept — Join {fac.name}
            </button>
            <button
              onClick={() => onDecline(factionId)}
              style={{
                width: '100%',
                background: 'transparent',
                border: `1px solid ${T.border}`,
                color: T.textMuted,
                padding: '11px',
                fontSize: 13,
                ...tf,
                letterSpacing: '0.06em',
                cursor: 'pointer',
              }}
            >
              Not now — Decline
            </button>
            {rivalFac && (
              <button
                onClick={() => onRival(factionId)}
                style={{
                  width: '100%',
                  background: '#2a080822',
                  border: '1px solid #c0303066',
                  color: '#c06060',
                  padding: '11px',
                  fontSize: 13,
                  ...tf,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                Refuse outright — Side with {rivalFac.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
