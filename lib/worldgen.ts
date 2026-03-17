
// ============================================================
// AETHERMOOR WORLD GENERATION — ported from legacy index.html
// ============================================================

import { CLASSES, FACTIONS } from './constants';
import { mulberry32, stringToSeed } from './seedrandom';

type ClassKey = keyof typeof CLASSES;

// ── Helpers ──────────────────────────────────────────────────
// These will be reassigned inside generateProceduralWorld to use the correct RNG
let pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
let rand = (mn: number, mx: number) => mn + Math.random() * (mx - mn);
let clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
let angle = () => Math.random() * Math.PI * 2;

// ── Settlement types ─────────────────────────────────────────
const SETTLEMENT_TYPES: Record<string, { label: string; icon: string; popRange: [number, number]; industries: string[] }> = {
  capital:       { label: 'Capital City',    icon: '🏰', popRange: [5000, 15000], industries: ['Imperial Banking', 'High Alchemy', 'Grand Courts', 'Arcane Academy'] },
  city:          { label: 'Major City',      icon: '🏙️', popRange: [1500, 4500],  industries: ['Steel-work', 'Shipbuilding', 'Alchemy', 'Textiles'] },
  town:          { label: 'Market Town',     icon: '🏘️', popRange: [500, 1200],   industries: ['Brewing', 'Pottery', 'Blacksmithing', 'Livestock Market'] },
  village:       { label: 'Village',         icon: '🏡', popRange: [100, 400],    industries: ['Timber', 'Herbalism', 'Milling', 'Fishing'] },
  hamlet:        { label: 'Hamlet',          icon: '🛖', popRange: [20, 80],      industries: ['Peat Cutting', 'Charcoal Burning', 'Waystation', 'Trapping'] },
  farm_arable:   { label: 'Arable Farm',     icon: '🌾', popRange: [5, 15],       industries: ['Wheat', 'Barley', 'Rye', 'Vegetables'] },
  farm_livestock:{ label: 'Livestock Farm',  icon: '🐄', popRange: [5, 15],       industries: ['Cattle', 'Sheep', 'Poultry', 'Pig Rearing'] },
  farm_mixed:    { label: 'Mixed Farm',      icon: '🚜', popRange: [8, 20],       industries: ['Dairy', 'Grain', 'Orchards', 'Beekeeping'] },
  poi_forest:    { label: 'Ancient Forest',  icon: '🌲', popRange: [0, 0],        industries: ['Wild Game', 'Rare Herbs', 'Timber'] },
  poi_cave:      { label: 'Cave',            icon: '🕳️', popRange: [0, 0],        industries: ['Ore', 'Crystals', 'Smuggled Goods'] },
  poi_ruins:     { label: 'Ancient Ruins',   icon: '🏚️', popRange: [0, 0],        industries: ['Archaeology', 'Scavenging', 'Forbidden Lore'] },
  poi_wood:      { label: 'Dark Wood',       icon: '🌳', popRange: [0, 0],        industries: ['Charcoal', 'Hunting', 'Witchcraft'] },
  poi_shrine:    { label: 'Forgotten Shrine',icon: '⛩️', popRange: [0, 0],        industries: ['Pilgrimage', 'Ancient Magic', 'Offerings'] },
  poi_library:   { label: 'Lost Library',     icon: '📚', popRange: [0, 0],        industries: ['Lore', 'Secrets', 'Ancient Tomes'] },
  poi_observ:    { label: 'Haunted Observatory', icon: '🔭', popRange: [0, 0],     industries: ['Stargazing', 'Prophecy', 'Arcane Research'] },
  poi_spring:    { label: 'Hidden Spring',    icon: '💧', popRange: [0, 0],        industries: ['Healing', 'Mystic Waters', 'Pilgrimage'] },
  poi_battle:    { label: 'Ancient Battlefield', icon: '⚔️', popRange: [0, 0],     industries: ['Ghosts', 'Relics', 'History'] },
  poi_anomaly:   { label: 'Arcane Anomaly',   icon: '🌀', popRange: [0, 0],        industries: ['Wild Magic', 'Rifts', 'Strange Phenomena'] },
};

