// ============================================================
// SUBCLASS SYSTEM
// Each class has 4 baseline skills (levels 1–9) and 3 subclasses
// chosen at level 10, each with 5 additional passive skills.
// All skills are narrator-resolved (same model as existing system).
// ============================================================

export interface SubclassDef {
  icon: string;
  flavour: string;
  desc: string;
  skills: string[];
  /** Narrative abilities granted to player.abilities on subclass selection */
  abilities: string[];
}

export const CLASS_BASELINE_SKILLS: Record<string, string[]> = {
  Warrior: ['iron_skin', 'power_strike', 'toughness', 'battle_rush'],
  Rogue:   ['shadowstep', 'pick_pocket', 'knife_throw', 'evasion'],
  Mage:    ['arcane_surge', 'mana_shield', 'spell_pierce', 'arcane_mind'],
  Cleric:  ['healing_light', 'bless', 'ward_undead', 'smite_evil'],
};

export const SUBCLASSES: Record<string, Record<string, SubclassDef>> = {

  // ─── WARRIOR ───────────────────────────────────────────────
  Warrior: {
    Berserker: {
      icon: '🩸',
      flavour: 'Rage is your armour.',
      desc: 'You fight hardest when the blood is flowing. Punishment fuels your fury rather than slowing it.',
      skills: ['berserker_rage', 'blood_frenzy', 'frenzied_strikes', 'war_shout', 'death_defiant'],
      abilities: ['Bloodlust', 'Iron Will', 'The Last to Fall'],
    },
    Knight: {
      icon: '🛡️',
      flavour: 'You are the wall between the weak and the abyss.',
      desc: 'Honour, discipline, and a shield held high. You endure what others cannot and inspire those at your side.',
      skills: ['shield_mastery', 'rally', 'mounted_charge', 'warlords_presence', 'honourable_duel'],
      abilities: ['Oath of Protection', 'Shield of the Realm', 'Chivalric Code'],
    },
    Monk: {
      icon: '👊',
      flavour: 'Your body is the instrument of discipline perfected.',
      desc: 'You need no weapon. Through years of training your hands, mind, and breath have become something lethal.',
      skills: ['iron_fists', 'deflect', 'stunning_blow', 'chi_focus', 'unbreakable'],
      abilities: ['Empty Hand', 'Breath of Stillness', 'One With the Strike'],
    },
  },

  // ─── ROGUE ─────────────────────────────────────────────────
  Rogue: {
    Assassin: {
      icon: '🗡️',
      flavour: 'One strike. One death.',
      desc: 'You do not fight — you end. Precision, poison, and patience are your only tools.',
      skills: ['venom_coat', 'blade_dance', 'ghost_walk', 'assassinate', 'smoke_bomb'],
      abilities: ['Mark of Death', "Phantom's Patience", "Poisoner's Eye"],
    },
    Thief: {
      icon: '💰',
      flavour: 'The world owes you. You\'re just collecting.',
      desc: 'Gold, locks, and loose lips — the world is full of things people don\'t deserve to keep.',
      skills: ['master_thief', 'lockmaster', 'silver_tongue', 'fortune_finder', 'crowd_vanish'],
      abilities: ['Light Fingers', 'Street Wisdom', "Fence's Tongue"],
    },
    Ranger: {
      icon: '🏹',
      flavour: 'The wilderness is your ally.',
      desc: 'You read the land like others read words. Distance is your friend and nothing catches you off guard.',
      skills: ['keen_eye', 'hunter_mark', 'wilderness_born', 'rapid_shot', 'predator'],
      abilities: ["Hunter's Patience", 'Wilderness Sight', 'First Blood'],
    },
  },

  // ─── MAGE ──────────────────────────────────────────────────
  Mage: {
    Necromancer: {
      icon: '💀',
      flavour: 'Death is a resource.',
      desc: 'You have stared into the void and found it cooperative. The fallen serve you now.',
      skills: ['raise_dead', 'life_drain', 'bone_shield', 'death_pact', 'death_aura'],
      abilities: ['Death Sense', 'Undead Command', 'Veil Walker'],
    },
    Elementalist: {
      icon: '⚡',
      flavour: 'Fire. Ice. Lightning. The elements do not discriminate.',
      desc: 'You have mastered the raw forces of the world and bend them to your will with terrifying efficiency.',
      skills: ['chain_lightning', 'overcharge', 'elemental_mastery', 'arcane_nova', 'archmages_will'],
      abilities: ['Storm Caller', 'Force of Nature', 'Arcane Resonance'],
    },
    Illusionist: {
      icon: '🌀',
      flavour: 'They see what you want them to see.',
      desc: 'Reality is a negotiation. You are a very persuasive negotiator.',
      skills: ['phantom_double', 'charm', 'vanish', 'mind_shatter', 'time_stop'],
      abilities: ['Master of Faces', 'Fractured Reality', 'The Unseen Hand'],
    },
  },

  // ─── CLERIC ────────────────────────────────────────────────
  Cleric: {
    Paladin: {
      icon: '⚔️',
      flavour: 'Faith is your shield. Righteousness is your blade.',
      desc: 'You carry divine fire into battle. Evil recoils from your presence and your allies stand taller beside you.',
      skills: ['divine_strike', 'divine_aegis', 'lay_on_hands', 'sacred_charge', 'holy_wrath'],
      abilities: ['Holy Aura', 'Divine Mandate', 'Blessed Blade'],
    },
    Priest: {
      icon: '✨',
      flavour: 'The wounded come to you. You do not turn them away.',
      desc: 'Healing is your calling. Where others fall you mend, restore, and keep the fight alive.',
      skills: ['greater_mend', 'group_heal', 'divine_shield', 'resurrection_light', 'purify'],
      abilities: ["Healer's Touch", 'Voice of Comfort', 'Sacred Trust'],
    },
    Inquisitor: {
      icon: '🔥',
      flavour: 'Evil does not hide from the Light. You make sure of it.',
      desc: 'You hunt what others fear to name. Lies cannot survive your gaze and corruption cannot survive your judgement.',
      skills: ['holy_interrogation', 'exorcise', 'divine_judgement', 'inquisitor_mark', 'holy_storm'],
      abilities: ['Truth Seeker', 'Divine Authority', 'Mark of the Hunted'],
    },
  },
};

