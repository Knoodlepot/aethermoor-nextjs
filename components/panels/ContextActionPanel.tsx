'use client';
// v2
import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { LOCATION_TIERS } from '@/lib/constants';

interface ContextActionPanelProps {
  context: string;
  isLoading: boolean;
  onAction: (text: string) => void;
  onOpenShop?: () => void;
  onOpenCraft?: () => void;
  playerClass?: string;
  equipped?: Record<string, string>;
  inventory?: string[];
  location?: string;
  locationGrid?: Record<string, any>;
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildAttackText(equipped: Record<string, string>): string {
  const weapon = equipped['weapon'] || equipped['mainhand'] || '';
  const wl = weapon.toLowerCase();

  let verbs: string[];
  let targets: string[];
  let isRanged = false;

  if (/bow|crossbow|shortbow|longbow/.test(wl)) {
    verbs = ['loose an arrow at', 'fire at', 'aim and shoot at', 'draw and fire at'];
    targets = ['the chest', 'the throat', 'the shoulder', 'centre mass', 'the gut', 'the leg'];
    isRanged = true;
  } else if (/dagger|knife|stiletto|dirk|shiv/.test(wl)) {
    verbs = ['drive my', 'thrust my', 'stab with my', 'plunge my'];
    targets = ['the gut', 'the throat', 'the ribs', 'the shoulder', 'the side', 'the flank'];
  } else if (/axe|hatchet|cleaver/.test(wl)) {
    verbs = ['cleave at', 'hack at', 'swing my', 'bring my'];
    targets = ['the shoulder', 'the neck', 'the chest', 'the side', 'the flank'];
  } else if (/mace|club|hammer|maul|flail|morningstar/.test(wl)) {
    verbs = ['smash at', 'bludgeon', 'bring my', 'swing my'];
    targets = ['the skull', 'the ribs', 'the shoulder', 'the knee', 'the chest'];
  } else if (/spear|lance|pike|javelin/.test(wl)) {
    verbs = ['thrust my', 'drive my', 'jab my', 'lunge with my'];
    targets = ['the chest', 'the gut', 'the throat', 'the side', 'the shoulder'];
  } else if (/staff|rod|wand|cane|stave/.test(wl)) {
    verbs = ['swing my', 'crack my', 'jab with my', 'strike with my'];
    targets = ['the head', 'the knee', 'the ribs', 'the shoulder'];
  } else {
    // sword / generic blade / unarmed
    verbs = ['slash at', 'swing my', 'thrust my', 'cut at', 'lunge at'];
    targets = ['the chest', 'the flank', 'the gut', 'the side', 'the shoulder', 'the neck'];
  }

  const target = pick(targets);

  if (isRanged) {
    const verb = pick(verbs);
    if (weapon) return `I ${verb} ${target} with my ${weapon}.`;
    return `I ${verb} ${target}.`;
  }

  const verb = pick(verbs);
  // Some verbs already include "my" or are phrased as "swing my"
  if (verb.endsWith(' my') || verb.startsWith('bring my') || verb.startsWith('lunge with my')) {
    return weapon
      ? `I ${verb} ${weapon} at ${target}.`
      : `I ${verb} weapon at ${target}.`;
  }
  return weapon
    ? `I ${verb} ${target} with my ${weapon}.`
    : `I ${verb} ${target}.`;
}

interface ActionBtn {
  icon: string;
  label: string;
  text: string;
  requiresItem?: string;
  hasItem?: boolean;
}

const TOWN_ACTIONS: ActionBtn[] = [
  { icon: '💬', label: 'talk',         text: 'I approach someone to start a conversation, asking around for local information, news, or gossip.' },
  { icon: '🪙', label: 'barter',       text: 'barter' },
  { icon: '🛒', label: 'shop',         text: 'I browse the local shops and merchants to see what\'s available.' },
  { icon: '📋', label: 'noticeBoard',  text: 'I walk over to the notice board and read what\'s posted.' },
  { icon: '🗣️', label: 'rumours',      text: 'I find a quiet corner and listen in for local rumours, whispers, and gossip.' },
  { icon: '🛏', label: 'rest',         text: 'I find somewhere comfortable to rest for a few hours.' },
  { icon: '👁', label: 'look',         text: 'I look around the town, taking in my surroundings.' },
  { icon: '⚒️', label: 'craft',        text: 'I look for a suitable place to craft and work on my supplies.' },
  { icon: '🙏', label: 'pray',         text: 'I seek out the local shrine or temple to pray and pay my respects.' },
];

const EXPLORE_ACTIONS: ActionBtn[] = [
  { icon: '👁',  label: 'look',       text: 'I look around carefully, taking in my surroundings.' },
  { icon: '🔍', label: 'search',      text: 'I search the area thoroughly.' },
  { icon: '👂', label: 'listen',      text: 'I stop and listen carefully to my surroundings.' },
  { icon: '🛏', label: 'rest',        text: 'I rest for a while to recover.' },
  { icon: '🔥', label: 'camp',        text: 'I make camp here for the night.' },
  { icon: '🌿', label: 'forage',      text: 'I forage carefully for edible plants, herbs, and useful supplies in the nearby wild.' },
  { icon: '🌾', label: 'farm',        text: 'I look for nearby fields and work the land to gather useful crops.' },
  { icon: '🪓', label: 'chopWood',    text: 'I gather timber from nearby trees for shelter and supplies.', requiresItem: 'Woodcutter Hatchet' },
  { icon: '⛏',  label: 'mineOre',    text: 'I search rocky ground and mine for ore and useful stone.', requiresItem: "Miner's Pickaxe" },
];

const COMBAT_ACTIONS: ActionBtn[] = [
  { icon: '⚔️', label: 'attack',   text: 'I attack!' },
  { icon: '🛡',  label: 'defend',  text: 'I take a defensive stance, bracing for the next blow.' },
  { icon: '💨', label: 'dodge',    text: 'I dodge and look for an opening.' },
  { icon: '✨', label: 'spell',    text: 'I cast a spell.' },
  { icon: '🎒', label: 'useItem',  text: 'I reach into my pack and use an item.' },
  { icon: '🏃', label: 'flee',     text: 'I attempt to flee!' },
];

// Chance of bystander help by settlement type
const HELP_CHANCE: Record<string, number> = {
  capital: 0.70,
  city:    0.60,
  town:    0.50,
  village: 0.35,
  hamlet:  0.20,
};

const TIER_ICONS: Record<string, string> = {
  hamlet:         '🏚️',
  village:        '🏘️',
  town:           '🏛️',
  city:           '🏰',
  capital:        '👑',
  poi:            '⚠️',
  dungeon:        '🗝️',
  farm_arable:    '🌾',
  farm_livestock: '🐄',
  farm_mixed:     '🐂',
};

function locationIcon(locationName: string | undefined, locationGrid?: Record<string, any>): string {
  if (!locationName) return '🌲';
  if (locationName.toLowerCase().includes('dungeon')) return '🗝️';
  const gridEntry = locationGrid?.[locationName];
  if (gridEntry?.type && TIER_ICONS[gridEntry.type]) return TIER_ICONS[gridEntry.type];
  const tier = LOCATION_TIERS[locationName];
  return TIER_ICONS[tier] ?? '🌲';
}

function getSettlementType(location: string | undefined, locationGrid: Record<string, any> | undefined): string | null {
  if (!location || !locationGrid) return null;
  const entry = locationGrid[location];
  if (!entry?.type) return null;
  return HELP_CHANCE[entry.type] !== undefined ? entry.type : null;
}

const SETTLEMENT_TYPES = new Set(['hamlet', 'village', 'town', 'city', 'capital']);

function getTemplateFor(
  context: string,
  location?: string,
  locationGrid?: Record<string, any>
): { label: string; color: string; actions: ActionBtn[] } {
  if (context === 'combat') {
    return { label: 'COMBAT', color: '#c04030', actions: COMBAT_ACTIONS };
  }
  if (context === 'town' || context === 'npc' || context === 'farm') {
    return { label: 'IN TOWN', color: '#c0a030', actions: TOWN_ACTIONS };
  }
  // Infer town context from location type when narrator hasn't set it explicitly
  if (location && locationGrid) {
    const entry = locationGrid[location];
    if (entry?.type && SETTLEMENT_TYPES.has(entry.type)) {
      return { label: 'IN TOWN', color: '#c0a030', actions: TOWN_ACTIONS };
    }
  }
  return { label: 'EXPLORING', color: '#4a8a60', actions: EXPLORE_ACTIONS };
}

export function ContextActionPanel({ context, isLoading, onAction, onOpenShop, onOpenCraft, playerClass, equipped = {}, inventory = [], location, locationGrid }: ContextActionPanelProps) {
  const { T, tf, t } = useTheme();

  const { label, color, actions: rawActions } = getTemplateFor(context, location, locationGrid);
  const locIcon = locationIcon(location, locationGrid);

  // Filter spell button — only Mage and Cleric can cast spells
  const SPELL_CLASSES = new Set(['Mage', 'Cleric']);
  const actions = rawActions.filter((a) =>
    a.label !== 'spell' || SPELL_CLASSES.has(playerClass || '')
  );

  // Resolve per-button item requirements
  const resolvedActions = actions.map((a) => {
    if (!a.requiresItem) return { ...a, hasItem: true };
    const has = inventory.some((i) => i.toLowerCase().includes(a.requiresItem!.toLowerCase()));
    return { ...a, hasItem: has };
  });

  // Call for Help — combat in a settlement only
  const settlementType = context === 'combat' ? getSettlementType(location, locationGrid) : null;
  const helpChance = settlementType ? HELP_CHANCE[settlementType] : 0;
  const helpPct = Math.round(helpChance * 100);

  const handleCallForHelp = () => {
    const success = Math.random() < helpChance;
    if (success) {
      onAction(`I shout for help! Someone from the ${settlementType} hears my cries and rushes to intervene. [HELP SUCCESS - a bystander or guard intervenes on my behalf]`);
    } else {
      onAction(`I shout for help but no one comes to my aid — the ${settlementType} goes on, indifferent to my struggle. [HELP FAILED - I am alone in this fight]`);
    }
  };

  return (
    <div
      style={{
        background: T.panelAlt,
        borderBottom: `1px solid ${T.border}`,
        padding: '8px 8px 6px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ ...tf, fontSize: 8, color, letterSpacing: 2 }}>{t(label === 'COMBAT' ? 'combatActions' : label === 'IN TOWN' ? 'inTownActions' : 'exploringActions')}</span>
        {location && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 10 }}>{locIcon}</span>
            <span style={{ ...tf, color: T.gold, fontSize: 8, letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: 90 }}>
              {location}
            </span>
          </span>
        )}
      </div>

      {/* Button grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {resolvedActions.map((btn) => {
          const disabled = isLoading || btn.hasItem === false;
          return (
            <button
              key={btn.label}
              title={btn.hasItem === false ? `Requires: ${btn.requiresItem}` : t(btn.label)}
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                if (btn.label === 'shop' && onOpenShop) { onOpenShop(); return; }
                if (btn.label === 'craft' && onOpenCraft) { onOpenCraft(); return; }
                if (btn.label === 'attack') { onAction(buildAttackText(equipped)); return; }
                onAction(btn.text);
              }}
              style={{
                background: 'transparent',
                border: `1px solid ${disabled ? T.border : color + '66'}`,
                color: disabled ? T.textFaint : T.text,
                padding: '5px 4px',
                fontSize: 10,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: "'Cinzel','Palatino Linotype',serif",
                letterSpacing: 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                transition: 'border-color 0.15s, color 0.15s',
                opacity: disabled ? 0.45 : 1,
                borderRadius: 2,
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = color + 'cc';
                  (e.currentTarget as HTMLButtonElement).style.color = color;
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = color + '66';
                  (e.currentTarget as HTMLButtonElement).style.color = T.text;
                }
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{btn.icon}</span>
              <span>{t(btn.label)}</span>
            </button>
          );
        })}

        {/* Call for Help — only in settlements during combat */}
        {settlementType && (
          <button
            disabled={isLoading}
            title={`Call for Help (${helpPct}% chance in this ${settlementType})`}
            onClick={() => !isLoading && handleCallForHelp()}
            style={{
              gridColumn: '1 / -1',
              background: 'transparent',
              border: `1px solid #7060a088`,
              color: isLoading ? T.textFaint : '#b090d0',
              padding: '5px 4px',
              fontSize: 10,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: "'Cinzel','Palatino Linotype',serif",
              letterSpacing: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'border-color 0.15s, color 0.15s',
              opacity: isLoading ? 0.45 : 1,
              borderRadius: 2,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#b090d0cc';
                (e.currentTarget as HTMLButtonElement).style.color = '#c8a8e8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#7060a088';
                (e.currentTarget as HTMLButtonElement).style.color = '#b090d0';
              }
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>📣</span>
            <span>Call for Help</span>
            <span style={{ fontSize: 8, opacity: 0.7, marginLeft: 2 }}>{helpPct}%</span>
          </button>
        )}
      </div>
    </div>
  );
}