// ── Villain data ─────────────────────────────────────────────
const VILLAIN_NAMES = [
  'Xfu', 'Malachar', 'Seraveth', 'Vorthun', 'Kael the Hollow',
  'The Pale Duchess', 'Grimoth', 'Saervyn', 'Lord Duskmore', 'The Eternal One',
  'Varek', 'Morvaine', 'Silthar the Undying', 'The Nameless King', 'Uldrath',
  'Cressida Vane', 'The Faceless', 'Mordecai Voss', 'Sybilline', 'The Architect',
];
const LICH_DESCRIPTORS = [
  'the Lich', 'the Undying', 'the Deathless', 'the Pale', 'Lich-Lord',
  'the Eternal', 'the Unbound', 'the Ancient', 'the Hollow', 'Lich-Queen',
];
const VILLAIN_ORIGINS = [
  'a scholar who refused death after decades seeking immortality',
  'a betrayed general entombed alive by a jealous king',
  'a cleric whose faith curdled into something darker',
  'a child stolen by demons who grew to become one',
  'a hero who bargained with death and lost',
  'a noble who traded their soul for a crown',
  'an exile who found power in the world\'s forgotten places',
  'a twin who absorbed their sibling\'s soul at birth',
  'a prisoner who spent centuries plotting revenge',
  'a devoted lover driven mad by grief',
  'a failed god who descended into mortality bitter and furious',
  'a brilliant arcanist who cracked open something that should stay closed',
  'a soldier cursed on a forgotten battlefield',
  'a merchant who sold one too many dangerous things',
  'an orphan raised in a death cult who rose to lead it',
  'a dying king who found a way to refuse the end',
  'a cartographer who mapped a place no living thing should know',
  'a healer whose patients kept dying until they stopped caring',
  'an architect who built their own tomb and climbed back out',
  'a saint whose miracles began demanding blood in return',
];
const VILLAIN_WEAKNESSES = [
  'their original name, spoken in the place of their first death',
  'an artifact locked in the Silver Hand vaults',
  'the phylactery hidden in their childhood home',
  'a blade forged from their own bones',
  'a song their mother sang — it unravels their concentration',
  'sunlight channelled through the Ember Circle\'s sacred lens',
  'the last living person who remembers their mortal life',
  'a ritual requiring their willing death — they must choose it',
  'a specific holy relic thought destroyed centuries ago',
  'their reflection in a mirror made from shadowglass',
  'the tears of someone they once genuinely loved',
  'a sigil only the Arcane Academy knows how to draw',
  'the Crown\'s Watch charter bearing the old king\'s seal',
  'a poison brewed from herbs that only grow on their grave',
  'iron from a meteorite that fell the night they were born',
  'the truth of what they did to earn their power',
  'a key that opens the door they sealed themselves behind',
  'fire taken directly from the Ember Circle\'s eternal flame',
  'the blessing of all ten factions spoken simultaneously',
  'their own heart, preserved in a jar somewhere they\'ve forgotten',
];
const VILLAIN_ALLIES_BETRAYAL = [
  { ally: 'Brother Edran, a Silver Hand monk who defected', betrayal: 'He is already a thrall — he leads you directly into a trap' },
  { ally: 'Mira the Cartographer, who mapped the villain\'s lair', betrayal: 'Her maps are deliberately wrong — she serves the villain willingly' },
  { ally: 'Lord Ashton of the Crown\'s Watch, who claims to have evidence', betrayal: 'The evidence is fabricated — he wants the power for himself' },
  { ally: 'The Archivist, who claims to know the weakness', betrayal: 'She is the villain\'s original apprentice, loyal to the end' },
  { ally: 'A reformed cultist named Daven who escaped the inner circle', betrayal: 'He never truly escaped — he was sent to observe you' },
  { ally: 'Captain Solen of the Iron Conclave, who lost men to the villain', betrayal: 'He made a deal — his life for your location' },
  { ally: 'The ghost of the villain\'s first victim, who guides you', betrayal: 'The ghost is a construct, showing you what you want to see' },
  { ally: 'A Shadowmere Guild agent who infiltrated the villain\'s operation', betrayal: 'She switched sides when the money got better' },
  { ally: 'An ancient spirit bound to the land who offers guidance', betrayal: 'The spirit is bound to the villain — it has no choice' },
  { ally: 'A child who survived the villain\'s first attack and knows the lair', betrayal: 'There was no child — it was the villain wearing a friendly face' },
  { ally: 'A dying Thornwood Druid who passed on forbidden knowledge', betrayal: 'The knowledge is a curse — it slowly turns you toward the villain\'s cause' },
  { ally: 'The villain\'s estranged sibling who wants them stopped', betrayal: 'They want the power too — they planned to take it after you weakened the villain' },
  { ally: 'A Sea Wolf captain who transported the villain\'s cargo and regrets it', betrayal: 'He\'ll sell you out the moment a better offer arrives' },
  { ally: 'A disillusioned court mage who knows the ritual\'s flaw', betrayal: 'He is testing you — if you\'re not strong enough he won\'t help' },
  { ally: 'An Ember Circle mage exiled for knowing too much', betrayal: 'She is the villain\'s creature — exiled deliberately to get close to you' },
  { ally: 'The keeper of the old archive who found the weakness by accident', betrayal: 'He burned the archive to protect himself — told you what you wanted to hear' },
  { ally: 'A Merchant\'s Compact factor who funded the villain unknowingly', betrayal: 'Now complicit, they\'ll do anything to bury the evidence including you' },
  { ally: 'A warrior from a destroyed village who swore vengeance', betrayal: 'Vengeance became obsession — they plan to become what they\'re fighting' },
  { ally: 'The villain\'s own reflection, somehow freed and opposed to them', betrayal: 'Reflections have no loyalty — it mirrors whoever holds more power' },
  { ally: 'A paladin who claims divine guidance led them to you', betrayal: 'The divine guidance is real but the god giving it serves the villain' },
];
const ACT1_HOOKS = [
  'Fishing villages along the coast go silent one by one — no bodies, no struggle, just empty hearths',
  'Travellers on the King\'s Road report a figure in the mist who asks only one question: their name',
  'Children in Millhaven have begun dreaming the same dream — a tower with no door and something inside that knows their faces',
  'The Silver Hand has closed its temple doors and will say nothing about why',
  'Refugees from the east speak of soldiers who don\'t bleed and don\'t stop',
  'A merchant arrived in Ashford carrying goods from a town that burned down six months ago',
  'The Ember Circle has recalled all its members from the field — something called them back',
  'The King\'s ravens stopped arriving at the Capital three weeks ago',
  'Flowers near Thornwick bloom black overnight and wither by morning',
  'An old man in Millhaven who claims to have met the villain once refuses to speak their name but weeps at sundown',
  'Irongate\'s garrison doubled overnight — the soldiers won\'t say why',
  'A road that appears on no map leads northeast from Ashford — travellers who take it don\'t return',
  'The Arcane Academy has sealed its tower and posted armed guards',
  'Duskwall\'s underground market has stopped trading in a specific commodity — life',
  'Three Crown\'s Watch agents were found dead on the Golden Road, their reports missing',
  'A strange star appeared in the sky above the Capital and hasn\'t moved in a fortnight',
  'Someone has been buying every map of the old ruins in every town from Millhaven to Solara',
  'Dogs refuse to enter the eastern quarter of Irongate — they sit at the boundary and howl',
  'A travelling bard knows a song that causes listeners to weep without knowing why — she learned it from a stranger',
  'Thornwood Druids have abandoned their grove near Thornwick — the trees are still screaming',
];
const ACT2_ESCALATIONS = [
  'The Crown sends a sealed missive to every settlement — what\'s in it is not for public knowledge',
  'A faction publicly declares neutrality — which means they\'ve already chosen a side',
  'The villain makes their first direct move — an assassination, a declaration, or a display of power that cannot be ignored',
  'The player\'s own faction is threatened — members captured, headquarters attacked, leadership compromised',
  'A location is consumed entirely — not attacked, not burned, simply gone, leaving a crater and silence',
  'The villain sends a personal message to the player — they know who you are',
  'An unexpected faction ally breaks ranks and seeks out the player privately',
  'The roads between cities become genuinely dangerous — travel encounters shift darker',
  'A faction champion falls — someone the player may have met, dead under impossible circumstances',
  'The villain demonstrates the weakness is protected — they know you know',
  'A second front opens — the villain was a distraction for something worse',
  'The Crown falls silent — the Capital stops responding to messages entirely',
  'Prices collapse in Aethermoor as merchants flee — the Compact\'s infrastructure is cracking',
  'The Thornwood Druids send a single messenger with a single sentence and then vanish',
  'A confrontation with the villain\'s lieutenant — a named, powerful enemy with their own agenda',
  'The player discovers the villain\'s origin — and it is uncomfortably sympathetic',
  'The ally appears for the first time, offering help, warning, or both',
  'A faction the player trusted is revealed to have been compromised from the beginning',
  'The villain offers a deal — it is genuinely tempting',
  'Three separate factions independently conclude the same thing: only the player can stop this',
];
const ACT3_CONFRONTATIONS = [
  'The path to the villain\'s lair is revealed — it requires an item, an ally, or a sacrifice',
  'The betrayal lands — the player must decide how to recover and whether to forgive',
  'The villain\'s base must be reached through a gauntlet of their strongest servants',
  'A faction gives everything they have left to get the player to the door',
  'The weakness must be assembled or earned — scattered across the world',
  'The player must choose which faction to take with them — they cannot bring all',
  'The villain makes a final offer before the confrontation — surrender or join',
  'The lair itself is a test — designed to destroy heroes before they reach the villain',
  'A second villain is revealed — the original was just a servant',
  'The player must destroy something they value to proceed',
  'An ally sacrifices themselves to open the way',
  'The confrontation begins before the player is ready — the villain moves first',
  'The weakness only works if the player themselves delivers it — no proxy, no trick',
  'The lair shifts and changes — it is alive and loyal to the villain',
  'The final approach requires the player to pass through every major location one last time',
  'The villain was right about something — the player must decide if that changes anything',
  'A faction turns at the last moment — for or against the player',
  'The player faces a version of themselves — what they could become on the dark path',
  'The villain cannot be killed — only contained, transformed, or bargained with',
  'Everything that led here was the villain\'s plan — including the player\'s arrival',
];
const ACT4_COMPLICATIONS = [
  'The ally\'s betrayal is exposed — and the player saw it coming',
  'A faction the player trusted switches sides to the villain',
  'The villain\'s true goal is revealed: far worse than anyone suspected',
  'The player\'s home base is destroyed in a targeted strike',
  'A beloved NPC is taken hostage to stop the player',
  'A cure or solution the player sought is revealed as a trap',
  'Inside information the villain has can only come from a spy in the player\'s circle',
  'The villain offers a terrible compromise — accept and half the world is spared',
  'An ancient prophecy names the player as the one who opens the door for the villain',
  'The player\'s greatest ally is corrupted and must be faced in battle',
  'The villain publicly frames the player, turning civilians against them',
  'A catastrophe strikes during the player\'s absence — they could not save everyone',
  'The weapon or artifact needed to stop the villain is lost or destroyed',
  'Factions that should be helping each other begin to fracture under pressure',
  'The villain sends a message: they know the player\'s next move before they make it',
  'A dark mirror version of the player — shaped by the villain — confronts them',
  'The sky changes. No one sleeps. The clock is running out faster than believed',
  'An unlikely figure offers powerful but clearly corrupted help — at a cost',
  'The truth about the villain\'s origin reframes everything the player has done',
  'The player\'s reputation shatters in the eyes of those who mattered most',
];
const ACT5_REVELATIONS = [
  'A surviving fragment of the ally\'s true self points the way forward',
  'The villain\'s lair can only be reached via a path no one has walked in a century',
  'A final faction chooses to stand with the player — for reasons of their own',
  'The weapon that can hurt the villain requires the player to sacrifice something real',
  'A secret passage to the lair was hidden in plain sight all along',
  'The villain\'s one weakness was encoded in the first vision the player ever had',
  'A map to the lair is written in the language of the villain\'s first victims',
  'The player must gather three things to break the lair\'s defences — each held by a faction',
  'An elder figure reveals they survived the villain once before — barely',
  'The lair shifts and adapts — the player must find how to anchor it',
  'Every faction now has a role to play; the player must unite them for the assault',
  'The final path opens when the player forgives the betrayer — or condemns them',
  'The villain expects the player to come alone. They\'re right.',
  'A ritual performed at the right location will weaken the villain\'s power before the fight',
  'The player\'s own history is the key: something from their starting moment matters now',
  'An NPC the player met in Act 1 knows something they never told anyone',
  'The lair can only be entered at a specific moment — and that moment is almost here',
  'Each faction sacrifice weakens one of the villain\'s defences — coordination is the weapon',
  'The betrayer, facing death, gives the player the one piece of intelligence that changes everything',
  'The path through is not through power — it is through understanding the villain\'s original wound',
];
const FINAL_TONES = [
  { tone: 'triumphant', desc: 'The villain falls. The world breathes again. The player\'s name becomes legend.' },
  { tone: 'pyrrhic',    desc: 'Victory comes at devastating cost — lives lost, something precious sacrificed, the wound permanent.' },
  { tone: 'ambiguous',  desc: 'The villain is stopped but not destroyed. Seeds of doubt remain. Was this a true ending?' },
  { tone: 'tragic',     desc: 'The player succeeds but cannot celebrate — the cost was someone they loved or a truth they cannot unlearn.' },
  { tone: 'redemptive', desc: 'The villain is not destroyed but changed — saved, perhaps. Both leave different than they arrived.' },
  { tone: 'escape',     desc: 'The lair falls, the villain is sealed away, the player barely survives — it\'s over but barely.' },
  { tone: 'bittersweet',desc: 'The world is saved but the player\'s place in it has changed. There is no going home.' },
];

