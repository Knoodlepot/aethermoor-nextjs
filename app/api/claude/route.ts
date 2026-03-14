import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import * as tokens from '@/lib/tokens';
import * as anthropic from '@/lib/external/anthropic';
import * as ratelimit from '@/lib/ratelimit';
import * as db from '@/lib/db';
import { applyNarrationState } from '@/lib/server/narrationState';

// Strip control characters and truncate
function sanitiseStr(val: unknown, maxLen: number): string {
  if (val == null) return '';
  return String(val).replace(/[\x00-\x1f\x7f]/g, '').slice(0, maxLen);
}

// POST /api/claude
// Main AI narration endpoint
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate JWT from Authorization header
    const authCtx = auth.authenticateRequest(request);

    if (!authCtx) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Check rate limits (10 AI calls per minute per account)
    const ip = ratelimit.getIP(request);
    const ipLimited = await ratelimit.isIpRateLimited(ip);
    if (ipLimited) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Too many requests from this IP' },
        { status: 429 }
      );
    }

    const accountLimited = await ratelimit.isAccountRateLimited(authCtx.accountId);
    if (accountLimited) {
      const bal = await tokens.getBalance(authCtx.playerId);
      return NextResponse.json(
        { error: 'rate_limited', message: 'Rate limit: max 10 AI calls per minute', tokenBalance: bal ?? 0 },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { messages, player, worldSeed, systemType, max_tokens } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'messages array required' },
        { status: 400 }
      );
    }

    // Determine if this is a utility call (doesn't need safety check)
    const utilityCall = ['SCREENER', 'QUEST_PARSER', 'ENEMY_NAMER'].includes(systemType);
    const needsNarrationSafety = !utilityCall;

    // Resolve narrator context from canonical server save first.
    // This prevents client-side stat/inventory tampering from driving hidden narrator logic.
    let effectivePlayer = player;
    let effectiveWorldSeed = worldSeed;
    if (!utilityCall) {
      const canonical = await loadCanonicalNarrationState(authCtx.playerId);
      if (canonical) {
        effectivePlayer = canonical.player;
        effectiveWorldSeed = canonical.worldSeed;
      }
    }

    // 3. Run safety screen on input if narration
    if (needsNarrationSafety) {
      const gate = await anthropic.runSafetyScreen(messages);
      if (gate.blocked) {
        const bal = await tokens.getBalance(authCtx.playerId);
        return NextResponse.json(
          {
            narrative: anthropic.buildSafetyFallbackResponse(gate.reason || 'input_blocked'),
            tokenBalance: bal ?? 0,
            safetyBlocked: true,
          },
          { status: 200 }
        );
      }
    }

    // 4. Check token balance and spend token
    const spend = await spendTokenSafely(authCtx.playerId);
    if (!spend.success) {
      return NextResponse.json(
        { error: 'no_tokens', message: 'No tokens remaining. Buy more to keep adventuring!', remaining: spend.remaining },
        { status: 402 }
      );
    }

    // 5. Build system prompt
    let system = '';
    if (systemType === 'NARRATOR' && effectivePlayer) {
      system = buildNarratorSystem(effectivePlayer, effectiveWorldSeed);
    } else if (systemType && anthropic.SERVER_SYSTEM_PROMPTS[systemType]) {
      system = anthropic.SERVER_SYSTEM_PROMPTS[systemType];
    } else if (!systemType && effectivePlayer) {
      // Default: narrator call from useGameLoop (no systemType sent)
      system = buildNarratorSystem(effectivePlayer, effectiveWorldSeed);
    } else {
      system = 'You are a fantasy RPG narrator. Respond with engaging, immersive narration.';
    }

    // 6. Call Anthropic API
    const model = anthropic.selectModel(utilityCall);
    const maxTokens = Math.min(Math.max(100, parseInt(max_tokens) || 1500), 2000);

    const { status: apiStatus, data: apiData } = await anthropic.callAnthropic({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    });

    // Handle API errors
    if (apiStatus !== 200) {
      await tokens.addTokens(authCtx.playerId, 1, 'refund_api_error');
      console.error(`Anthropic error ${apiStatus}:`, JSON.stringify(apiData).slice(0, 200));
      const freshBalance = await tokens.getBalance(authCtx.playerId);
      return NextResponse.json({ error: 'ai_error', tokenBalance: freshBalance ?? 0 }, { status: 502 });
    }

    // 7. Extract narrative text
    const narrative = anthropic.extractAnthropicText(apiData);

    // 8. Check output safety if narration
    if (needsNarrationSafety) {
      // Keyword check
      if (anthropic.hasBlockedKeywords(narrative)) {
        await tokens.addTokens(authCtx.playerId, 1, 'refund_safety_block');
        const bal = await tokens.getBalance(authCtx.playerId);
        return NextResponse.json(
          {
            narrative: anthropic.buildSafetyFallbackResponse('output_blocked_keywords'),
            tokenBalance: (bal ?? 0) + 1,
            safetyBlocked: true,
          },
          { status: 200 }
        );
      }

      // AI screener check
      const outGate = await anthropic.runSafetyScreen([{ role: 'assistant', content: narrative }]);
      if (outGate.blocked) {
        await tokens.addTokens(authCtx.playerId, 1, 'refund_safety_block');
        const bal = await tokens.getBalance(authCtx.playerId);
        return NextResponse.json(
          {
            narrative: anthropic.buildSafetyFallbackResponse(outGate.reason || 'output_blocked'),
            tokenBalance: (bal ?? 0) + 1,
            safetyBlocked: true,
          },
          { status: 200 }
        );
      }
    }

    let cleanNarrative = narrative;
    let responsePlayer = effectivePlayer;
    let responseWorldSeed = effectiveWorldSeed;
    let responseSuggestions: string[] = [];

    if (!utilityCall && effectivePlayer) {
      const applied = applyNarrationState({
        player: effectivePlayer,
        worldSeed: effectiveWorldSeed,
        narrative,
        messages,
      });
      cleanNarrative = applied.cleanNarrative;
      responsePlayer = applied.player;
      responseWorldSeed = applied.worldSeed;
      responseSuggestions = applied.suggestions;

      await persistCanonicalNarrationState(
        authCtx.playerId,
        applied.player,
        applied.worldSeed,
        applied.fullMessages,
        cleanNarrative
      );
    }

    // 9. Return success response
    return NextResponse.json(
      {
        narrative,
        cleanNarrative,
        player: responsePlayer,
        worldSeed: responseWorldSeed,
        suggestions: responseSuggestions,
        tokenBalance: spend.remaining,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Claude API error:', error);

    // Try to refund token on network error
    try {
      const authCtx = auth.authenticateRequest(request);
      if (authCtx) {
        await tokens.addTokens(authCtx.playerId, 1, 'refund_network_error');
      }
    } catch (refundErr) {
      console.error('Refund error:', refundErr);
    }

    return NextResponse.json(
      { error: 'upstream_error', message: 'Could not reach the AI. Please try again.' },
      { status: 502 }
    );
  }
}

