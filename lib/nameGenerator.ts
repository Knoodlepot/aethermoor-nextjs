/**
 * NPC Name Generator
 * Produces a seeded, shuffled pool of fantasy names for each character.
 * Seeded from player name+class so every new game gets a unique cast.
 * Excludes common Claude AI defaults (Voss, Corvin, Aldric, Mira, etc.)
 */

const NAME_POOL: string[] = [
  // Nordic / Germanic
  'Bjorn', 'Sigrid', 'Halvard', 'Ragna', 'Ulf', 'Astrid', 'Gunnar', 'Freya',
  'Leif', 'Ingrid', 'Torsten', 'Solveig', 'Ragnar', 'Hilde', 'Erland', 'Dagny',
  'Sven', 'Brynja', 'Knute', 'Vigdis', 'Orm', 'Ragnhild', 'Ivar', 'Gudrun',

  // Celtic / Gaelic
  'Caerwyn', 'Bran', 'Niamh', 'Cormac', 'Aoife', 'Fergus', 'Saoirse', 'Ossian',
  'Deirdre', 'Fionn', 'Bronwen', 'Caelan', 'Eithne', 'Lorcan', 'Siobhan', 'Taliesin',
  'Morvenna', 'Ewan', 'Rhiannon', 'Griffith',

  // Mediterranean / Southern
  'Marco', 'Lucia', 'Dante', 'Elia', 'Matteo', 'Sera', 'Gianni', 'Rosa',
  'Silvano', 'Caterina', 'Luca', 'Fiora', 'Benito', 'Orla', 'Salvio', 'Gemma',
  'Cosimo', 'Ines', 'Renata', 'Fulvio',

  // Slavic / Eastern European
  'Zoran', 'Vesna', 'Mirko', 'Dubravka', 'Drazan', 'Ivanka', 'Goran', 'Slavica',
  'Ratko', 'Borka', 'Neven', 'Zlata', 'Vojko', 'Branka', 'Danko', 'Milena',
  'Radovan', 'Zorka', 'Velimir', 'Dragica',

  // Eastern / Far-Eastern influence
  'Kira', 'Dayo', 'Takeda', 'Yuna', 'Hiro', 'Suki', 'Renjiro', 'Mei',
  'Kenji', 'Tomoe', 'Daichi', 'Yori', 'Hayato', 'Nari', 'Isamu', 'Sena',

  // African / West African influence
  'Kofi', 'Adaeze', 'Kwame', 'Fatou', 'Seun', 'Aminata', 'Chidi', 'Ama',
  'Babatunde', 'Kemi', 'Emeka', 'Ngozi', 'Oluwole', 'Ife',

  // Invented / neutral fantasy
  'Taryn', 'Elwick', 'Prynn', 'Galeth', 'Sorra', 'Wendel', 'Caith', 'Orwin',
  'Tessaly', 'Brek', 'Marro', 'Suryn', 'Pellin', 'Wraith', 'Anwen', 'Gault',
  'Oswyn', 'Draven', 'Callum', 'Fenna', 'Hawthorn', 'Lidda', 'Morwen', 'Peryn',
];

/** Simple string hash → positive integer */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

/** Seeded LCG random number generator */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * Generate a shuffled name pool seeded from a string.
 * @param seed  Player name + class (unique per character)
 * @param count Number of names to return
 */
export function generateNamePool(seed: string, count: number): string[] {
  const rand = lcg(hashSeed(seed));
  const pool = [...NAME_POOL];

  // Fisher-Yates shuffle with seeded RNG
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}