const PLOT_TEMPLATES = [
  {
    id: 'undead_king', title: 'The Undead King', icon: '💀', villainType: 'Lich',
    threatDesc: 'raises an undead army marching on the living',
    baseThreat: 'An army of the dead, growing with every fallen soldier',
    lichDescriptor: true,
    factionStake: { iron_conclave: 'Their warriors fall in battle and rise against them', silver_hand: 'Their holy power is the one thing holding the dead back', thornwood_druids: 'The dead soil poisons the forest from beneath' },
    lairOptions: ['the sunken catacombs beneath Duskwall harbour', 'a fortress of bone rising from the Ashford marshes', 'the ruined cathedral on the ridge above Irongate', 'a frozen necropolis buried under the Capital\'s oldest district', 'the hollowed-out mountain east of Solara City'],
    questTitle: 'The Dead Do Not Rest',
  },
  {
    id: 'dragon_pact', title: 'The Dragon Pact', icon: '🐉', villainType: 'Dragon',
    threatDesc: 'demands tribute and then conquest when refused',
    baseThreat: 'A dragon old enough to remember when Aethermoor was ash',
    lichDescriptor: false,
    factionStake: { iron_conclave: 'Their steel barely scratches dragon scale', merchants_compact: 'The tribute demands have bankrupted three towns already', crowns_watch: 'The Crown secretly paid the first tribute — and now owes more' },
    lairOptions: ['a volcanic caldera three days east of Solara', 'the ruins of a city the dragon burned a century ago and now sleeps in', 'a sea cliff fortress where the dragon watches the shipping lanes', 'the highest peak above Duskwall, perpetually wreathed in smoke', 'a dungeon the dragon uses as its personal treasury'],
    questTitle: 'What the Dragon Remembers',
  },
  {
    id: 'planar_rift', title: 'The Planar Rift', icon: '🌀', villainType: 'Demon Prince',
    threatDesc: 'tears reality apart as monsters pour through',
    baseThreat: 'A rift widening daily — what comes through grows stronger each time',
    lichDescriptor: false,
    factionStake: { arcane_council: 'They opened it — accidentally or not, they won\'t admit which', ember_circle: 'Their fire rituals are feeding the rift energy', thornwood_druids: 'The land around the rift is dying in ways they\'ve never seen' },
    lairOptions: ['the exact centre of the rift, accessible only by ritual', 'a tower the demon prince built on this side during a previous incursion', 'the Arcane Academy\'s sealed seventh basement', 'the place between places — a door only the demon can open from outside', 'the ruins where the original seal was broken'],
    questTitle: 'The Tear Between Worlds',
  },
  {
    id: 'usurper_king', title: 'The Usurper King', icon: '👑', villainType: 'Corrupt Noble',
    threatDesc: 'stages a coup and purges the rightful line',
    baseThreat: 'A throne stolen through assassination, betrayal and manufactured evidence',
    lichDescriptor: false,
    factionStake: { crowns_watch: 'Split down the middle — half serve the usurper, half the old crown', shadowmere_guild: 'Were hired for the original assassinations — now know too much', merchants_compact: 'Backed the usurper financially and cannot easily undo it', the_forgotten: 'They know every tunnel under the Capital — and they remember the old king\'s face' },
    lairOptions: ['the Capital palace itself, now a fortress', 'a black site prison where the rightful heirs are kept', 'the usurper\'s ancestral estate, three days from the Capital', 'a network of tunnels under the Capital that predates the city', 'the court itself — the villain is the institution now'],
    questTitle: 'A Crown of Knives',
  },
  {
    id: 'plague_god', title: 'The Plague God', icon: '☣️', villainType: 'Awakened Deity',
    threatDesc: 'spreads divine pestilence across the land',
    baseThreat: 'A god forgotten for good reason, remembering why it was worshipped',
    lichDescriptor: false,
    factionStake: { silver_hand: 'Their healing prayers are being answered — by the wrong god', thornwood_druids: 'The infected animals follow the plague god\'s will instinctively', arcane_council: 'They have records of the last time this happened — the records are terrible reading' },
    lairOptions: ['a temple the plague god is rebuilding from within its worshippers\' bones', 'the original site of the god\'s death — a city buried under Solara', 'a ship anchored offshore that no one who boards ever leaves', 'the god exists in the infection itself — there is no single lair', 'the Cathedral of the First Light, hollowed and repurposed'],
    questTitle: 'What the God Remembers',
  },
  {
    id: 'usurper_king2', title: 'The Architect\'s Game', icon: '🧩', villainType: 'The Architect',
    threatDesc: 'orchestrates every faction toward a secret ritual through hidden manipulation',
    baseThreat: 'A mastermind who has been preparing this for decades — nothing is coincidence',
    lichDescriptor: false,
    factionStake: { shadowmere_guild: 'Have been feeding the Architect information for years, thinking it a client', crowns_watch: 'The Architect wrote half their protocols — they are riddled with backdoors', arcane_council: 'The Architect was one of their own — the greatest student who ever left', the_forgotten: 'The Architect\'s plan accounts for every faction — except the ones with nothing to lose' },
    lairOptions: ['a room that exists in every building simultaneously — entered through a specific sequence of doors', 'the Architect\'s original office, untouched since they disappeared', 'the space beneath the Arcane Academy no one knew was there', 'a constructed space at the junction of every major road in Aethermoor', 'the ritual site — a place that only exists when the plan is complete'],
    questTitle: 'Every Move Was Theirs',
  },
  {
    id: 'shattered_crown', title: 'The Shattered Crown', icon: '⚔️', villainType: 'Warlord',
    threatDesc: 'tears Aethermoor apart through civil war',
    baseThreat: 'A kingdom fracturing — and someone making sure it never heals',
    lichDescriptor: false,
    factionStake: { iron_conclave: 'Mercenaries are getting very rich — which means they\'re not stopping it', crowns_watch: 'Without a unified crown they have no authority — they are dissolving', merchants_compact: 'Trade has collapsed — they want whoever wins to win quickly', the_forgotten: 'Every war makes refugees — and refugees find the Forgotten, or the Forgotten find them' },
    lairOptions: ['the front lines of the civil war, wherever the fighting is worst', 'a war camp the size of a small city', 'the disputed capital, half-ruined from the fighting', 'the villain\'s own fortress built from the wreckage of the old order', 'the place where the original peace was signed — and can only be signed again'],
    questTitle: 'The War That Feeds Itself',
  },
  {
    id: 'blood_moon_cult', title: 'The Blood Moon Cult', icon: '🌑', villainType: 'Prophet',
    threatDesc: 'orchestrates a ritual to blot out the sun forever',
    baseThreat: 'Thousands of willing followers and one terrible idea whose time has almost come',
    lichDescriptor: false,
    factionStake: { silver_hand: 'The cult recruited heavily from their lay followers — a wound they can\'t admit', the_forgotten: 'The cult offered outcasts belonging — and many took it', shadowmere_guild: 'Were hired to protect the prophet early on — they know where the ritual site is' },
    lairOptions: ['the ritual site atop the highest point in Aethermoor', 'a city the cult controls entirely — and no one outside knows', 'the prophet\'s original village, transformed beyond recognition', 'a cathedral built in three months by ten thousand hands', 'the dark of the moon — the ritual is the lair'],
    questTitle: 'When the Sun Forgets to Rise',
  },
  {
    id: 'drowned_god', title: 'The Drowned God', icon: '🌊', villainType: 'Elder Deity',
    threatDesc: 'awakens beneath the harbour cities, driving coastal populations mad with tidal whispers',
    baseThreat: 'Coastal madness, flooded lowland towns, fish that walk, priests speaking in bubbles',
    lichDescriptor: false,
    factionStake: { merchants_compact: 'Trade routes drowned; ships crewed by the sleepwalking drowned', thornwood_druids: 'The tide-cycle itself is breaking; old sea covenants are null', iron_conclave: 'Harbour fortresses crumbling as foundations dissolve' },
    lairOptions: ['the sunken cathedral thirty fathoms below the Bay of Ashenveil', 'a pocket of dry air at the bottom of the world\'s deepest lake', 'a submerged palace that surfaces only at the blood tide', 'the ribcage of a god-whale beached a century ago, now pulled back under', 'a coral labyrinth beneath the oldest harbour city'],
    questTitle: 'What the Tide Keeps',
  },
  {
    id: 'wild_hunt', title: 'The Wild Hunt', icon: '🦌', villainType: 'The Huntmaster',
    threatDesc: 'opens the old wild roads and declares the great hunt — mortals are the quarry',
    baseThreat: 'Night raids that leave no tracks, villages found empty save for a single antler planted in the earth',
    lichDescriptor: false,
    factionStake: { thornwood_druids: 'Old oaths with the fey roads are being called in — against the Druids', iron_conclave: 'Steel walls mean nothing; the Hunt passes through them like smoke', arcane_council: 'The magic enabling the hunt is older than the Academy\'s founding texts' },
    lairOptions: ['the Wild Court — a forest that moves and cannot be mapped', 'the First Hollow, where the hunt roads began ten thousand years ago', 'the Moonfield, accessible only when all three moons align', 'the Huntmaster\'s lodge, built from the bones of everything he has ever caught', 'a rift between Aethermoor and the fey realm, held open by a thorn-crown'],
    questTitle: 'Run No Longer',
  },
];