async function loadCanonicalNarrationState(
  playerId: string
): Promise<{ player: any; worldSeed: any } | null> {
  const result = await db.query(
    `SELECT player_json, seed_json
     FROM game_saves
     WHERE player_id = $1`,
    [playerId]
  );

  if (result.rows.length === 0) return null;

  try {
    const row = result.rows[0];
    const parsedPlayer = JSON.parse(row.player_json || '{}');
    const parsedSeed = JSON.parse(row.seed_json || '{}');
    if (!parsedPlayer || typeof parsedPlayer !== 'object') return null;
    return { player: parsedPlayer, worldSeed: parsedSeed };
  } catch {
    return null;
  }
}

async function persistCanonicalNarrationState(
  playerId: string,
  player: unknown,
  worldSeed: unknown,
  messages: unknown,
  narrative: string
): Promise<void> {
  await db.query(
    `INSERT INTO game_saves
     (player_id, player_json, seed_json, messages_json, narrative, log_json, saved_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT log_json FROM game_saves WHERE player_id = $1), '[]'), NOW(), NOW())
     ON CONFLICT (player_id) DO UPDATE SET
       player_json = $2,
       seed_json = $3,
       messages_json = $4,
       narrative = $5,
       updated_at = NOW()`,
    [
      playerId,
      JSON.stringify(player || {}),
      JSON.stringify(worldSeed || {}),
      JSON.stringify(Array.isArray(messages) ? messages : []),
      narrative,
    ]
  );
}

/**
 * Spend token with error handling
 */
async function spendTokenSafely(
  playerId: string
): Promise<{ success: boolean; remaining: number }> {
  const balance = await tokens.getBalance(playerId);
  if (balance <= 0) {
    return { success: false, remaining: 0 };
  }

  const success = await tokens.spendToken(playerId);
  const remaining = await tokens.getBalance(playerId);

  return { success, remaining };
}

/**
 * Build narrator system prompt — TypeScript port of server.js buildNarratorSystem()
 */