// ─── FULL SKILL DESCRIPTION LOOKUP ─────────────────────────────────────────
// Used by narrator prompt to describe what the player's unlocked skills do.
// Baseline + all subclass skills combined.

export const ALL_SUBCLASS_SKILL_DESCRIPTIONS: Record<string, string> = {

  // ── Warrior Baseline ──
  iron_skin:    'Iron Skin (reduce all incoming damage by 1 permanently)',
  power_strike: 'Power Strike (chance to deal double damage on a heavy swing)',
  toughness:    'Toughness (max HP +20 permanently)',
  battle_rush:  'Battle Rush (first attack each combat deals +50% damage)',

  // ── Berserker ──
  berserker_rage:   'Berserker Rage (below 30% HP, deal triple damage)',
  blood_frenzy:     'Blood Frenzy (each kill in combat heals 15 HP)',
  frenzied_strikes: 'Frenzied Strikes (each consecutive attack on the same enemy deals +15% more damage, stacking)',
  war_shout:        'War Shout (stagger all enemies at combat start; they deal 20% less damage for 2 turns)',
  death_defiant:    'Death Defiant (once per dungeon, survive a killing blow at 1 HP and immediately counterattack)',

  // ── Knight ──
  shield_mastery:   'Shield Mastery (equipped shields grant +2 additional DEF; chance to block incoming attacks)',
  rally:            'Rally (restore 20 HP at the start of each combat)',
  mounted_charge:   'Mounted Charge (first attack each combat deals double damage)',
  warlords_presence:'Warlord\'s Presence (weaker enemies may flee; NPCs visibly respect your authority)',
  honourable_duel:  'Honourable Duel (enemies focus you in combat — companions take 50% less damage)',

  // ── Monk ──
  iron_fists:    'Iron Fists (unarmed attacks deal STR×2 damage, narrated as disciplined strikes)',
  deflect:       'Deflect (30% chance per turn to deflect a melee attack using speed alone)',
  stunning_blow: 'Stunning Blow (each attack has a chance to stun the enemy, skipping their next action)',
  chi_focus:     'Chi Focus (spend 10 HP to surge power; next attack deals +80% damage)',
  unbreakable:   'Unbreakable (once per dungeon, survive a killing blow and stabilise at 1 HP through sheer will)',

  // ── Rogue Baseline ──
  shadowstep:  'Shadowstep (vanish and reappear; next attack auto-crits)',
  pick_pocket: 'Pick Pocket (steal gold from enemies without entering combat)',
  knife_throw: 'Knife Throw (open combat at range with an AGI-based thrown dagger)',
  evasion:     'Evasion (+20% dodge chance — small foes often miss entirely)',

  // ── Assassin ──
  venom_coat:  'Venom Coat (attacks inflict poison; enemies lose HP each turn)',
  blade_dance: 'Blade Dance (strike twice per turn against a single target)',
  ghost_walk:  'Ghost Walk (25% chance to negate any incoming attack)',
  assassinate: 'Assassinate (one-hit-kill chance on weakened targets struck from concealment)',
  smoke_bomb:  'Smoke Bomb (guaranteed escape from any combat — no retribution)',

  // ── Thief ──
  master_thief:  'Master Thief (double all gold from combat and theft; merchants recognise your name)',
  lockmaster:    'Lockmaster (open locked doors and containers without keys)',
  silver_tongue: 'Silver Tongue (better prices when bargaining; talk out of some combats)',
  fortune_finder:'Fortune Finder (chance to discover bonus gold in any environment)',
  crowd_vanish:  'Crowd Vanish (slip away from any non-combat situation before consequences land)',

  // ── Ranger ──
  keen_eye:       'Keen Eye (never surprised; always act first, can read enemy intent before combat)',
  hunter_mark:    'Hunter Mark (marked target takes +30% damage from all your attacks)',
  wilderness_born:'Wilderness Born (no penalties in wilderness; food, water, shelter always findable)',
  rapid_shot:     'Rapid Shot (three quick ranged strikes per turn at slightly reduced damage each)',
  predator:       'Predator (always know an enemy\'s HP status; enemies cannot flee or call for aid)',

  // ── Mage Baseline ──
  arcane_surge: 'Arcane Surge (once per combat, cast one spell at zero cost)',
  mana_shield:  'Mana Shield (invisible shield absorbs 15 damage before HP is hit)',
  spell_pierce: 'Spell Pierce (spells ignore half of enemy magical resistance)',
  arcane_mind:  'Arcane Mind (INT permanently added to WIL — your mind is your armour)',

  // ── Necromancer ──
  raise_dead:  'Raise Dead (after any kill, summon the fallen as an undead minion that fights for you)',
  life_drain:  'Life Drain (each turn, siphon 15 HP from your target)',
  bone_shield: 'Bone Shield (your minion absorbs one hit per combat completely)',
  death_pact:  'Death Pact (if you fall, your minion sacrifices itself to revive you at 30% HP — once per dungeon)',
  death_aura:  'Death Aura (undead enemies are unnerved; they deal 30% less damage and may hesitate)',

  // ── Elementalist ──
  chain_lightning:    'Chain Lightning (lightning leaps between up to three targets in a single cast)',
  overcharge:         'Overcharge (sacrifice 10 HP for +60% damage on next spell)',
  elemental_mastery:  'Elemental Mastery (spells exploit enemy weaknesses automatically)',
  arcane_nova:        'Arcane Nova (release a pulse of raw arcane energy hitting all enemies)',
  archmages_will:     'Archmage\'s Will (all spells auto-crit on every cast)',

  // ── Illusionist ──
  phantom_double: 'Phantom Double (project a decoy — 50% chance the enemy attacks it instead)',
  charm:          'Charm (temporarily bend one enemy to your will — they fight for you this combat)',
  vanish:         'Vanish (become imperceptible; end any combat without damage or pursuit)',
  mind_shatter:   'Mind Shatter (fracture an enemy\'s focus — their next 3 attacks deal half damage)',
  time_stop:      'Time Stop (the world freezes — enemies cannot act for 3 turns, once per dungeon)',

  // ── Cleric Baseline ──
  healing_light: 'Healing Light (restore 25 HP in combat through focused prayer)',
  bless:         'Bless (invoke divine favour — next attack deals WIL×2 bonus damage)',
  ward_undead:   'Ward Undead (the undead recoil from your presence — they deal 30% less damage)',
  smite_evil:    'Smite Evil (strikes against undead and demonic foes deal double damage)',

  // ── Paladin ──
  divine_strike: 'Divine Strike (weapon strikes carry holy fire — bonus damage and fear against evil)',
  divine_aegis:  'Divine Aegis (the first strike against you each combat is absorbed by faith)',
  lay_on_hands:  'Lay on Hands (fully restore HP once per dungeon — self or ally)',
  sacred_charge: 'Sacred Charge (open each combat with a holy strike dealing WIL×3 damage)',
  holy_wrath:    'Holy Wrath (below 40% HP, divine fury surges — WIL×2 bonus damage until healed)',

  // ── Priest ──
  greater_mend:        'Greater Mend (restore 45 HP mid-combat)',
  group_heal:          'Group Heal (at the start of each floor, restore WIL×3 HP to yourself and companions)',
  divine_shield:       'Divine Shield (a ward absorbs 25 damage each combat before HP is touched)',
  resurrection_light:  'Resurrection Light (should you fall, divine mercy returns you at 50% HP — once per dungeon)',
  purify:              'Purify (instantly cleanse all status effects with a spoken word)',

  // ── Inquisitor ──
  holy_interrogation: 'Holy Interrogation (NPCs cannot deceive you; hidden truths surface)',
  exorcise:           'Exorcise (instantly destroy undead enemies below 30% HP with divine authority)',
  divine_judgement:   'Divine Judgement (first strike against evil-aligned enemies deals triple damage)',
  inquisitor_mark:    'Inquisitor\'s Mark (mark a target — all your attacks deal +40% damage against them)',
  holy_storm:         'Holy Storm (unleash WIL-based holy devastation on all enemies simultaneously)',
};