// ── World generation ─────────────────────────────────────────

export function generateProceduralWorld(seed?: string): any[] {
  // Use a seedable RNG for all worldgen randomness

  const rng = mulberry32(stringToSeed(seed || (Math.random() + Date.now()).toString()));
  // Override helpers to use this RNG
  pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  rand = (mn: number, mx: number) => mn + rng() * (mx - mn);
  clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
  angle = () => rng() * Math.PI * 2;
  const world: any[] = [];

  // Procedural name generator
  const syllables1 = ["Ash", "Bar", "Bel", "Cor", "Dar", "Eld", "Fen", "Gal", "Hal", "Ire", "Jar", "Kel", "Lor", "Mor", "Nor", "Orl", "Pen", "Quel", "Rav", "Sel", "Tar", "Ul", "Val", "Wyn", "Yar", "Zel", "Thal", "Vor", "Lan", "Mar", "Nym", "Ost", "Pry", "Quin", "Ril", "Syl", "Tor", "Um", "Var", "Wil", "Xan", "Yel", "Zor"];
  const syllables2 = ["a", "e", "i", "o", "u", "y", "ae", "ia", "io", "ea", "ai", "ou", "ui", "ei", "au", "oa", "eo", "eu", "ie", "oi", "ua", "io", "ey", "ay", "oo"];
  const syllables3 = ["ban", "brook", "crest", "dale", "fall", "gate", "hall", "keep", "mere", "mont", "moor", "ness", "peak", "rest", "rock", "shade", "shire", "stead", "stone", "vale", "watch", "wick", "wood", "ford", "field", "grove", "haven", "land", "marsh", "port", "reach", "ridge", "run", "spring", "strand", "thorn", "view", "well", "wind", "wold", "wynd", "den", "holt", "lyn", "moor", "pool", "ridge", "side", "ton", "ward", "way", "wynn"];
  const suffixes = ["", "ton", "ville", "burg", "stead", "port", "mouth", "field", "ford", "gate", "wick", "brook", "mere", "moor", "crest", "fall", "vale", "haven", "watch", "rock", "wood", "land", "marsh", "grove", "ridge", "run", "spring", "strand", "thorn", "view", "well", "wind", "wold", "den", "holt", "lyn", "pool", "side", "ward", "way", "wynn"];

  const usedNames = new Set<string>();
  function proceduralName(type: string = ""): string {
    let name = "";
    let tries = 0;
    do {
      const s1 = pick(syllables1);
      const s2 = pick(syllables2);
      const s3 = pick(syllables3);
      const suf = pick(suffixes);
      name = s1 + s2 + s3 + suf;
      // Optionally add type-based suffix for POIs
      if (type.startsWith("poi_")) {
        const label = SETTLEMENT_TYPES[type]?.label?.split(" ").pop();
        if (label && Math.random() < 0.5) name += " " + label;
      }
      tries++;
    } while (usedNames.has(name) && tries < 10);
    usedNames.add(name);
    return name;
  }

  const rulerFirst = ['Edmund','Mira','Aldric','Serafina','Tobias','Wren','Gareth','Isolde','Cormac','Elara','Branoc','Thessaly','Oswin','Veda','Radulf'];
  const rulerTitle = ['of the','the','Lord of','Lady of'];
  const traits = ['Wise','Stern','Kind','Greedy','Cautious','Ambitious','Pious','Ruthless','Fair','Eccentric'];
  const mkRuler = (place: string) => ({
    name: rulerFirst[Math.floor(rng() * rulerFirst.length)] + ' ' +
          rulerTitle[Math.floor(rng() * rulerTitle.length)] + ' ' +
          place.split(' ')[0],
    trait: traits[Math.floor(rng() * traits.length)],
  });

  const add = (type: string, forcedName?: string) => {
    const config = SETTLEMENT_TYPES[type];
    const n = forcedName || proceduralName(type);
    world.push({
      name: n, type, icon: config.icon,
      populace: Math.floor(rng() * (config.popRange[1] - config.popRange[0])) + config.popRange[0],
      industry: config.industries,
      ruler: mkRuler(n),
    });
  };

  add('capital', 'Aethermoor Capital');
  for (let i = 0; i < 6; i++)  add('city');
  for (let i = 0; i < 10; i++) add('town');
  for (let i = 0; i < 16; i++) add('village');
  for (let i = 0; i < 35; i++) add('hamlet');

  // Farms
  const farmTypes = ['farm_arable', 'farm_livestock', 'farm_mixed'];
  const farmRanges: Record<string, [number, number]> = { capital: [5, 7], city: [3, 5], town: [2, 3], village: [1, 2], hamlet: [0, 1] };
  world.slice().forEach((settlement) => {
    const [min, max] = farmRanges[settlement.type] || [0, 0];
    const count = min + Math.floor(Math.random() * (max - min + 1));
    for (let i = 0; i < count; i++) {
      const ft = farmTypes[Math.floor(Math.random() * farmTypes.length)];
      const config = SETTLEMENT_TYPES[ft];
      const farmName = proceduralName(ft);
      world.push({
        name: farmName, type: ft, icon: config.icon,
        parentSettlement: settlement.name,
        populace: Math.floor(Math.random() * (config.popRange[1] - config.popRange[0])) + config.popRange[0],
        industry: config.industries,
        ruler: mkRuler(farmName),
      });
    }
  });

  // POI counts
  const poiCounts: Record<string, number> = {
    poi_forest: 16, poi_cave: 20, poi_ruins: 16, poi_wood: 14, poi_shrine: 12,
    poi_library: 8, poi_observ: 8, poi_spring: 8, poi_battle: 8, poi_anomaly: 8
  };
  const mainSettlements = world.filter((s) => ['capital','city','town','village','hamlet'].includes(s.type));
  // --- Main quest POI integration ---
  const poiTypes = Object.keys(poiCounts);
  // Pick a random POI type for the main quest (weighted toward ruins, shrine, anomaly, library)
  const mainQuestPOITypes = ['poi_ruins','poi_shrine','poi_anomaly','poi_library','poi_observ'];
  const mainQuestPOIType = mainQuestPOITypes[Math.floor(rng() * mainQuestPOITypes.length)];
  const mainQuestPOIName = proceduralName(mainQuestPOIType);
  const mainQuestPOIBoss = proceduralName('boss');
  const mainQuestPOILoot = proceduralName('loot');
  const mainQuestSettlement = mainSettlements[Math.floor(rng() * mainSettlements.length)];
  // Add the main quest POI
  world.push({
    name: mainQuestPOIName,
    type: mainQuestPOIType,
    icon: SETTLEMENT_TYPES[mainQuestPOIType].icon,
    populace: 0,
    industry: SETTLEMENT_TYPES[mainQuestPOIType].industries,
    parentSettlement: mainQuestSettlement.name,
    isPOI: true,
    isMainQuestPOI: true,
    miniBoss: mainQuestPOIBoss,
    treasureLoot: mainQuestPOILoot,
    bossDefeated: false,
    ruler: null,
    questFlavour: `This place is central to the main quest. Legends say it holds the key to defeating the great evil. A puzzle or riddle bars the way, and only those who solve it may claim the reward.`,
    questPuzzle: `A mysterious mechanism, ancient inscription, or magical barrier blocks the final chamber. The solution is hinted at by clues scattered across the land.`,
    questReward: `A unique artifact or knowledge needed to progress the main quest.`,
  });

  // Add other POIs as normal, but distribute quest clues to a few
  const cluePOICount = 3 + Math.floor(rng() * 3); // 3-5 clues
  const cluePOIIndexes: number[] = [];
  while (cluePOIIndexes.length < cluePOICount) {
    const idx = Math.floor(rng() * Object.values(poiCounts).reduce((a,b)=>a+b,0));
    if (!cluePOIIndexes.includes(idx)) cluePOIIndexes.push(idx);
  }
  let poiGlobalIndex = 0;
  Object.entries(poiCounts).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      // Avoid duplicating the main quest POI
      if (type === mainQuestPOIType && i === 0) continue;
      const name = proceduralName(type);
      const nearSettlement = mainSettlements[Math.floor(rng() * mainSettlements.length)];
      const isCluePOI = cluePOIIndexes.includes(poiGlobalIndex);
      world.push({
        name, type,
        icon: SETTLEMENT_TYPES[type].icon,
        populace: 0,
        industry: SETTLEMENT_TYPES[type].industries,
        parentSettlement: nearSettlement.name,
        isPOI: true,
        miniBoss: proceduralName('boss'),
        treasureLoot: proceduralName('loot'),
        bossDefeated: false,
        ruler: null,
        questClue: isCluePOI ? `A cryptic clue or fragment related to the main quest puzzle is hidden here.` : undefined,
      });
      poiGlobalIndex++;
    }
  });

  // Assign map coordinates
  (() => {
    const placed: Record<string, { x: number; y: number }> = {};
    const set = (name: string, x: number, y: number) => { placed[name] = { x: clamp(x, 4, 96), y: clamp(y, 4, 96) }; };

    const cap = world.find((w) => w.type === 'capital');
    set(cap.name, rand(44, 56), rand(44, 56));

    const cities = world.filter((w) => w.type === 'city');
    cities.forEach((c, i) => {
      const a = (i / cities.length) * Math.PI * 2 + rand(-0.4, 0.4);
      const d = rand(16, 26);
      const cp = placed[cap.name];
      set(c.name, cp.x + Math.cos(a) * d, cp.y + Math.sin(a) * d);
    });

    const towns = world.filter((w) => w.type === 'town');
    towns.forEach((t) => {
      const par = cities[Math.floor(Math.random() * cities.length)];
      const pp = placed[par.name];
      set(t.name, pp.x + Math.cos(angle()) * rand(7, 15), pp.y + Math.sin(angle()) * rand(7, 15));
    });

    const villages = world.filter((w) => w.type === 'village');
    const tv = [...cities, ...towns];
    villages.forEach((v) => {
      const par = tv[Math.floor(Math.random() * tv.length)];
      const pp = placed[par.name];
      set(v.name, pp.x + Math.cos(angle()) * rand(5, 12), pp.y + Math.sin(angle()) * rand(5, 12));
    });

    const hamlets = world.filter((w) => w.type === 'hamlet');
    const tvh = [...towns, ...villages];
    hamlets.forEach((h) => {
      const par = tvh[Math.floor(Math.random() * tvh.length)];
      const pp = placed[par.name] || placed[cap.name];
      set(h.name, pp.x + Math.cos(angle()) * rand(3, 8), pp.y + Math.sin(angle()) * rand(3, 8));
    });

    world.filter((w) => w.parentSettlement && !w.isPOI).forEach((farm) => {
      const pp = placed[farm.parentSettlement] || placed[cap.name];
      set(farm.name, pp.x + Math.cos(angle()) * rand(2, 5), pp.y + Math.sin(angle()) * rand(2, 5));
    });

    world.filter((w) => w.isPOI).forEach((poi) => {
      const pp = placed[poi.parentSettlement] || placed[cap.name];
      set(poi.name, pp.x + Math.cos(angle()) * rand(4, 10), pp.y + Math.sin(angle()) * rand(4, 10));
    });

    world.forEach((w) => {
      const p = placed[w.name];
      w.mapX = p ? p.x : rand(10, 90);
      w.mapY = p ? p.y : rand(10, 90);
    });
  })();

  return world;
}