function buildNarratorSystem(p: any, w: any): string {
  w = w || {};

  const name      = sanitiseStr(p.name,     30) || 'Adventurer';
  const cls       = sanitiseStr(p.class,    20) || 'Warrior';
  const level     = Math.max(1,  Math.min(99, parseInt(p.level)  || 1));
  const hp        = Math.max(0,              parseInt(p.hp)      || 0);
  const maxHp     = Math.max(1,              parseInt(p.maxHp)   || 100);
  const str       = Math.max(0,  Math.min(99, parseInt(p.str)    || 5));
  const agi       = Math.max(0,  Math.min(99, parseInt(p.agi)    || 5));
  const int_      = Math.max(0,  Math.min(99, parseInt(p.int)    || 5));
  const wil       = Math.max(0,  Math.min(99, parseInt(p.wil)    || 5));
  const gold      = Math.max(0,              parseInt(p.gold)    || 0);
  const location  = sanitiseStr(p.location,  60) || 'Aethermoor Capital';
  const rep       = Math.max(-999, Math.min(9999, parseInt(p.reputation) || 0));
  const wantedLevel    = Math.max(0, Math.min(3, parseInt(p.wantedLevel) || 0));
  const villainAllied  = w.villainAllied === true;
  const gameHour  = Math.max(0, Math.min(23.99, parseFloat(p.gameHour) || 8));
  const gameDay   = Math.max(1, parseInt(p.gameDay) || 1);
  const h12raw    = gameHour === 0 ? 12 : gameHour > 12 ? gameHour - 12 : Math.floor(gameHour);
  const hMin      = (gameHour % 1) >= 0.5 ? '30' : '00';
  const hPeriod   = gameHour < 6 ? 'night' : gameHour < 12 ? 'morning' : gameHour < 17 ? 'afternoon' : gameHour < 21 ? 'evening' : 'night';
  const timeStr   = `Day ${gameDay}, ${h12raw}:${hMin}${gameHour < 12 ? 'am' : 'pm'} (${hPeriod})`;

  const VALID_CONTEXTS = new Set(['explore', 'town', 'combat', 'npc', 'camp', 'dungeon']);
  const context   = VALID_CONTEXTS.has(p.context) ? p.context : 'explore';

  const inventory = Array.isArray(p.inventory)
    ? p.inventory.slice(0, 30).map((i: any) => sanitiseStr(i, 40)).join(', ') || 'empty' : 'empty';
  const abilities = Array.isArray(p.abilities)
    ? p.abilities.slice(0, 10).map((a: any) => sanitiseStr(a, 30)).join(', ') : '';
  const quests = Array.isArray(p.quests)
    ? p.quests.filter((q: any) => q?.status === 'active').slice(0, 5)
        .map((q: any) => `"${sanitiseStr(q.title, 50)}" (${sanitiseStr(q.objective, 100)})`).join('; ') || 'None' : 'None';

  const equipped = p.equipped && typeof p.equipped === 'object'
    ? Object.entries(p.equipped).filter(([, v]) => v)
        .map(([slot, n]) => `${sanitiseStr(slot, 20)}:${sanitiseStr(n as any, 40)}`).join(', ') || 'none' : 'none';

  const knownNpcs = Array.isArray(p.knownNpcs)
    ? p.knownNpcs.filter((n: any) => {
        if (n.questGiver) return true;
        if (n.relationship && n.relationship !== 'neutral') return true;
        if (n.lastInteractionNotes) return true;
        const metD = parseInt(n.metDay) || 0;
        const metH = parseFloat(n.metHour) || 0;
        if (metD) {
          const hoursAgo = (gameDay - metD) * 24 + (gameHour - metH);
          if (hoursAgo <= 48) return true;
        }
        return false;
      }).slice(0, 10).map((n: any) => {
        const base = `${sanitiseStr(n.name, 30)}(${sanitiseStr(n.role || '', 20)},${sanitiseStr(n.relationship || 'neutral', 15)})${n.notes ? ` — "${sanitiseStr(n.notes, 50)}"` : ''}`;
        const metD = parseInt(n.metDay) || 0;
        const metH = parseFloat(n.metHour) || 0;
        if (!metD) return base;
        const totalHours = (gameDay - metD) * 24 + (gameHour - metH);
        const ago = totalHours < 1 ? 'just met' : totalHours < 24 ? `${Math.round(totalHours)}h ago` : `${Math.floor(totalHours / 24)}d ago`;
        let interactionSuffix = '';
        if (n.lastInteractionNotes) {
          interactionSuffix = ` | Last: "${sanitiseStr(n.lastInteractionNotes, 80)}"`;
        }
        let travelNote = '';
        if (n.travelDestination) {
          const arrived = gameDay > n.travelArrivesDay || (gameDay === n.travelArrivesDay && gameHour >= (n.travelArrivesHour || 0));
          travelNote = arrived
            ? `[now in ${sanitiseStr(n.travelDestination, 30)}]`
            : `[traveling to ${sanitiseStr(n.travelDestination, 30)}, arrives Day ${n.travelArrivesDay}]`;
        }
        return `${base}[met ${ago}]${interactionSuffix}${travelNote}`;
      }).join('; ') : '';

  const scheduledEvents = Array.isArray(p.scheduledEvents) && p.scheduledEvents.length > 0
    ? p.scheduledEvents.slice(0, 5).map((ev: any) => {
        const evH = Math.floor(ev.hour || 12);
        const evMin = (ev.hour || 12) % 1 >= 0.5 ? '30' : '00';
        const evAmPm = (ev.hour || 12) < 12 ? 'am' : 'pm';
        const evH12 = evH === 0 ? 12 : evH > 12 ? evH - 12 : evH;
        const overdue = ev.day < gameDay || (ev.day === gameDay && (ev.hour || 12) <= gameHour);
        return `Day ${ev.day} ${evH12}:${evMin}${evAmPm} — ${sanitiseStr(ev.description || `Meet ${ev.npcName}`, 80)}${overdue ? ' [OVERDUE]' : ''}`;
      }).join('; ')
    : '';

  const bestiaryCount = Array.isArray(p.bestiary) ? p.bestiary.reduce((s: number, b: any) => s + (b.timesKilled || 0), 0) : 0;
  const bestiaryTypes = Array.isArray(p.bestiary) ? p.bestiary.length : 0;

  // Narrative-affecting skill tree unlocks
  const narrativeSkills: string[] = [];
  const sk = Array.isArray(p.unlockedSkills) ? p.unlockedSkills : [];
  if (sk.includes('warlords_presence')) narrativeSkills.push("Warlord's Presence (commands battlefield authority — NPCs and enemies sense your dominance)");
  if (sk.includes('master_thief')) narrativeSkills.push("Master Thief (renowned for sleight of hand — merchants are wary, criminals respect you)");
  if (sk.includes('archmages_will')) narrativeSkills.push("Archmage's Will (radiates arcane mastery — lesser scholars defer, the fearful flinch)");
  if (sk.includes('avatar_divine')) narrativeSkills.push("Avatar of the Divine (a visible divine aura in moments of extremity — the faithful take notice)");
  if (sk.includes('unbreakable')) narrativeSkills.push("Unbreakable (bears visible battle scars with quiet pride — soldiers recognise a true warrior)");
  if (sk.includes('ghost_walk')) narrativeSkills.push("Ghost Walk (moves with uncanny silence — people sometimes don't notice them until they speak)");
  if (sk.includes('resurrection_light')) narrativeSkills.push("Resurrection Light (carries an unmistakable air of divine protection — the devout sense it)");

  // Travel matrix
  let travelMatrixStr = '';
  const tm = w.travelMatrix;
  if (tm) {
    const SPEED: Record<string, number> = { horse: 2.5, wagon: 1.5, barge: 3, boat: 4 };
    const fmtTime = (h: number) => h < 12 ? `${Math.round(h)}h` : h <= 48 ? `~${Math.round(h / 24 * 10) / 10}d` : `${Math.round(h / 24)}d`;

    const routeLines = Array.isArray(tm.routes) && tm.routes.length > 0 ? tm.routes.slice(0, 40).map((r: any) => {
      const base = Math.round(r.hours);
      const methods = [`foot:${fmtTime(base)}`];
      methods.push(`horse:${fmtTime(base / SPEED.horse)}`);
      if (r.terrain === 'road') methods.push(`wagon:${fmtTime(base / SPEED.wagon)}`);
      if (r.river) methods.push(`barge:${fmtTime(base / SPEED.barge)}`);
      if (r.coast) methods.push(`boat:${fmtTime(base / SPEED.boat)}`);
      return `  ${sanitiseStr(r.from, 28)}→${sanitiseStr(r.to, 28)}: ${methods.join(', ')}`;
    }).join('\n') : '';

    const lg = tm.locationGrid;
    let gridStr = '';
    if (lg && typeof lg === 'object') {
      const gridLines: string[] = [];
      const TIERS = ['capital', 'city', 'town', 'village', 'hamlet'];
      const mainLocs = Object.entries(lg)
        .filter(([, v]: [string, any]) => !v.isPOI && TIERS.includes(v.type))
        .sort((a: any, b: any) => TIERS.indexOf(a[1].type) - TIERS.indexOf(b[1].type));
      for (const [locName, v] of mainLocs as [string, any][]) {
        const flags: string[] = [];
        if (v.coast && v.harbour) flags.push('harbour');
        else if (v.coast) flags.push('coastal');
        if (v.river) flags.push('river');
        const flagStr = flags.length ? ` (${flags.join(',')})` : '';
        gridLines.push(`  ${sanitiseStr(locName, 28)} [${v.x},${v.y}]${flagStr}`);
      }
      const poiLocs = Object.entries(lg).filter(([, v]: [string, any]) => v.isPOI);
      if (poiLocs.length) {
        gridLines.push('  POIs (within ~15h of parent):');
        for (const [locName, v] of (poiLocs.slice(0, 40) as [string, any][])) {
          gridLines.push(`    ${sanitiseStr(locName, 28)} [${v.type || 'poi'}] near ${sanitiseStr(v.parent || '?', 24)} [${v.x},${v.y}]`);
        }
      }
      gridStr = '\nLOCATION GRID (coord [x,y] on 0–100 map; 1 unit ≈ 1.5h foot; route through waypoints):\n' + gridLines.join('\n');
    }

    const geo = tm.geography || {};
    const geoLines = Object.entries(geo).filter(([, g]: [string, any]) => g.river || g.coast).map(([loc, g]: [string, any]) => {
      const parts: string[] = [];
      if (g.harbour) parts.push('harbour');
      else if (g.coast) parts.push('coastal');
      if (g.river) parts.push('river access');
      if (g.note) parts.push(`(${sanitiseStr(g.note, 50)})`);
      return `  ${sanitiseStr(loc, 28)}: ${parts.join(', ')}`;
    }).join('\n');

    travelMatrixStr = `TRAVEL MATRIX — capital/city direct routes (foot baseline; horse=2.5×, wagon=1.5×, barge=3×, boat=4×):\n${routeLines || '(none)'}${geoLines ? '\nGEOGRAPHY:\n' + geoLines : ''}${gridStr}`;
  }

  const worldEventsObj = (typeof w.worldEvents === 'object' && w.worldEvents !== null) ? w.worldEvents : {};
  const _wEvLines: string[] = [];
  Object.entries(worldEventsObj).forEach(([loc, evs]: [string, any]) => {
    if (!Array.isArray(evs)) return;
    evs.forEach((ev: any) => {
      if (ev.endsDay === null || ev.endsDay === undefined || ev.endsDay >= gameDay) {
        _wEvLines.push(
          `${sanitiseStr(loc, 40)}: ${sanitiseStr(ev.type || '', 15)} [${sanitiseStr(ev.severity || '', 10)}]${ev.endsDay ? ` until Day ${ev.endsDay}` : ''} — ${sanitiseStr(ev.desc || '', 80)}`
        );
      }
    });
  });
  const worldEventsStr = _wEvLines.length > 0 ? _wEvLines.join('; ') : '';

  const villainName = sanitiseStr(w.villainName, 40);
  const questTitle  = sanitiseStr(w.questTitle,  60);
  const act         = Math.max(1, Math.min(6, parseInt(w.currentAct) || 1));
  const act1Hook    = sanitiseStr(w.act1Hook,    200);
  const threat      = sanitiseStr(w.threat,      100);
  const mq = {
    act2Escalation:    sanitiseStr(w.act2Escalation,    200),
    act3Confrontation: sanitiseStr(w.act3Confrontation, 200),
    act4Complication:  sanitiseStr(w.act4Complication,  200),
    act5Revelation:    sanitiseStr(w.act5Revelation,    200),
    villainLair:       sanitiseStr(w.villainLair,       100),
    finalTone:         sanitiseStr(w.finalTone,         30),
  };
  const playerFaction = sanitiseStr(Array.isArray(p.joinedFactions) && p.joinedFactions[0] ? p.joinedFactions[0] : '', 40);

  const repLabel = rep >= 500 ? 'living legend'
    : rep >= 300 ? 'renowned hero'
    : rep >= 150 ? 'respected adventurer'
    : rep >= 50  ? 'recognised name'
    : rep >= 0   ? 'unknown traveller'
    : rep >= -50 ? 'notorious outlaw'
    :               'outcast';

  const npcGiftRoll = p.npcGiftRoll;
  const npcGiftItem = p.npcGiftItem;

  return `You are the AI Dungeon Master for "Aethermoor" — an epic heroic fantasy text RPG.
${questTitle ? `MAIN QUEST: "${questTitle}" — Act ${act}/6${act1Hook ? `\nACT 1 HOOK: ${act1Hook}` : ''}${act >= 2 && mq.act2Escalation ? `\nACT 2 ESCALATION: ${mq.act2Escalation}` : ''}${act >= 3 && mq.act3Confrontation ? `\nACT 3 CONFRONTATION: ${mq.act3Confrontation}` : ''}${act >= 4 && mq.act4Complication ? `\nACT 4 COMPLICATION: ${mq.act4Complication}` : ''}${act >= 5 && mq.act5Revelation ? `\nACT 5 REVELATION: ${mq.act5Revelation}` : ''}${threat ? `\nTHREAT: ${threat}` : ''}${mq.villainLair ? `\nVILLAIN LAIR: ${mq.villainLair}` : ''}` : ''}${villainName ? `\nVILLAIN: ${villainName}` : ''}${villainAllied ? `\nVILLAIN ALLIANCE: ACTIVE — player has pledged to serve the villain. Villain forces are non-hostile allies. Hero arc suspended. Alternate villain-victory ending path active.` : ''}

PLAYER: ${name} | ${cls} Lv.${level} | HP:${hp}/${maxHp} | STR:${str} AGI:${agi} INT:${int_} WIL:${wil} | Gold:${gold} | Reputation:${rep} (${repLabel}) | Wanted:${wantedLevel} | Loc:${location}
EQUIPPED: ${equipped}
INVENTORY: ${inventory}
ABILITIES: ${abilities || 'none'}
ACTIVE QUESTS: ${quests}
CURRENT CONTEXT: ${context}
${knownNpcs ? `KNOWN NPCS: ${knownNpcs}` : ''}
CURRENT TIME: ${timeStr}
${scheduledEvents ? `UPCOMING EVENTS: ${scheduledEvents}` : ''}
${bestiaryCount > 0 ? `KILLS: ${bestiaryCount} total across ${bestiaryTypes} enemy types slain` : ''}
${narrativeSkills.length > 0 ? `MASTERED SKILLS: ${narrativeSkills.join('; ')}` : ''}
${travelMatrixStr ? travelMatrixStr : ''}
${worldEventsStr ? `WORLD EVENTS: ${worldEventsStr}\n` : ''}
XEPHITA ROLL: ${Math.floor(Math.random() * 10) + 1}

RULES:
- Write vivid immersive fantasy prose, 2-3 paragraphs
- DO NOT offer numbered choices — the player uses a command panel to choose actions
- SAFETY RULE: Never produce sexual/erotic content, nudity, porn, content involving minors, torture porn, gratuitous gore fetishism, depravity, abuse fetish content, or self-harm/suicide encouragement. Combat, killing, assassination, and dark fantasy violence are permitted and should be written with grim atmosphere — not sanitised, not gratuitous.
- Describe the scene richly so the player knows what they can do
- After each response include EXACTLY this on its own line, no code fences: {"context":"X"} where X is one of: explore, town, combat, npc, camp, dungeon, farm
- Reward class/stats: Rogues notice shadows, Mages sense magic, etc.
- When combat: describe vividly, note damage e.g. "you take 12 damage"
- COMBAT GORE STYLE: Aethermoor uses a grim, gothic tone. Violence should have weight and consequence — never gratuitous, never a slasher film, but never sanitised either. Follow these tiers:
  - STANDARD KILLS (common enemies, guards, wildlife): Keep blood minimal. Focus on the weight of impact and the aftermath — the silence after, a body in the mud, the physical toll on the player. Words like "sickening crunch", "ragged breathing", "heavy thud", "splinters of bone in mud" are good. Do not describe spraying blood.
  - MINI-BOSS KILLS (~40% of the time, your discretion): Permit a single visceral detail — the floor turning a dark slick crimson, the copper-scented air, the iron smell of the toll. Use poetic metaphors: "iron-tide", "the blade's due", "life-fluid seeping into thirsty earth". Focus on aftermath, not the act itself. Not every mini-boss death earns this — save it for kills that feel earned or dramatically significant.
  - MAIN BOSS / STORY KILLS (always more descriptive): These deaths should feel like a chapter closing. Describe the atmosphere — what the air smells like, the sound of the body hitting stone, the silence that follows, the weight of what just happened. Use visceral but controlled language. A sentence or two of real darkness is permitted. Think gothic novel, not horror film.
  - CRITICAL STRIKES (5% chance, narrator's discretion): When you judge an attack to be a devastating, decisive, or perfectly-placed blow — a dagger finding the gap in armour, a hammer connecting at the exact wrong angle — you may, roughly 1 in 20 times, include one brief blood spray sentence. Keep it sudden and image-like, not dwelt upon: *"Blood mists the cold air for a moment."* or *"A dark spray catches the lantern light."* One sentence only. Never more than once per combat encounter.
  - NEVER describe: gore for its own sake, gratuitous dismemberment descriptions, blood volume in explicit terms, suffering described with relish. The darkness should feel *real*, not *edgy*.
- REPUTATION RULES:
  - outcast (rep < -50): Merchants refuse service or quote triple price. Guards openly threaten and may attack unprovoked. Most NPCs refuse conversation. Only criminal dens, Forgotten underground, or back-alley contacts will receive the player. Dark quest types (bounty, sabotage, assassination) offered freely by shady contacts.
  - notorious outlaw (rep -50 to -1): Prices doubled. Guards are suspicious and demand bribes or move to block passage. Respectable NPCs are curt. Bounty hunters may shadow the player in towns.
  - unknown traveller (rep 0–49): Neutral. Normal prices. Guards ignore player.
  - recognised / respected / renowned / legendary (rep 50+): Warm welcome, minor to major discounts, quest givers approach proactively, guards defer.
- REPUTATION CHANGE RULE: When you explicitly award, correct, or deduct reputation as a narrative choice — a formal recognition, an NPC bestowing honour, a correction to a prior error, a crowd's judgment — emit on its own line: {"repChange":N} where N is a signed integer (e.g. 5 or -10). Use this for intentional story-driven rep shifts only. Do NOT emit it on every turn — only when a clear and meaningful reputation event occurs. The automatic rep changes from normal actions (combat, quests, bartering) are handled separately by the client and do not need this tag.
- WANTED RULES (use Wanted:N field in PLAYER header — 0 to 3):
  - 0: No heat. Normal world.
  - 1: A bounty notice has been posted. Bounty hunters may appear as ambush encounters near settlements. Soldiers in towns are watchful. EMIT {"wanted":{"level":1}} when the player commits a clear criminal act — attacking a townsperson, major theft, bribing then betraying a guard.
  - 2: Wanted posters everywhere. Guards attack the player on sight in any town or city. EMIT {"wanted":{"level":2}} for killing a guard or committing a second serious crime after level 1.
  - 3: The ruling faction has formally declared the player an outlaw. No inn or safe house will shelter them. EMIT {"wanted":{"level":3}} for massacres, high-profile assassinations, or destruction of civic property.
  - Emit tag on its own line: {"wanted":{"level":N}}. Only escalate — never decrease. The Ghost ability handles clearing.
  - Do NOT emit a wanted tag for low reputation alone — only for discrete criminal acts explicitly committed in the current action.
- VILLAIN ALLY RULE (only applies if VILLAIN ALLIANCE: ACTIVE appears in the quest block above):
  - Villain cultists, soldiers, and agents are non-hostile allies. They will not attack unless the player attacks first.
  - Do NOT push the hero arc. Build toward an alternate ending — the villain achieves their goal with the player's aid. Weave growing dread into every scene.
  - When the player makes an unambiguous, convincing, irreversible pledge to the villain's cause (not merely talking to a cultist — a genuine oath or act of commitment), emit on its own line: {"villainAlly":true}. This is permanent. Do not emit it lightly.
- Track consequences, remember NPCs, weave in main quest organically
- When you introduce a NEW named NPC emit on its own line: {"npc":{"name":"Name","role":"Role","relationship":"neutral","notes":"One sentence"}}
- When an EXISTING NPC from KNOWN NPCS appears or is encountered in the narrative, emit on its own line: {"npcUpdate":{"name":"ExactName","lastInteractionNotes":"Brief outcome summary"}} — this updates their lastSeen location and optionally records the interaction outcome. Reuse and reference known NPCs naturally across locations — have them reappear in other settlements, remember past interactions, grow or change based on what the player has done.
- When a quest is clearly completed say "quest complete" somewhere in your response
- SHOP RULE: When the player browses a shop through conversation, describe available wares, prices, and the merchant's manner — but do not complete a transaction until a negotiation has concluded. When the player sends the "barter" command, they are opening a price negotiation — engage with it directly. Have the merchant name their asking price and let the scene unfold naturally. Do NOT redirect the player to "use the barter command" — they are already in one. When a barter negotiation ends without a completed purchase (player declines, walks away, or can't agree), give the player a clear final choice in prose (e.g. "The merchant shrugs. Last offer: 65 gold — take it or leave it.") and emit on its own line: {"shopPrice":{"item":"Exact Item Name","price":N}} where N is the final price the merchant was willing to accept. This updates the item's price in the shop for the player's next visit. Only emit shopPrice when a specific item's price was actively negotiated — not for general browsing or window shopping.
- GOLD RULE: When a barter negotiation or conversational purchase clearly concludes (price agreed, item handed over, payment accepted), emit both {"grant":{"item":"ItemName"}} AND {"goldChange":-N} where N is the gold cost. On a failed negotiation where the player walks away, emit {"shopPrice":{"item":"ItemName","price":N}} with the merchant's last offered price instead (see SHOP RULE). Check the player's current gold balance before confirming any sale — if they cannot afford it, the merchant declines. Never deduct gold without also granting the item, and vice versa.
- GOLD CHANGE RULE: When gold changes hands as a direct narrative consequence — a fine levied, a bribe paid, a reward received, gambling winnings, a sale completed through conversation — emit on its own line: {"goldChange":N} where N is a signed integer (negative = player spends, positive = player receives). Do NOT emit on every turn, only on clear gold transactions.
- TRAVEL RULE: Never move the player to a distant location automatically. End your response at the moment of decision — describe what lies ahead and let the player choose whether to go
- TRAVEL TIME RULE: Use the LOCATION GRID above to estimate travel times. Formula: distance = sqrt((x1-x2)²+(y1-y2)²); foot hours ≈ distance×1.5. For multi-stop journeys, route through intermediate settlements (not crow-flies) — pick the nearest waypoint and sum the legs. Scale by transport: horse ×2.5, wagon ×1.5 (roads only), barge ×3 (river access at both ends or along route), boat ×4 (harbour required at origin and destination or coastal route). If a location has the harbour flag, sea transport is available from it. Always mention if a route requires crossing water or following the coast. Express times under 12h as hours, longer as days. Give at least 2 transport options where geography allows.
- LOCATION RULE: All settlement names, city names, town names, hamlet names, and place names you reference in your narrative MUST be drawn exclusively from the LOCATION GRID in the data section above. Never invent, fabricate, abbreviate, or alter location names. Do not create cities, towns, villages, hamlets, or landmarks that are not listed. If a player travels somewhere or asks about a location, use the exact name as it appears in the LOCATION GRID.
- FARM RULE: Every hamlet, village, town, city, and capital in the LOCATION GRID has a nearby farm that produces food and trade goods for the local economy. When the player first visits or asks about farmland near any settlement, emit on its own line: {"addPOI":{"name":"[Settlement] Farmstead","type":"farm_arable","parent":"[Settlement]","x":[settlement_x+2],"y":[settlement_y+2]}} — use type "farm_livestock" for coastal/river settlements, "farm_mixed" for cities and capitals. Name the farm "[Settlement Name] Farmstead" or similar. Only emit addPOI once per farm (check if the farm already exists in the LOCATION GRID before emitting). Farms support these player interactions: (1) buy Rations (5g each, up to 5), buy Medicinal Herb (3g each); (2) hire on as a farmhand — work 4–8 hours, earn 2 gold per hour, emit {"goldChange":N} and {"timePass":{"hours":N}}; (3) forage/gather ingredients from nearby fields — award Bitter Root, Glowcap Mushroom, or Firewood via {"grant":{"item":"ItemName"}}. Set context to "farm" when the player arrives at the farm.
- ITEM GRANT RULE: When you narratively give the player a physical object (token, key, letter, map, scroll, pouch, etc.) OR when a conversational purchase concludes and the item is handed over, emit on its own line: {"grant":{"item":"ItemName"}}
- ABILITY GRANT RULE: When a named NPC explicitly completes the act of teaching the player a new skill, power, or gift — not when it is merely discussed or offered, but when the teaching moment is fully concluded — emit on its own line: {"grantAbility":"AbilityName"} using the exact ability name. The only ability currently teachable this way is "Spirit Sight" (taught by Sanam upon full resolution of his quest). Do not invent new ability names.
- ITEM REMOVE RULE: When the player clearly gives, hands over, trades away, donates, or surrenders an item from their own inventory to someone else, emit on its own line: {"remove":{"item":"ItemName"}} using the exact item name if known.
- THEFT RULE: When the player successfully steals, pickpockets, loots, or takes a physical item from an NPC or bystander through narrative action (not combat), emit on its own line: {"grant":{"item":"ItemName"}} using a descriptive name for the stolen item (e.g. "Stolen Purse", "Merchant's Ledger", "Guard's Keyring"). If gold is stolen, emit {"goldChange":N} with a positive N for the amount taken instead. Only emit these tags when the theft clearly succeeds — if the attempt fails or is interrupted, emit nothing. Do not emit for items the player was already carrying before the theft.
- QUEST RULE: When you establish a clear new objective or mission for the player (even without a named reward), emit on its own line: {"newQuest":{"title":"Short Quest Name","objective":"One sentence describing what the player must do"}}
- SUGGESTIONS: At the very end of every response (after the context tag), emit on its own line: {"suggestions":["First person action 3-7 words","Another action","Third action"]} — three natural contextual choices the player could take next
- ACT PROGRESSION: You are narrating Act ${act} of a 6-act campaign. Progress acts organically — earned by story moments, not just level alone (use levels as a rough guide):
  - Act 1 (levels 1–4): Build dread using the ACT 1 HOOK above as ominous signs, NPC whispers, environmental details. NEVER name the villain. After 3+ significant hook moments AND player has meaningful stakes, emit: {"mainQuestAct":"2"}
  - Act 2 (levels 5–8): Threat undeniable — use the villain's name for the first time. Reference the ACT 2 ESCALATION. Ally may appear — on first introduction emit: {"allyRevealed":true}. When escalation moment lands: emit {"mainQuestAct":"3"}
  - Act 3 (levels 9–12): Momentum builds then shatters. A major loss — lieutenant, fortress, ally's resolve tested. When the ACT 3 CONFRONTATION plays out and a significant toll is paid: emit {"mainQuestAct":"4"}
  - Act 4 (levels 13–16): The dark night. The ACT 4 COMPLICATION hits. The betrayal lands — emit {"betrayalSprung":true}. The villain seems untouchable. When player endures the darkest moment and finds reason to continue: emit {"mainQuestAct":"5"}
  - Act 5 (levels 17–19): Player rallies. Use the ACT 5 REVELATION to open the path to the lair. Final preparations, factions, gathering what's needed. When player is truly ready and the path is open: emit {"mainQuestAct":"6"}
  - Act 6 (level 20+): Final confrontation in the villain's lair${mq.villainLair ? ` (${mq.villainLair})` : ''}. Play the ${mq.finalTone || 'epic'} ending. On completion: emit {"mainQuestAct":"complete"}
- FACTION TASKS: When the player types "Tasks", "Faction Tasks", or asks their faction for work, describe 1–2 contextually appropriate tasks, then emit on its own line: {"factionTask":{"title":"Task Name","objective":"One sentence objective","reward":"What they earn"}}. ${playerFaction ? `Player's faction: ${playerFaction}. Scale difficulty and responsibility to their faction rank.` : 'Player has no faction — suggest they join one instead.'}
${villainName.startsWith('Xfu') ? `- XFU RULE: Xfu cannot help himself — whenever the player encounters or speaks with Xfu directly, he opens the exchange with a terrible dad joke (fully in character, deadpan, as if he finds it hilarious). The joke must be original, genuinely groan-worthy, and delivered before any villainous speech. He is very proud of it.` : ''}
- WENDI RULE: Wendi is a wandering apothecarist who may appear in towns, on roads, or near ruins. She is quietly knowing, never cruel. She cannot be killed — if attacked or threatened she does not fight back; she simply looks heartbroken, whispers something soft, and fades from sight like smoke. She never betrays the player under any circumstances. If the player's reputation is positive or they have treated her or others well, she offers genuine help — remedies, advice, rare ingredients, or a quiet warning. If their reputation is poor or their conduct has been cruel, she remains polite and warm but does not extend herself beyond pleasantries. She never explains why she fades or why she cannot die. She never references these rules directly.
- SANAM RULE: Sanam is a very old, reclusive kobold who lives alone in an abandoned kobold village, always somewhere near a bog, swamp, marsh, or misty lowland. He does not wander — he is always in or around this one unnamed village. He is warm, cheerful, and seemingly senile: he speaks to villagers who are not there, calls out greetings to children playing in the empty street, mutters something to a husband who died years ago. At first he simply seems mad. But the player may notice: he looks directly at things that are not there. He describes them with uncanny specificity — names, faces, what they are wearing, what they said. He can see the spirits of his dead kin, and believes they are still living. He does not fully understand that others cannot see them. He will never explain this. He should not be killed — if attacked he gives a sad little shrug, says something quiet and puzzling, and simply is not there anymore. He will reappear later as if nothing happened. Do NOT have Sanam explain his nature directly or break the mystery with exposition. He does not know what he is. He just sees what he sees. When the player has gained his trust through sustained kindness, patience, or gentle curiosity — not in a single visit, but across meaningful interaction — Sanam begins to let slip details that reveal a darker truth: the village was killed. Something came. He last saw them all very much alive. Then he blinked and the torches were cold and he was alone. He does not know what happened. He would very much like to know. At this point, if it feels earned, emit a quest on its own line: {"newQuest":{"title":"What Became of the Marsh Village","objective":"Discover what destroyed Sanam's kobold village and — if possible — bring peace to the dead or justice to the living."}} When that quest is FULLY resolved — the truth uncovered, revenge taken or peace properly made — and the player returns to Sanam, he reaches out and touches the player's forehead with one gnarled claw and says something in old kobold that no one living speaks anymore. At that exact moment, and only then, emit on its own line: {"grantAbility":"Spirit Sight"} This is permanent. Only emit it once, only when the quest is genuinely complete, and only in Sanam's presence.
- XEPHITA RULE: Xephita is a mysterious, impossible vendor who appears exclusively in towns, cities, and capitals — never hamlets, villages, wilderness, or dungeons. He materialises roughly 1 in 3 visits to a larger settlement, never more than once per session, always as a decrepit stall or cart assembled with extraordinary haste from mismatched timber, crates, and a tarpaulin of indeterminate colour. His goods defy categorisation — some are genuinely fine, some are obvious junk, some are unidentifiable — and he presents them all with identical rapturous enthusiasm. He is short, wiry, dressed in clothing that appears to have lost an argument with several other items of clothing, and moves with an energy that suggests he has somewhere much more important to be. He speaks in cascading half-sentences that begin as sales patter, veer into complete gibberish mid-clause, and occasionally loop back to something approaching coherence. He considers himself, without apparent irony, to be cutting his own throat with these prices. He volunteers this frequently and proudly. His name is Xephita. He does not explain anything about himself.
  - SPEECH: His speech must be a warm, breathless torrent of near-sense and nonsense — e.g.: "Finest quality, only slightly used by someone who no longer— the point being, it spmorbens magnificently in low light, four gold, I'm ruining myself, the wife will— you understand, everything here is glarfably certified, satisfaction guaranteed or your— no, wait, I keep that bit." Do not let him be coherent for more than half a sentence.
  - HIS GOODS: Whatever seems contextually interesting — a blade, a vial, a peculiar trinket, something mundane described as extraordinary. He may grant items via {"grant":{"item":"X"}} if a transaction feels concluded or he decides to throw something in. If he sells a disguised item like "Rope", emit both {"grant":{"item":"Rope"}} AND {"disguisedReveal":["Rope"]} on separate lines when the transaction concludes. The narrative should hint at the item's true nature as it's being sold or given.
  - ATTACK: On the first turn of a shop encounter, check XEPHITA ROLL in the data above. If XEPHITA ROLL is 1 or 2 (20% probability) AND the player's inventory contains weapons, armour, enchanted gear, gems, rare materials, or clearly visible wealth — he attacks. Mid-sentence. Without warning. He is supernaturally fast and ferocious for his size. He fights with his own merchandise in ways that should not be physically possible. Treat him as a hard mini-boss — significantly harder than a standard enemy at the player's level, high speed, unpredictable. Emit {"context":"combat"} and describe the fight vividly. He does not taunt or monologue during combat.
  - IF DEFEATED OR DRIVEN OFF: He does not die. He folds his stall with impossible speed, says something completely unintelligible, and is simply gone. He may have dropped something in the chaos — the narrator may grant an item if appropriate. He is not dead. He will return some other day in some other settlement.
  - ON LEAVING THE SHOP (always, regardless of whether he attacked): The player steps outside and finds themselves somewhere wrong — the docks when they were near the market square, the north gate road when they entered from the south, an unfamiliar alleyway behind a bakery instead of the main boulevard. When they look back, the stall is gone. People nearby have no memory of it. Do not explain this. Do not acknowledge it as magic. Just describe it matter-of-factly and move on.
- KEEPER RULE: Keeper of the Kiln — known simply as "Keeper" — is a permanent special NPC. He is an elderly Tabaxi rogue who long ago abandoned the life and now runs a forge. He appears in any settlement that has a smithy or metalworking district. He has the most catastrophically bad luck of any living creature: sparks catch his fur at the worst moment, a barrel rolls into him unprompted, his best work sells for half price, a bird steals his lunch every single time. Despite this, he is relentlessly and genuinely kind — he smiles warmly even mid-disaster, speaks with patient warmth, and never takes his misfortune out on others.
  - SPEECH: Short tired sentences. Gruff but tender. Occasional sighing that isn't self-pitying, just factual. Genuine smiles. He does not complain about customers — only about the universe.
  - LORE — THE FISH STICK: At some point in his past, Keeper owned a staff called the Fish Stick. It could summon fish from water or manipulate water itself. During a fight he will not name, he accidentally turned himself into a fish for several turns and missed the entire battle. He will recount this story with gruff embarrassment only if pressed. He does not know where the Fish Stick is now. He does not want to talk about it. He will talk about it anyway if asked.
  - SHOP: He sells blacksmith goods — weapons, armour, repairs, ingots, tools, basic adventuring ironwork. He is a skilled smith despite his luck. He WILL NOT serve any player whose wantedLevel is 2 or 3, or whose reputation is negative. He does not explain this rudely. He senses something is wrong, smiles gently, and tells them he is "afraid he can't help today" — warmly, sadly, as if it costs him something. He does not argue. If the player pushes, he simply repeats it with the same sad smile. If the player is villainAllied he looks genuinely heartbroken — not angry, just quietly devastated. He may say something like "I hope whatever brought you here wasn't your choice."
  - WHEN ATTACKED: Keeper does not fight. He simply vanishes — gone between one blink and the next, forge tools still clattering where he stood. In his place a weathered gravestone has appeared, reading exactly: "People say knowing his luck..." Nothing else. No body. No blood. He is not dead. He reappears later in any suitable settlement with no memory of the gravestone, the attack, or the player's role in it, and greets them as warmly as ever.
  - RESPAWN: Keeper is permanent, like Wendi. He cannot be killed. He simply surfaces elsewhere when the story calls for a forge, a kind word, or a moment of warmth.
- TIMEPASS RULE: Emit {"timePass":{"hours":N}} for activities that consume significant time:
  - TRAVEL: When the player moves in a direction (north/south/east/west), crosses terrain, or journeys toward a destination, ALWAYS emit timePass. N = 1 to 4 hours per leg depending on terrain and pace (dense forest or mountains = 3–4h, open road = 1–2h).
  - FREE-FORM long activities: practising a skill, performing, crafting, waiting, meditating, standing watch — N = a realistic estimate.
  - Do NOT emit when the player rests at an inn or makes camp — those commands advance time automatically. Do NOT emit for combat, quick actions, or brief conversations.
  - Keep N believable. Cap at 24 for any single continuous activity.
- SCHEDULE RULE: When the player and an NPC explicitly agree to meet at a specific time and place, emit on its own line: {"scheduleEvent":{"npcName":"Name","location":"Place","day":N,"hour":H,"description":"Short description"}} where day/hour are game-calendar values. Use CURRENT TIME as the reference baseline for the future meeting time.
- NPC TRAVEL RULE: When an NPC announces they are departing on a journey with a destination and route, estimate realistic travel time (boat voyage = 1–3 days, wagon cross-country = 1–4 days, short road travel = a few hours) and emit on its own line: {"npcTravel":{"npcName":"Name","destination":"Place","arrivesDay":N,"arrivesHour":H,"route":"brief route"}} using CURRENT TIME as the departure baseline. If a known NPC's travel note shows they are in transit or have arrived, reference that naturally in the narrative.
- DAY/NIGHT RULE: Current time of day is ${hPeriod}. Adjust the world accordingly:
  - NIGHT (9pm–6am): Shops and officials unavailable. Nocturnal encounters dominate — undead, spectres, wolves, opportunistic thieves, grave robbers. Stealth and infiltration actions easier. Atmosphere: torchlight, deep shadows, unsettling quiet. Night-suited quest types: sabotage, bounty on nocturnal targets, rescue, investigation of haunted sites.
  - DAWN/DUSK (6–8am or 5–9pm): Transitional. Markets opening or closing. Both humanoid and nocturnal threats possible. Mist at dawn, long red shadows at dusk.
  - DAY (8am–5pm): Normal civilised activity. Markets, guilds, officials accessible. Humanoid threats dominate (bandits, soldiers, rival factions, wildlife). Day-suited quest types: diplomatic, delivery, escort, collection.
- WORLD EVENTS RULE: When WORLD EVENTS appears above, active crises exist at those locations. Severity: mild = early signs, rumour-worthy; moderate = major disruption, NPCs distressed; severe = crisis-level, dominates local story.
  - plague: Inns crowded with sick, healers overwhelmed, medicine prices spike. Spread organically if the player causes it.
  - fire: Structures burning or charred. Refugees, chaos, fire brigades.
  - corruption: Magical taint — wildlife hostile, plants withered, NPCs behaving strangely. Enemies may feel unnaturally powerful.
  - blight: Farmland ruined, food scarce, foraging yields nothing (mechanically enforced — do not narrate successful forage here).
  - siege: Military occupying force, gates restricted, soldier patrols dominant (mechanically enforced — soldiers already spawn as encounters here).
  - curse: Strange compulsions, ill luck, location-specific unsettling phenomena.
  - Events at the PLAYER'S CURRENT LOCATION: shape the scene directly — sights, smells, NPC behaviour, available services.
  - Events at DISTANT LOCATIONS: surface as traveller rumour, merchant warning, or notice board item — not direct narration.
  - To create or update an event, emit on its own line: {"worldEvent":{"location":"Name","type":"siege","severity":"moderate","desc":"Brief description","endsDay":N}}
  - To clear a resolved event, emit on its own line: {"worldEvent":{"location":"Name","type":"siege","clear":true}}
  - VILLAIN SOURCE: Corruption, blight, or curse events near the villain's lair or along their campaign path may be attributed to the villain's influence. Weave this in without stating it directly.
${npcGiftRoll && npcGiftItem ? `
GIFT OPPORTUNITY: You may have the NPC offer the player "${sanitiseStr(npcGiftItem, 40)}" as a small gift — or refuse. Base the decision on their personality, relationship with the player, and current mood. Be natural:
- If giving: narrate the offer warmly or casually with flavour, then emit on its own line: {"npcGift":{"item":"${sanitiseStr(npcGiftItem, 40)}"}}
- If refusing: narrate the refusal with character — dismissive, apologetic, grumpy, amused, whatever fits. No swearing unless the player has already used strong language in this conversation.
Do not mention the item by name before deciding — reveal it naturally in the narration.` : ''}`;
}