export function buildTravelMatrix(worldData: any[]): any {
  const locationGrid: Record<string, any> = {};
  worldData.forEach((loc) => {
    if (loc.mapX === undefined || loc.mapY === undefined) return;
    const isCoastal = false; // no Claude geography call — default
    const hasHarbour = false;
    locationGrid[loc.name] = {
      x: Math.round(loc.mapX),
      y: Math.round(loc.mapY),
      type: loc.type,
      coast: isCoastal,
      river: false,
      harbour: hasHarbour,
      parent: loc.parentSettlement || null,
      isPOI: !!loc.isPOI,
      note: null,
    };
  });


  // --- Hierarchical road network generation ---
  const routes: any[] = [];
  const getDist = (a: any, b: any) => {
    const ax = locationGrid[a.name]?.x ?? a.mapX;
    const ay = locationGrid[a.name]?.y ?? a.mapY;
    const bx = locationGrid[b.name]?.x ?? b.mapX;
    const by = locationGrid[b.name]?.y ?? b.mapY;
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
  };

  // Helper: connect node to N nearest of validTypes, with distance limit
  function connectNearest(nodes: any[], validTypes: string[], roadType: string, maxLinks = 2, maxDist = 30) {
    nodes.forEach((node) => {
      // Find nearest valid neighbors
      const candidates = worldData.filter(
        (n) => n.name !== node.name && validTypes.includes(n.type)
      );
      const sorted = candidates
        .map((n) => ({ n, d: getDist(node, n) }))
        .filter(({ d }) => d <= maxDist)
        .sort((a, b) => a.d - b.d)
        .slice(0, maxLinks);
      sorted.forEach(({ n, d }) => {
        // Avoid duplicate routes
        if (!routes.some(r => (r.from === node.name && r.to === n.name) || (r.from === n.name && r.to === node.name))) {
          routes.push({
            from: node.name,
            to: n.name,
            hours: Math.max(4, Math.round(d * 1.5)),
            road: true,
            barge: false,
            sea: false,
            roadType
          });
        }
      });
    });
  }

  // 1. King's Road: Capital ↔ nearest city
  const capitals = worldData.filter((s) => s.type === 'capital');
  const cities = worldData.filter((s) => s.type === 'city');
  connectNearest(capitals, ['city'], 'highway', 1, 40);

  // 2. Merchant Road: City ↔ nearest towns
  const towns = worldData.filter((s) => s.type === 'town');
  connectNearest(cities, ['town'], 'road', 2, 28);

  // 3. Dirt Road: Town ↔ nearest village/hamlet
  const villages = worldData.filter((s) => s.type === 'village');
  const hamlets = worldData.filter((s) => s.type === 'hamlet');
  connectNearest(towns, ['village', 'hamlet'], 'dirt', 2, 18);

  // 4. Trail: POI ↔ nearest POIs (no crossroads with settlements)
  const pois = worldData.filter((s) => s.isPOI);
  connectNearest(pois, pois.map(p => p.type), 'trail', 2, 20);

  // 5. Farm Track: Farm ↔ nearest farms
  const farms = worldData.filter((s) => s.type && s.type.startsWith('farm'));
  connectNearest(farms, farms.map(f => f.type), 'track', 2, 10);

  // 6. Crossroads: a few extra settlement-settlement links (no POIs/farms)
  const settlements = worldData.filter((s) => ['capital','city','town','village','hamlet'].includes(s.type));
  // For each, connect to 1 extra nearest settlement (not already connected)
  settlements.forEach((node) => {
    const candidates = settlements.filter((n) => n.name !== node.name);
    const sorted = candidates
      .map((n) => ({ n, d: getDist(node, n) }))
      .filter(({ d }) => d > 6 && d <= 28)
      .sort((a, b) => a.d - b.d);
    let added = 0;
    for (const { n, d } of sorted) {
      if (added >= 1) break;
      if (!routes.some(r => (r.from === node.name && r.to === n.name) || (r.from === n.name && r.to === node.name))) {
        routes.push({
          from: node.name,
          to: n.name,
          hours: Math.max(4, Math.round(d * 1.5)),
          road: true,
          barge: false,
          sea: false,
          roadType: 'road'
        });
        added++;
      }
    }
  });

  // --- Guarantee all settlements and POIs are connected ---
  const allConnectNodes = [
    ...settlements,
    ...pois
  ];
  allConnectNodes.forEach((node) => {
    const alreadyConnected = routes.some(r => r.from === node.name || r.to === node.name);
    if (!alreadyConnected) {
      // Find closest valid neighbor (settlement or POI, not self)
      const candidates = allConnectNodes.filter(n => n.name !== node.name);
      if (candidates.length > 0) {
        const closest = candidates.map(n => ({ n, d: getDist(node, n) }))
          .sort((a, b) => a.d - b.d)[0];
        if (closest) {
          // Pick roadType based on node type
          let roadType = 'road';
          if (node.isPOI) roadType = 'trail';
          else if (node.type === 'village' || node.type === 'hamlet') roadType = 'dirt';
          else if (node.type === 'city') roadType = 'road';
          else if (node.type === 'capital') roadType = 'highway';
          routes.push({
            from: node.name,
            to: closest.n.name,
            hours: Math.max(4, Math.round(closest.d * 1.5)),
            road: true,
            barge: false,
            sea: false,
            roadType
          });
        }
      }
    }
  });

  // Assign ~15% of all routes as rivers, with a mix of long and short
  const riverNamePool = [
    'The Sableflow', 'Sunshadow River', 'The Whispering Current', 'The Pale Run', 'The Gloamwater',
    'The Silverstream', 'The Bleak Torrent', 'Hopewell River', 'The Murkmire', 'The Dawnbrook',
    'The Ashen Wash', 'The Verdant Vein', 'The Lost Channel', 'The Quietwater', 'The Ironbrook',
    'The Luminous Creek', 'The Withered Branch', 'The Brightwater', 'The Sorrowcourse', 'The Dreaming River'
  ];
  const usedRiverNames = new Set();
  // Only consider routes that are not already roads, sea, or barge
  const eligible = routes.filter(r => !r.road && !r.sea && !r.barge);
  // Sort by distance (longest first)
  const withDist = eligible.map(r => {
    const from = locationGrid[r.from], to = locationGrid[r.to];
    const dist = from && to ? Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2) : 0;
    return { ...r, _dist: dist };
  });
  withDist.sort((a, b) => b._dist - a._dist);
  // 15% of all routes, at least 1
  const riverCount = Math.max(1, Math.round(routes.length * 0.15));
  // Take half from the longest, half from the shortest
  const longRivers = withDist.slice(0, Math.ceil(riverCount / 2));
  const shortRivers = withDist.slice(-Math.floor(riverCount / 2));
  const riverSet = new Set([...longRivers, ...shortRivers].map(r => r.from + '→' + r.to));
  routes.forEach(r => {
    const key = r.from + '→' + r.to;
    if (riverSet.has(key)) {
      r.river = true;
      // Pick a name not already used
      let name = '';
      for (let tries = 0; tries < riverNamePool.length; tries++) {
        const idx = Math.floor(Math.random() * riverNamePool.length);
        if (!usedRiverNames.has(riverNamePool[idx])) {
          name = riverNamePool[idx];
          usedRiverNames.add(name);
          break;
        }
      }
      if (!name) name = 'The Nameless River';
      r.name = name;
    }
  });

  // Procedural terrain generation
  // Divide the map into regions and assign terrain types
  const terrainTypes = [
    'forest', 'grasslands', 'plains', 'hills', 'mountains', 'tundra', 'swamp'
  ];
  const terrain: any[] = [];
  // Simple approach: create 8-12 terrain patches of random type, size, and position
  const patchCount = 8 + Math.floor(Math.random() * 5); // 8-12 patches
  for (let i = 0; i < patchCount; i++) {
    const type = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
    // x/y in map units (0-100), w/h in map units (8-25 wide, 6-18 tall)
    const x = Math.floor(Math.random() * 80) + 4;
    const y = Math.floor(Math.random() * 80) + 4;
    const w = 8 + Math.floor(Math.random() * 18);
    const h = 6 + Math.floor(Math.random() * 13);
    terrain.push({ type, x, y, w, h });
  }

  // Dark fantasy name pools (mix of moody and hopeful)
  const terrainNamePools: Record<string, string[]> = {
    forest: [
      'Thornwood', 'Elderwood', 'The Gloam', 'Witchgrove', 'The Verdant Veil', 'Ashenwild', 'The Whispering Pines', 'Sunshadow Forest', 'The Green Shroud', 'The Sable Canopy', 'Hopegrove', 'The Silver Boughs'
    ],
    grasslands: [
      'The Golden Reach', 'Windmere', 'The Sighing Fields', 'Briarplain', 'The Luminous Steppe', 'The Withered Downs', 'Sunmeadow', 'The Bleak Pasture', 'The Emerald Expanse', 'The Quiet March'
    ],
    plains: [
      'The Pale Expanse', 'Dawnfields', 'The Bleak Table', 'The Open Steppe', 'The Sunlit Flats', 'The Sorrow Flats', 'The Green Table', 'The Lonely Plain', 'The Hopeful Vale'
    ],
    hills: [
      'The Barrow Hills', 'The Rolling Bones', 'The Misty Uplands', 'The Gentle Rise', 'The Sable Downs', 'The Hopeful Heights', 'The Gloaming Barrows', 'The Suncrest Hills', 'The Olden Rise'
    ],
    mountains: [
      'Ironspine Mountains', 'The Black Peaks', 'The Shrouded Crown', 'The Silver Range', 'The Grimspire', 'The Dawnspire', 'The Lost Pinnacle', 'The Hopeful Heights', 'The Pale Teeth', "The Watcher's Crest"
    ],
    tundra: [
      'The Bleak Tundra', 'Frostmere', 'The Pale Waste', 'The Silver Barrens', 'The Quiet Frost', 'The Sunlit Tundra', 'The Withered White', 'The Hopeful Snow', 'The Gloaming Ice'
    ],
    swamp: [
      'The Mire', 'The Sable Fen', 'The Withered Bog', 'The Sunken Hope', 'The Whispering Marsh', 'The Gloamfen', 'The Bright Fen', 'The Sorrowmire', 'The Silver Bog'
    ]
  };

  // Assign names to the largest patch of each type
  for (const type of terrainTypes) {
    const patches = terrain.filter(t => t.type === type);
    if (patches.length === 0) continue;
    // Largest by area
    const largest = patches.reduce((a, b) => (a.w * a.h > b.w * b.h ? a : b));
    const pool = terrainNamePools[type] || [];
    if (pool.length > 0) {
      // Pick a name and remove it from the pool to avoid duplicates
      const nameIdx = Math.floor(Math.random() * pool.length);
      const name = pool[nameIdx];
      largest.name = name;
      terrainNamePools[type].splice(nameIdx, 1);
    }
  }

  return { locationGrid, routes, terrain };
}

export function generateMainQuestSeed(): any {
  const template = pick(PLOT_TEMPLATES);
  const factionIds = Object.keys(FACTIONS);
  const alliedFaction = pick(factionIds);
  let rivalFaction = pick(factionIds);
  while (rivalFaction === alliedFaction) rivalFaction = pick(factionIds);
  const villainBaseName = pick(VILLAIN_NAMES);
  const isLich = template.lichDescriptor || Math.random() < 0.15;
  const lichDesc = isLich ? pick(LICH_DESCRIPTORS) : null;
  const villainName = lichDesc ? `${villainBaseName} ${lichDesc}` : villainBaseName;
  const allyBetrayalPair = pick(VILLAIN_ALLIES_BETRAYAL);
  const finalTone = pick(FINAL_TONES);
  return {
    templateId: template.id,
    templateTitle: template.title,
    templateIcon: template.icon,
    villainName,
    villainType: isLich ? 'Lich' : template.villainType,
    villainOrigin: pick(VILLAIN_ORIGINS),
    villainWeakness: pick(VILLAIN_WEAKNESSES),
    villainLair: pick(template.lairOptions),
    threat: template.threatDesc,
    baseThreat: template.baseThreat,
    act1Hook: pick(ACT1_HOOKS),
    act2Escalation: pick(ACT2_ESCALATIONS),
    act3Confrontation: pick(ACT3_CONFRONTATIONS),
    act4Complication: pick(ACT4_COMPLICATIONS),
    act5Revelation: pick(ACT5_REVELATIONS),
    finalTone: finalTone.tone,
    finalToneDesc: finalTone.desc,
    allyName: allyBetrayalPair.ally,
    allyBetrayal: allyBetrayalPair.betrayal,
    alliedFaction,
    rivalFaction,
    factionStakes: template.factionStake || {},
    questTitle: template.questTitle,
    currentAct: 1,
    act1Complete: false,
    act2Complete: false,
    act3Complete: false,
    act4Complete: false,
    act5Complete: false,
    allyRevealed: false,
    betrayalSprung: false,
    mainQuestComplete: false,
    lieutenantDefeated: false,
    finalBossDefeated: false,
    lieutenantEncounterReady: false,
    finalBossEncounterReady: false,
    villainAllied: false,
    worldEvents: {},
  };
}

export function generateWorldSeed(seedStr?: string): any {
  // If no seed provided, generate a random one
  const actualSeed = seedStr || Math.random().toString(36).slice(2) + Date.now().toString(36);
  const worldData = generateProceduralWorld(actualSeed);
  const seed = generateMainQuestSeed();
  seed.travelMatrix = buildTravelMatrix(worldData);
  seed.worldSettlements = worldData
    .filter((d) => ['capital','city','town','village','hamlet'].includes(d.type))
    .map((d) => ({ name: d.name, type: d.type, mapX: d.mapX, mapY: d.mapY }));
  seed.worldData = worldData;
  seed.seed = actualSeed;
  return seed;
}

/**
 * Migrate an old-format worldSeed to include the new travelMatrix (routes + terrain).
 * Safe to call on any worldSeed — returns the object unchanged if already up-to-date
 * or if the seed string is missing and migration is impossible.
 * Quest/narrative data is never replaced.
 */
export function migrateWorldSeed(worldSeed: any): any {
  if (!worldSeed) return worldSeed;
  if (worldSeed.travelMatrix?.routes?.length) return worldSeed; // already new format
  if (!worldSeed.seed) return worldSeed; // can't regenerate without seed string
  const worldData = generateProceduralWorld(worldSeed.seed);
  const travelMatrix = buildTravelMatrix(worldData);
  const worldSettlements = worldData
    .filter((d: any) => ['capital', 'city', 'town', 'village', 'hamlet'].includes(d.type))
    .map((d: any) => ({ name: d.name, type: d.type, mapX: d.mapX, mapY: d.mapY }));
  return { ...worldSeed, travelMatrix, worldData, worldSettlements };
}

export function initFactionStandings(): Record<string, number> {
  const standings: Record<string, number> = {};
  Object.keys(FACTIONS).forEach((id) => { standings[id] = 0; });
  return standings;
}

export function initLocationStandings(worldData: any[]): Record<string, number> {
  const standings: Record<string, number> = {};
  worldData.forEach((d) => { standings[d.name] = 0; });
  return standings;
}

export function INIT_PLAYER(name: string, cls: string, location: string, worldData: any[]): any {
  const classData = (CLASSES as any)[cls];
  const startingWeapon = cls === 'Warrior' || cls === 'Cleric' ? 'Iron Sword'
    : cls === 'Rogue' ? 'Dagger'
    : cls === 'Mage' ? 'Arcane Wand'
    : null;
  return {
    name,
    class: cls,
    level: 1,
    xp: 0,
    statPoints: 0,
    hp: classData.hp,
    maxHp: classData.hp,
    str: classData.str,
    agi: classData.agi,
    int: classData.int,
    wil: classData.wil,
    gold: 25,
    inventory: ['Health Potion x2', 'Rations x3'],
    location,
    reputation: 0,
    perks: [],
    abilities: [classData.ability],
    questsCompleted: 0,
    context: 'explore',
    quests: [],
    equipped: {
      weapon: startingWeapon,
      offhand: null,
      head: null,
      body: null,
      feet: null,
      accessory: null,
      mount: null,
    },
    travel: null,
    combat: null,
    exploredLocations: [location],
    mainQuestActSeen: 1,
    factionStandings: initFactionStandings(),
    locationStandings: initLocationStandings(worldData),
    joinedFactions: [],
    pendingFactionOffer: null,
    factionDeclines: [],
    sleepRoughCount: 0,
    knownNpcs: [],
    actionCount: 0,
    lastForageAction: -10,
    deathCount: 0,
    gravestones: [],
    dungeon: null,
    deepestFloor: 0,
    ngPlusCount: 0,
    legacyPerks: [],
    legacyItems: [],
    modelTier: 'haiku',
    gameHour: 8,
    gameDay: 1,
    wantedLevel: 0,
    wantedExpiry: null,
    professions: {},
    skillPoints: 0,
    unlockedSkills: [],
    bestiaryEntries: [],
    mount: null,
  };
}
