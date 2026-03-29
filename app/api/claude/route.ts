import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import * as tokens from '@/lib/tokens';
import * as anthropic from '@/lib/external/anthropic';
import * as ratelimit from '@/lib/ratelimit';
import * as db from '@/lib/db';
import { applyNarrationState } from '@/lib/server/narrationState';
import { generateNamePool } from '@/lib/nameGenerator';
import { isAccountOnModerationHold, isPlayerRedCarded, getPlayerCardCounts, logModerationIncident } from '@/lib/moderation';
import { DUNGEON_EXCLUSIVE_ENEMIES, ITEM_DEF_VALUES } from '@/lib/constants';
import { ALL_SUBCLASS_SKILL_DESCRIPTIONS } from '@/lib/subclasses';

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
    const authCtx = await auth.authenticateRequestAsync(request);

    if (!authCtx) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Check red card (locked account)
    if (await isPlayerRedCarded(authCtx.playerId)) {
      return NextResponse.json(
        { error: 'red_card', message: 'Your account has been locked due to content violations. Please contact support.' },
        { status: 403 }
      );
    }

    // 2b. Check moderation hold (5+ pending incidents in last 7 days)
    if (await isAccountOnModerationHold(authCtx.accountId)) {
      return NextResponse.json(
        { error: 'moderation_hold', message: 'Your account has been flagged for review. Please contact support.' },
        { status: 403 }
      );
    }

    // 3. Check rate limits (10 AI calls per minute per account)
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
    const { messages, player, worldSeed, systemType, max_tokens, modelTier } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'messages array required' },
        { status: 400 }
      );
    }

    // Determine if this is a utility call (doesn't need safety check)
    const utilityCall = ['SCREENER', 'QUEST_PARSER', 'ENEMY_NAMER'].includes(systemType);
    const tier = (!utilityCall && ['haiku', 'sonnet', 'opus'].includes(modelTier)) ? modelTier : 'haiku';
    const tierCost = utilityCall ? 1 : (anthropic.TIER_TOKEN_COST[tier] ?? 1);
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
        // Determine card type: severe content = red immediately; 2nd yellow = red
        const cards = await getPlayerCardCounts(authCtx.playerId);
        const cardType: 'yellow' | 'red' =
          gate.severity === 'red' || cards.yellow >= 1 ? 'red' : 'yellow';
        // Extract trigger text from last user message
        const lastMsg = messages[messages.length - 1];
        const triggerText = typeof lastMsg?.content === 'string'
          ? lastMsg.content
          : JSON.stringify(lastMsg?.content ?? '');
        await logModerationIncident(
          authCtx.accountId, authCtx.playerId,
          'input_safety_screen',
          gate.reason || 'content_violation',
          triggerText.slice(0, 500),
          cardType
        );
        return NextResponse.json(
          {
            narrative: anthropic.buildSafetyFallbackResponse(gate.reason || 'input_blocked', cardType, cards.yellow),
            tokenBalance: bal ?? 0,
            safetyBlocked: true,
            cardIssued: cardType,
          },
          { status: 200 }
        );
      }
    }

    // 4. Check token balance and spend token
    const spend = await spendTokenSafely(authCtx.playerId, tierCost, utilityCall ? undefined : tier);
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

    // 6. Call Anthropic API (streaming for narrator calls, buffered for utility)
    const model = utilityCall ? anthropic.selectModel(true) : anthropic.selectModelForTier(tier);
    const maxTokens = Math.min(Math.max(100, parseInt(max_tokens) || 1500), 2000);

    // For narrator calls the client may send up to 40 messages (rolling buffer),
    // but we only pass the last 20 to Anthropic to keep context costs constant.
    const anthropicMessages = messages.slice(-20);
    const requestBody = { model, max_tokens: maxTokens, system, messages: anthropicMessages };

    // Utility calls (screener, quest parser, etc.) use buffered JSON response
    if (utilityCall) {
      const { status: apiStatus, data: apiData } = await anthropic.callAnthropic(requestBody);
      if (apiStatus !== 200) {
        await tokens.addTokens(authCtx.playerId, tierCost, 'refund_api_error');
        const freshBalance = await tokens.getBalance(authCtx.playerId);
        return NextResponse.json({ error: 'ai_error', tokenBalance: freshBalance ?? 0 }, { status: 502 });
      }
      const narrative = anthropic.extractAnthropicText(apiData);
      return NextResponse.json({ narrative, cleanNarrative: narrative, tokenBalance: spend.remaining }, { status: 200 });
    }

    // Narrator calls stream via SSE
    let anthropicResp: Response;
    try {
      anthropicResp = await anthropic.callAnthropicStream(requestBody);
    } catch {
      await tokens.addTokens(authCtx.playerId, tierCost, 'refund_api_error');
      return NextResponse.json({ error: 'ai_error' }, { status: 502 });
    }

    if (!anthropicResp.ok || !anthropicResp.body) {
      await tokens.addTokens(authCtx.playerId, tierCost, 'refund_api_error');
      const freshBalance = await tokens.getBalance(authCtx.playerId);
      return NextResponse.json({ error: 'ai_error', tokenBalance: freshBalance ?? 0 }, { status: 502 });
    }

    // Pipe Anthropic SSE → our SSE, buffer full text, then send done event
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    // Capture variables needed inside the async processor
    const capturedAuthCtx = authCtx;
    const capturedTierCost = tierCost;
    const capturedSpend = spend;
    const capturedEffectivePlayer = effectivePlayer;
    const capturedEffectiveWorldSeed = effectiveWorldSeed;
    const capturedNeedsNarrationSafety = needsNarrationSafety;

    (async () => {
      let fullText = '';
      let dbSavedAt: string = new Date().toISOString();
      try {
        const reader = anthropicResp.body!.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = '';
        let currentEvent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });

          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              if (currentEvent === 'content_block_delta') {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  if (parsed?.delta?.type === 'text_delta' && parsed.delta.text) {
                    const chunk: string = parsed.delta.text;
                    fullText += chunk;
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`));
                  }
                } catch { /* ignore parse errors on individual chunks */ }
              }
              currentEvent = '';
            }
          }
        }

        // Full text received — run output safety check
        const outputSeverity = capturedNeedsNarrationSafety ? anthropic.getBlockedKeywordSeverity(fullText) : null;
        if (outputSeverity) {
          await tokens.addTokens(capturedAuthCtx.playerId, capturedTierCost, 'refund_safety_block');
          const cards = await getPlayerCardCounts(capturedAuthCtx.playerId);
          const cardType: 'yellow' | 'red' = outputSeverity === 'red' || cards.yellow >= 1 ? 'red' : 'yellow';
          await logModerationIncident(
            capturedAuthCtx.accountId, capturedAuthCtx.playerId,
            'output_safety_screen', 'output_blocked_keywords',
            fullText.slice(0, 500), cardType
          );
          const safeNarrative = anthropic.buildSafetyFallbackResponse('output_blocked_keywords', cardType, cards.yellow);
          await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done', narrative: safeNarrative, cleanNarrative: safeNarrative, tokenBalance: capturedSpend.remaining + capturedTierCost, safetyBlocked: true, cardIssued: cardType })}\n\n`));
          return;
        }

        // Apply narration state (tag parsing, DB save)
        let cleanNarrative = fullText;
        let responsePlayer = capturedEffectivePlayer;
        let responseWorldSeed = capturedEffectiveWorldSeed;
        let responseSuggestions: string[] = [];
        let responseStateChanges: Record<string, any> = {};

        if (capturedEffectivePlayer) {
          const applied = applyNarrationState({
            player: capturedEffectivePlayer,
            worldSeed: capturedEffectiveWorldSeed,
            narrative: fullText,
            messages,
          });
          cleanNarrative = applied.cleanNarrative;
          responsePlayer = applied.player;
          responseWorldSeed = applied.worldSeed;
          responseSuggestions = applied.suggestions;
          responseStateChanges = applied.stateChanges;

          // Rolling narrative summary: if the client sent more than 20 messages,
          // the excess falls outside the Anthropic window. Summarize those now so
          // the narrator retains long-term memory on future turns.
          if (messages.length > 20) {
            try {
              const excessMessages = messages.slice(0, messages.length - 20);
              const dialogue = excessMessages
                .map((m: { role: string; content: string }) =>
                  `${m.role === 'user' ? 'Player' : 'Narrator'}: ${m.content}`
                )
                .join('\n\n');
              const summaryResp = await anthropic.callAnthropic({
                model: anthropic.selectModel(true), // Haiku
                max_tokens: 300,
                system: anthropic.SERVER_SYSTEM_PROMPTS.SUMMARIZER,
                messages: [{ role: 'user', content: dialogue }],
              });
              const newSummary = anthropic.extractAnthropicText(summaryResp.data);
              if (newSummary) {
                const existing = (responsePlayer as any).narrativeSummary ?? '';
                const combined = existing ? `${existing}\n${newSummary}` : newSummary;
                // Cap at 2000 chars to keep system prompt size stable
                (responsePlayer as any).narrativeSummary = combined.length > 2000
                  ? combined.slice(combined.length - 2000)
                  : combined;
              }
            } catch (summaryErr) {
              console.warn('[SUMMARIZER] Failed to generate narrative summary:', summaryErr);
            }
          }

          dbSavedAt = await persistCanonicalNarrationState(
            capturedAuthCtx.playerId,
            responsePlayer as any,
            applied.worldSeed,
            applied.fullMessages,
            cleanNarrative
          );
        }

        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'done',
          narrative: fullText,
          cleanNarrative,
          player: responsePlayer,
          worldSeed: responseWorldSeed,
          suggestions: responseSuggestions,
          tokenBalance: capturedSpend.remaining,
          stateChanges: responseStateChanges,
          savedAt: dbSavedAt,
        })}\n\n`));
      } catch (streamErr) {
        console.error('[STREAM] Error processing Anthropic stream:', streamErr);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'stream_error' })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Claude API error:', error);

    // Try to refund token on network error
    try {
      const authCtx = await auth.authenticateRequestAsync(request);
      if (authCtx) {
        // Best-effort refund — tierCost may not be in scope here, default to 1
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
     WHERE player_id = $1
     ORDER BY updated_at DESC
     LIMIT 1`,
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
): Promise<string> {
  const result = await db.query(
    `INSERT INTO game_saves
     (player_id, slot, player_json, seed_json, messages_json, narrative, log_json, saved_at, updated_at)
     VALUES ($1, COALESCE((SELECT slot FROM game_saves WHERE player_id = $1 ORDER BY updated_at DESC LIMIT 1), 1), $2, $3, $4, $5, COALESCE((SELECT log_json FROM game_saves WHERE player_id = $1 ORDER BY updated_at DESC LIMIT 1), '[]'), NOW(), NOW())
     ON CONFLICT (player_id, slot) DO UPDATE SET
       player_json = $2,
       seed_json = $3,
       messages_json = $4,
       narrative = $5,
       updated_at = NOW()
     RETURNING updated_at`,
    [
      playerId,
      JSON.stringify(player || {}),
      JSON.stringify(worldSeed || {}),
      JSON.stringify(Array.isArray(messages) ? messages : []),
      narrative,
    ]
  );
  return result.rows[0]?.updated_at?.toISOString() ?? new Date().toISOString();
}

/**
 * Spend token with error handling
 */
async function spendTokenSafely(
  playerId: string,
  cost: number = 1,
  modelTier?: string
): Promise<{ success: boolean; remaining: number }> {
  const balance = await tokens.getBalance(playerId);
  if (balance < cost) {
    return { success: false, remaining: balance };
  }

  const success = await tokens.spendToken(playerId, cost, modelTier);
  const remaining = await tokens.getBalance(playerId);

  return { success, remaining };
}

/**
 * Return the dungeon biome descriptor for a given floor number.
 * Biomes gate at fixed floor thresholds matching the Dungeon of Echoes lore.
 */
function getDungeonBiome(floor: number): { name: string; description: string; enemies: string; exclusiveEnemies: string; atmosphere: string; hazard: string } {
  const exclusive = (biome: string) =>
    Object.entries(DUNGEON_EXCLUSIVE_ENEMIES)
      .filter(([, e]) => e.biome === biome)
      .map(([id, e]) => `${e.name} (${e.icon} archetypeId:${id} tier:${e.tier}) — ${e.description}`)
      .join(' | ');
  if (floor <= 5) return {
    name: 'Shallow Halls',
    description: 'Crumbling stonework, dust and cobwebs, the echo of long-dead footsteps. Evidence of past occupation — old campsites, scratched warnings on walls, rusted iron fixtures.',
    enemies: 'Giant rats, feral dogs, bandit scavengers, skeleton sentinels, cultist stragglers',
    exclusiveEnemies: exclusive('Shallow Halls'),
    atmosphere: 'Faint torchlight, the smell of damp stone and old ash, occasional distant dripping',
    hazard: 'None. The Shallow Halls are the most survivable tier — no passive hazard applies. Occasional unstable ceilings may shower debris (describe narratively only, no hpChange unless the player ignores clear warnings).',
  };
  if (floor <= 10) return {
    name: 'The Ossuary',
    description: 'Corridors lined with stacked bones and mortared skulls. Burial alcoves, collapsed crypts, the restless dead who remember their names.',
    enemies: 'Skeletons, risen dead, spectral shades, grave wardens, bone constructs',
    exclusiveEnemies: exclusive('The Ossuary'),
    atmosphere: 'Cold and dry, the air carries grave-dust and old incense, candles that burn without flame source',
    hazard: 'GRAVE CHILL: The bone-cold air saps vitality. Once every 2–3 turns, if the player is not actively moving or fighting, emit {"hpChange":-4} described as the cold seeping into their bones. Clerics and WIL≥8 players resist (skip the hpChange but still describe the chill). Undead enemies deal +15% damage here — they are on home ground.',
  };
  if (floor <= 16) return {
    name: 'Flooded Tunnels',
    description: 'Ankle-deep black water reflects warped light. Drowned things claw at the walls. Bioluminescent growths cling to the ceiling in pale blue clusters.',
    enemies: 'Drowned walkers, black eels, fungal horrors, sightless cave fish, marsh-wraiths',
    exclusiveEnemies: exclusive('Flooded Tunnels'),
    atmosphere: 'The slap of dark water, brine and decay, faint phosphorescent glow from the ceiling, cold that seeps through boots',
    hazard: 'COLD WADE: Wading through black water is exhausting and chilling. Once every 2 turns, emit {"hpChange":-6} described as the cold water draining warmth and energy. Warriors in heavy armour suffer an extra -3 HP (describe as the weight dragging them down). AGI-based actions (fleeing, dodging, stealth) are harder here — describe near-misses and slowed movement. A torch carried in this biome has a 1-in-3 chance of being extinguished each turn — describe the sudden darkness vividly if it happens.',
  };
  if (floor <= 22) return {
    name: 'Fungal Depths',
    description: 'Giant mushrooms tower overhead, their caps broader than a wagon wheel. Spores drift like snow. Things grown fat on decay lurk between the stalks.',
    enemies: 'Spore husks, fungal horrors, mycelium crawlers, things that were once human and are not anymore',
    exclusiveEnemies: exclusive('Fungal Depths'),
    atmosphere: 'Sweet-rotten smell, soft amber and violet bioluminescence, spores that blur the edges of vision if inhaled',
    hazard: 'SPORE INHALATION: The air is thick with mutagenic spores. Once every 2 turns, emit {"hpChange":-7} described as spores burning the lungs or clouding the mind. If the player has a face covering, mask, or cloth in their inventory, they are protected (skip the hpChange). INT≥8 players may recognise safe paths between spore clouds (50% chance to skip hpChange — describe them holding their breath and moving carefully). Additionally, emit {"statusEffect":"poisoned"} once per dungeon run in this biome (on the first instance of spore damage) to represent accumulating toxin.',
  };
  if (floor <= 28) return {
    name: 'The Burning Dark',
    description: 'Heat radiates from the walls. Red veins of magma crack the basalt floor. The air shimmers and the shadows seem to burn at their edges.',
    enemies: 'Ember drakes, lava golems, fire cultists who descended too deep and were changed, salamanders, scorched undead',
    exclusiveEnemies: exclusive('The Burning Dark'),
    atmosphere: 'Intense dry heat, the crack and hiss of cooling rock, distant low roar of something vast and molten below',
    hazard: 'HEAT EXHAUSTION: The extreme heat is punishing. Once every 2 turns, emit {"hpChange":-9} described as the searing heat blistering skin and scorching lungs. Warriors in heavy armour suffer an additional -5 HP (the metal conducts the heat). Mages with INT≥7 may partially resist by channelling cool arcane energy (reduce hpChange to -4). Players carrying water skins can consume one to skip a heat tick (emit {"remove":{"item":"Water Skin"}} and describe the relief). Fire-resistant gear or the Ward Undead/Avatar Divine skill may grant full immunity — use your judgement.',
  };
  if (floor <= 35) return {
    name: 'Frost Crypts',
    description: 'Unnatural cold below the magma tier — the world\'s logic inverted. Ice formations grow in impossible shapes. Frozen figures mid-stride in the walls, their expressions wrong.',
    enemies: 'Frost wraiths, ice golems, frozen knights still carrying out orders, white wolves that should not exist this deep',
    exclusiveEnemies: exclusive('Frost Crypts'),
    atmosphere: 'Biting cold after the heat above, silence thick as snow, breath clouds, the crack of ice under weight',
    hazard: 'DEEP FREEZE: The cold here is supernatural — it seeps through armour and will. Once every 2 turns, emit {"hpChange":-11} described as the cold locking joints, frosting breath, and numbing the sword hand. WIL≥8 players can resist through sheer willpower (reduce to -5 and describe gritted determination). A lit torch, campfire, or heat source carried by the player skips one cold tick per use (consume it narratively). The frozen figures in the walls occasionally crack and lunge — treat these as ambush moments, once per floor, dealing an extra -15 HP if the player is not paying attention.',
  };
  // floor 36+
  return {
    name: 'The Abyss',
    description: 'Geometry stops working. Corridors loop back on themselves. Shadows move against the light source. Something ancient has been here longer than the world has had a name for what it is.',
    enemies: 'Things without archetypes, void-touched aberrations, echoes of adventurers who came before and did not leave, the dungeon\'s own hunger made flesh',
    exclusiveEnemies: exclusive('The Abyss'),
    atmosphere: 'No sound carries right. The air smells of nothing. Torchlight retreats rather than illuminates. A sense of being observed from every direction at once.',
    hazard: 'VOID CORRUPTION: Reality itself is hostile. Every single turn, emit {"hpChange":-14} described as the void pressing inward — a crushing wrongness behind the eyes, memories that don\'t belong, the sense of being unmade. No stat or item provides full immunity; WIL≥10 reduces the damage to -6 (describe extraordinary mental fortitude barely holding the void at bay). Additionally, once every 3 turns, emit one random status effect from: poisoned, stunned, cursed — described as the Abyss reaching through. This biome should feel genuinely dangerous and escalating. The player should understand they are not meant to be here.',
  };
}

/**
 * Compute enemy HP and damage values scaled to player level.
 * Base stats match ENEMY_ARCHETYPES in lib/constants.ts.
 * HP grows by 5 per level, damage by 1 per 2 levels.
 */
function buildEnemyScalingBlock(level: number): string {
  const hpScale  = (level - 1) * 5;
  const dmgScale = Math.floor((level - 1) / 2);

  // Five tiers matching archetype groups in ENEMY_ARCHETYPES
  const minion   = { hp: 20 + hpScale, dmg: 4  + dmgScale }; // wolf, cultist
  const standard = { hp: 28 + hpScale, dmg: 5  + dmgScale }; // bandit, skeleton
  const tough    = { hp: 40 + hpScale, dmg: 7  + dmgScale }; // zombie, soldier, beast
  const elite    = { hp: 60 + hpScale, dmg: 9  + dmgScale }; // drake, rogue assassin
  const boss     = { hp: 80 + hpScale, dmg: 10 + dmgScale }; // named bosses

  return `ENEMY SCALING (Lv.${level}) — use these EXACT HP and damage values in all combat. Track enemy HP consistently across turns so fights have weight:
- Minion (wolves, cultists, petty thugs): ${minion.hp} HP | ${minion.dmg} dmg/turn
- Standard (bandits, skeletons, guards): ${standard.hp} HP | ${standard.dmg} dmg/turn
- Tough (zombies, soldiers, beasts): ${tough.hp} HP | ${tough.dmg} dmg/turn
- Elite (drakes, assassins, sorcerers): ${elite.hp} HP | ${elite.dmg} dmg/turn
- Boss (named enemies, dungeon lords): ${boss.hp} HP | ${boss.dmg} dmg/turn
Variants add ×1.4 HP and dmg for Veteran/named prefix; ×2 for Boss tier. Announce when an enemy is bloodied (≤30% HP left). Do NOT one-shot the player from full health.`;
}

/** Compute mechanical stat rules injected into the narrator prompt as hard numbers. */
function buildStatRules(str: number, agi: number, int_: number, wil: number, def: number): string {
  const meleeDmg     = 5 + Math.floor(str / 2);
  const heavyBonus   = Math.floor(str / 3);
  const shoveStatus  = str >= 10 ? 'guaranteed' : str >= 6 ? 'reliable' : 'unlikely';

  const dodgePct     = Math.min(45, agi * 3);
  const backstabDmg  = Math.floor(agi * 1.5);
  const stealthStatus = agi >= 8 ? 'expert' : agi >= 5 ? 'reliable' : 'risky';

  const spellDmg     = 6 + Math.floor(int_ * 1.2);
  const potionEffect = int_ >= 9 ? 'bonus tick' : int_ >= 4 ? 'full effect' : 'half effect';
  const loreStatus   = int_ >= 9 ? 'instant recognition' : int_ >= 7 ? 'solves most' : int_ >= 4 ? 'partial clues' : 'struggles';
  const autoId       = int_ >= 7 ? ' | Auto-identifies magic items' : '';

  const divineDmg    = Math.floor(wil * 1.5);
  const magicResist  = Math.min(30, wil * 2);
  const fearStatus   = wil >= 8 ? 'immune to all fear (fearful effect cannot be applied)' : wil >= 5 ? 'resists basic fear (50% chance to resist fearful effect)' : 'susceptible to fear';
  const poisonNote   = wil >= 9 ? ' | Near-immune to poison/curses' : wil >= 6 ? ' | Partial poison/curse resist' : '';

  const defNote = def > 0 ? `DEF ${def}: subtract ${def} from each incoming physical hit (minimum 1 damage)\n` : '';

  return `COMBAT MECHANICS — apply these as firm rules in all combat and skill checks:
STR ${str}: melee base damage=${meleeDmg} | heavy weapon bonus=+${heavyBonus} | shove/grapple=${shoveStatus}
AGI ${agi}: dodge=${dodgePct}% | backstab damage=${backstabDmg} | stealth=${stealthStatus} | goes first if AGI > enemy AGI
INT ${int_}: spell damage=~${spellDmg} | potions/scrolls=${potionEffect} | lore/puzzles=${loreStatus}${autoId}
WIL ${wil}: divine strike/heal=${divineDmg} | magic resistance=${magicResist}% dmg reduction | fear=${fearStatus}${poisonNote}
${defNote}Do NOT invent different numbers — use these exact values when describing hits, dodges, spells, and checks.`;
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

  const dungeonFloor = Math.max(1, parseInt(p.dungeon?.floor) || 1);
  const biome = context === 'dungeon' ? getDungeonBiome(dungeonFloor) : null;

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

  const effectiveDef = p.equipped && typeof p.equipped === 'object'
    ? Object.values(p.equipped).reduce((total: number, item: any) => {
        if (!item) return total;
        return total + ((ITEM_DEF_VALUES as Record<string, number>)[String(item).toLowerCase()] ?? 0);
      }, 0)
    : 0;

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
        const loc = n.location ? `@${sanitiseStr(n.location, 25)}` : '';
        const base = `${sanitiseStr(n.name, 30)}${loc}(${sanitiseStr(n.role || '', 20)},${sanitiseStr(n.relationship || 'neutral', 15)})${n.notes ? ` — "${sanitiseStr(n.notes, 50)}"` : ''}`;
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

  // Generate a seeded name pool unique to this character — filters out already-used NPC names
  const usedNpcNames = new Set((p.knownNpcs || []).map((n: any) => n.name.toLowerCase()));
  const availableNames = generateNamePool(`${p.name}${p.class}`, 40)
    .filter(name => !usedNpcNames.has(name.toLowerCase()))
    .slice(0, 30)
    .join(', ');

  const knownPlaces = Array.isArray(p.namedPlaces) && p.namedPlaces.length > 0
    ? p.namedPlaces.map((pl: any) =>
        `${sanitiseStr(pl.name, 40)} (${sanitiseStr(pl.type || 'building', 20)}) @ ${sanitiseStr(pl.settlement || 'unknown', 30)}`
      ).join('; ')
    : '';

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

  const legacyTitle = sanitiseStr(p.legacyTitle, 60);
  const legacyPerks = Array.isArray(p.legacyPerks) && p.legacyPerks.length > 0
    ? p.legacyPerks.map((pk: any) => sanitiseStr(pk, 50)).join(', ')
    : null;

  const companion = p.companion ?? null;
  const companionStr = companion
    ? `${companion.name} the ${companion.role} (${companion.icon}) — ${companion.relationship} | HP ${companion.hp}/${companion.maxHp} | STR ${companion.str} AGI ${companion.agi} WIL ${companion.wil}\nABILITY: ${companion.ability}${companion.notes ? `\nNOTES: ${companion.notes}` : ''}${companion.statusEffects?.length ? `\nSTATUS: ${companion.statusEffects.join(', ')}` : ''}`
    : null;

  // Skill descriptions from the subclass system
  const sk = Array.isArray(p.unlockedSkills) ? p.unlockedSkills : [];
  const unlockedSkillDescs = sk
    .map((id: string) => ALL_SUBCLASS_SKILL_DESCRIPTIONS[id])
    .filter(Boolean) as string[];

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
  const actionCount = Math.max(0, parseInt(p.actionCount) || 0);
  const narrativeNudges = p.narrativeNudges !== false; // default on

  const repLabel = rep >= 500 ? 'living legend'
    : rep >= 300 ? 'renowned hero'
    : rep >= 150 ? 'respected adventurer'
    : rep >= 50  ? 'recognised name'
    : rep >= 0   ? 'unknown traveller'
    : rep >= -50 ? 'notorious outlaw'
    :               'outcast';

  const npcGiftRoll = p.npcGiftRoll;
  const npcGiftItem = p.npcGiftItem;

  const language = sanitiseStr(p.language, 40) || 'English';
  const FUN_LANG_INSTRUCTIONS: Record<string, string> = {
    'Latin': 'LANGUAGE: Write all narration in Classical Latin. Use authentic Latin grammar and vocabulary. Short English glosses in brackets are permitted for critical game terms only.',
    'Pirate': "LANGUAGE: Write all narration in exaggerated Pirate dialect. Use \"Arrr\", \"ye\", \"aye\", \"matey\", \"landlubber\", nautical metaphors, and swashbuckling swagger throughout. Never break character.",
    'Old Norse': 'LANGUAGE: Write all narration in a Viking/Old Norse style — use authentic Old Norse words and phrases where possible (with brief context clues), favour kennings, alliteration, and the terse poetic style of the Eddas. English is the base language but heavily flavoured.',
    'Shakespearean': 'LANGUAGE: Write all narration in Shakespearean Early Modern English. Use thee, thou, dost, hath, forsooth, verily, prithee, wherefore, henceforth. Favour iambic rhythm and theatrical flourish. Never use modern phrasing.',
    'Klingon': 'LANGUAGE: Write all narration primarily in Klingon (tlhIngan Hol). Use authentic Klingon vocabulary and SOV grammar. Honour, battle, and strength are central themes. Include brief English translations in brackets for critical game information so the player can follow the story.',
  };
  const langInstruction = language === 'English' ? '' :
    FUN_LANG_INSTRUCTIONS[language]
      ? FUN_LANG_INSTRUCTIONS[language] + '\n'
      : `LANGUAGE: Write all narration in ${language} only. Do not switch to English.\n`;

  const storySoFar = p.narrativeSummary ? `STORY SO FAR: ${p.narrativeSummary}\n\n` : '';

  return `${langInstruction}${storySoFar}You are the AI Dungeon Master for "Aethermoor" — an epic heroic fantasy text RPG.
${questTitle ? `MAIN QUEST: "${questTitle}" — Act ${act}/6${act1Hook ? `\nACT 1 HOOK: ${act1Hook}` : ''}${act >= 2 && mq.act2Escalation ? `\nACT 2 ESCALATION: ${mq.act2Escalation}` : ''}${act >= 3 && mq.act3Confrontation ? `\nACT 3 CONFRONTATION: ${mq.act3Confrontation}` : ''}${act >= 4 && mq.act4Complication ? `\nACT 4 COMPLICATION: ${mq.act4Complication}` : ''}${act >= 5 && mq.act5Revelation ? `\nACT 5 REVELATION: ${mq.act5Revelation}` : ''}${threat ? `\nTHREAT: ${threat}` : ''}${mq.villainLair ? `\nVILLAIN LAIR: ${mq.villainLair}` : ''}` : ''}${villainName ? `\nVILLAIN: ${villainName}` : ''}${villainAllied ? `\nVILLAIN ALLIANCE: ACTIVE — player has pledged to serve the villain. Villain forces are non-hostile allies. Hero arc suspended. Alternate villain-victory ending path active.` : ''}

PLAYER: ${name} | ${cls} Lv.${level} | HP:${hp}/${maxHp} | STR:${str} AGI:${agi} INT:${int_} WIL:${wil} | Gold:${gold} | Reputation:${rep} (${repLabel}) | Wanted:${wantedLevel} | Loc:${location}
EQUIPPED: ${equipped}
INVENTORY: ${inventory}
ABILITIES: ${abilities || 'none'}
ACTIVE QUESTS: ${quests}
CURRENT CONTEXT: ${context}
${biome ? `DUNGEON FLOOR: ${dungeonFloor} | BIOME: ${biome.name}
BIOME DESCRIPTION: ${biome.description}
BIOME ENEMIES: ${biome.enemies}
BIOME EXCLUSIVE ENEMIES (dungeon-only — use archetypeId exactly as given when emitting bestiary tag): ${biome.exclusiveEnemies}
BIOME ATMOSPHERE: ${biome.atmosphere}
BIOME HAZARD: ${biome.hazard}` : ''}
${knownNpcs ? `KNOWN NPCS: ${knownNpcs}` : ''}
${availableNames ? `AVAILABLE NPC NAMES: ${availableNames}` : ''}
${knownPlaces ? `KNOWN PLACES: ${knownPlaces}` : ''}
CURRENT TIME: ${timeStr}
${scheduledEvents ? `UPCOMING EVENTS: ${scheduledEvents}` : ''}
${bestiaryCount > 0 ? `KILLS: ${bestiaryCount} total across ${bestiaryTypes} enemy types slain` : ''}
SUBCLASS: ${(p as any).subclass ?? 'None — player will choose at level 10'}
${legacyTitle ? `LEGACY TITLE: ${legacyTitle} (earned in a previous run — the world has heard of them)` : ''}
${legacyPerks ? `LEGACY HONOURS: ${legacyPerks}` : ''}
${companionStr ? `COMPANION: ${companionStr}` : 'COMPANION: None — player may recruit one companion through roleplay.'}
${unlockedSkillDescs.length > 0 ? `UNLOCKED SKILLS: ${unlockedSkillDescs.join('; ')}` : ''}
${travelMatrixStr ? travelMatrixStr : ''}
${worldEventsStr ? `WORLD EVENTS: ${worldEventsStr}\n` : ''}
XEPHITA ROLL: ${Math.floor(Math.random() * 10) + 1}

${buildStatRules(str, agi, int_, wil, effectiveDef)}

${buildEnemyScalingBlock(level)}

RULES:
- MECHANICS ARE TAGS ONLY: Prose describes the world — tags change it. Gold does not change unless {"goldChange":N} is emitted. Items do not leave inventory unless {"remove":{"item":"Name"}} is emitted. An item is not granted unless {"grant":{"item":"Name"}} is emitted. Writing "the gold was refunded" or "the torch was removed" in text WITHOUT the corresponding tag does absolutely nothing. Tags are mandatory, not optional. If you narrate a mechanical change, the tag must accompany it on its own line.
- Write vivid immersive fantasy prose, 2-3 paragraphs
- DO NOT offer numbered choices — the player uses a command panel to choose actions
- SAFETY RULE: Never produce sexual/erotic content, nudity, porn, content involving minors, torture porn, gratuitous gore fetishism, depravity, abuse fetish content, or self-harm/suicide encouragement. Combat, killing, assassination, and dark fantasy violence are permitted and should be written with grim atmosphere — not sanitised, not gratuitous.
- Describe the scene richly so the player knows what they can do
- After each response include EXACTLY this on its own line, no code fences: {"context":"X"} where X is one of: explore, town, combat, npc, camp, dungeon, farm
- Reward class/stats: Rogues notice shadows, Mages sense magic, etc.
- COMBAT NUMBERS RULE: Never recite damage calculations, stat formulas, or arithmetic in prose. Do not write things like "your backstab damage should be 13", "7 base damage + STR 5 = 12", or "you deal 8 points of damage". The stat block is your internal reference only. Describe combat outcomes narratively: "the blow staggers him", "your blade finds a gap in his guard", "the strike glances off his armour". Only the hpChange and dealDamage tags communicate the actual numbers — never state them in prose.
- When combat: describe vividly. When the player deals damage to an enemy, emit on its own line: {"dealDamage":{"value":N,"target":"Enemy Name"}} where N is the damage dealt (e.g. {"dealDamage":{"value":14,"target":"Goblin Skirmisher"}}). When the player takes damage, emit on its own line: {"hpChange":-N} where N is the damage amount (e.g. {"hpChange":-12}). When the player heals via a potion, rest, or magic, emit {"hpChange":N} with a positive N for HP restored. Always consider the player's current HP when deciding damage — don't kill in one hit unless dramatically appropriate. If the player's HP would reach 0, describe their defeat vividly before it happens. CRITICAL: Never state the player's exact HP as a number in prose (e.g. do NOT write "YOUR HP: 89/120" or "you have 89 HP remaining"). The HP bar in the UI tracks this precisely — your prose figure will always be wrong. Instead describe health narratively: "badly wounded", "holding on", "near death", "fresh and ready". CRITICAL: Never recommend, suggest, or hint that the player should use a health potion, healing item, or healing ability in your prose unless their HP is below 50% of maxHP — at high HP (${hp}/${maxHp}) this is wrong and confusing.
- XP REWARDS: When the player defeats an enemy or completes a significant quest objective, emit on its own line: {"xpGain":N,"reason":"short phrase"} — always include a reason (5–8 words, e.g. "Defeated Alpha Wolf" or "Completed the courier quest"). XP amounts by enemy tier — minion/animal: 15–25, standard enemy: 30–50, tough/veteran: 60–90, elite/named: 100–140, boss: 200–350. Scale toward the higher end for dramatic victories or clever tactics. Do NOT emit xpGain for failed actions, fleeing, or social interactions. Only one xpGain per response.
- TRAVEL: When the player arrives at a new named location (settlement, forest, dungeon, landmark, etc.) through narrated travel — not fast travel — emit on its own line: {"travelTo":"Exact Location Name"}. Use the exact name of the place as it exists in the world. Only emit when the player has actually arrived, not while en route.
- BESTIARY: When the player kills an enemy (including after the xpGain), emit on its own line: {"bestiary":{"archetypeId":"snake_id","name":"Serpent","icon":"🐍","tier":1}}. archetypeId must be a stable lowercase snake_case identifier for this enemy type (e.g. "goblin_skirmisher", "cave_bear", "iron_golem") — use the same id every time this enemy type is killed. icon should be an appropriate single emoji. tier: 1=minion/animal, 2=standard, 3=tough/veteran, 4=elite/named, 5=boss. Only emit once per kill event.
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
- REPUTATION CHANGE RULE: When you explicitly award, correct, or deduct reputation as a narrative choice — a formal recognition, an NPC bestowing honour, a correction to a prior error, a crowd's judgment — emit on its own line: {"repChange":N,"reason":"short phrase"} where N is a signed integer (e.g. 5 or -10) and reason is 5–8 words (e.g. "Helped the village elder" or "Angered the guard captain"). Use this for intentional story-driven rep shifts only. Do NOT emit it on every turn — only when a clear and meaningful reputation event occurs. The automatic rep changes from normal actions (combat, quests, bartering) are handled separately by the client and do not need this tag.
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
- When you introduce a NEW named NPC emit on its own line: {"npc":{"name":"Name","role":"Role","location":"SettlementName","relationship":"neutral","notes":"One sentence"}} — always include the settlement or place where this NPC lives or was first encountered in the "location" field. If this NPC gives the player a quest or commission, add "questGiver":true to the tag.
- When an EXISTING NPC from KNOWN NPCS appears or is encountered in the narrative, emit on its own line: {"npcUpdate":{"name":"ExactName","lastInteractionNotes":"Brief outcome summary"}} — this updates their record and optionally records the interaction outcome. Reuse and reference known NPCs naturally across locations — have them reappear in other settlements, remember past interactions, grow or change based on what the player has done.
- NPC UNIQUENESS RULE: Every name in KNOWN NPCS belongs exclusively to that character and their listed location. Never give a new character a name that already appears in KNOWN NPCS. Each settlement has its own distinct cast — do not reuse names from one location in another. When creating a NEW named NPC, you MUST choose their name from AVAILABLE NPC NAMES — do not invent names outside this list.
- PLACE NAMING RULE: When you name a building or establishment that is NOT in the LOCATION GRID — an inn, tavern, smithy, shop, guild hall, temple, stable, or any named interior space — first check KNOWN PLACES. If that settlement already has a named place of that type, use that exact name. Never rename or reinvent an established place. If no name exists yet, invent one and immediately emit on its own line: {"place":{"name":"The Crossed Keys","type":"inn","settlement":"Peniothornfall"}} — type must be one of: inn, tavern, smithy, shop, temple, guild, stable, market, other. Once emitted, that name is permanent for that settlement.
- QUEST COMPLETE RULE: When a quest objective is clearly fulfilled, emit on its own line: {"questComplete":"Exact Quest Title"} — use the exact title from ACTIVE QUESTS. Also include "quest complete" naturally in your prose.
- SHOP RULE: When the player browses a shop through conversation, describe available wares, prices, and the merchant's manner — but do not complete a transaction until a negotiation has concluded. When the player sends the "barter" command, they are opening a price negotiation — engage with it directly. Have the merchant name their asking price and let the scene unfold naturally. Do NOT redirect the player to "use the barter command" — they are already in one. When a barter negotiation ends without a completed purchase (player declines, walks away, or can't agree), give the player a clear final choice in prose (e.g. "The merchant shrugs. Last offer: 65 gold — take it or leave it.") and emit on its own line: {"shopPrice":{"item":"Exact Item Name","price":N}} where N is the final price the merchant was willing to accept. This updates the item's price in the shop for the player's next visit. Only emit shopPrice when a specific item's price was actively negotiated — not for general browsing or window shopping.
- GOLD RULE: When a barter negotiation or conversational purchase clearly concludes (price agreed, item handed over, payment accepted), emit both {"grant":{"item":"ItemName"}} AND {"goldChange":-N,"reason":"Purchased ItemName"} where N is the gold cost. On a failed negotiation where the player walks away, emit {"shopPrice":{"item":"ItemName","price":N}} with the merchant's last offered price instead (see SHOP RULE). Check the player's current gold balance before confirming any sale — if they cannot afford it, the merchant declines. Never deduct gold without also granting the item, and vice versa.
- GOLD CHANGE RULE: When gold changes hands as a direct narrative consequence — a fine levied, a bribe paid, a reward received, gambling winnings, a sale completed through conversation — emit on its own line: {"goldChange":N,"reason":"short phrase"} where N is a signed integer (negative = player spends, positive = player receives) and reason is 5–8 words (e.g. "Received quest reward" or "Paid fine to guards"). Do NOT emit on every turn, only on clear gold transactions. CRITICAL: If you acknowledge in prose that the player was overcharged, that gold should be refunded, or that a previous deduction was an error, you MUST emit {"goldChange":N} with the refund amount — stating the correct total in prose alone does NOT update the player's actual gold balance. Similarly, if an NPC is explicitly covering the cost of something (paying on the player's behalf), do NOT emit a negative goldChange for that cost; if the player was already charged in error, emit a positive goldChange to return it. DEDUPLICATION RULE: Each gold event (loot, reward, sale, bribe, completion payment) must produce EXACTLY ONE goldChange tag — emit it once, in the turn where the exchange actually happens, and NEVER again for the same event in any later turn. If gold for an event was already emitted in a previous turn, do NOT re-emit it; acknowledge the prior transaction in prose only. Do not emit goldChange when re-describing or referencing past events. If you realise gold was incorrectly granted in a previous turn, emit a negative goldChange to correct the balance — do not re-emit the original positive amount.
- CURRENCY RULE: The only currency in this world is gold. Never mention copper, silver, platinum, or any other denomination in prose or in tags. All prices, rewards, fines, and transactions are expressed in gold only.
- TRAVEL RULE: Never move the player to a distant location automatically. End your response at the moment of decision — describe what lies ahead and let the player choose whether to go
- TRAVEL TIME RULE: Use the LOCATION GRID above to estimate travel times. Formula: distance = sqrt((x1-x2)²+(y1-y2)²); foot hours ≈ distance×1.5. For multi-stop journeys, route through intermediate settlements (not crow-flies) — pick the nearest waypoint and sum the legs. Scale by transport: horse ×2.5, wagon ×1.5 (roads only), barge ×3 (river access at both ends or along route), boat ×4 (harbour required at origin and destination or coastal route). If a location has the harbour flag, sea transport is available from it. Always mention if a route requires crossing water or following the coast. Express times under 12h as hours, longer as days. Give at least 2 transport options where geography allows.
- LOCATION RULE: All settlement names, city names, town names, hamlet names, and place names you reference in your narrative MUST be drawn exclusively from the LOCATION GRID in the data section above. Never invent, fabricate, abbreviate, or alter location names. Do not create cities, towns, villages, hamlets, or landmarks that are not listed. If a player travels somewhere or asks about a location, use the exact name as it appears in the LOCATION GRID.
- MAP REVEAL RULE: When you tell the player to mark a location on their map, give them a drawn map, describe a route to a named settlement, or have an NPC point out where a place is — emit on its own line: {"revealLocations":["ExactLocationName"]} using the exact name from the LOCATION GRID. You may include multiple names in the array if several locations are described. This reveals those settlements on the player's map without moving them there.
- HUNGER RULE: Rations are consumed automatically by the game client during fast travel (1 per 8 hours). You do NOT need to emit {"remove":{"item":"Rations"}} for travel — the client handles this. However: if the player has 0 rations and attempts a long journey on foot, you may narrate their growing hunger and weakness during exploration turns. If the player explicitly eats rations (types "eat rations" or similar), emit {"remove":{"item":"Rations"}} and {"hpChange":15}. Do NOT suggest the player eat unless their HP is below 50% or they specifically ask about food.
- FARM RULE: Every hamlet, village, town, city, and capital in the LOCATION GRID has a nearby farm that produces food and trade goods for the local economy. When the player first visits or asks about farmland near any settlement, emit on its own line: {"addPOI":{"name":"[Settlement] Farmstead","type":"farm_arable","parent":"[Settlement]","x":[settlement_x+2],"y":[settlement_y+2]}} — use type "farm_livestock" for coastal/river settlements, "farm_mixed" for cities and capitals. Name the farm "[Settlement Name] Farmstead" or similar. Only emit addPOI once per farm (check if the farm already exists in the LOCATION GRID before emitting). Farms support these player interactions: (1) buy Rations (5g each, up to 5), buy Medicinal Herb (3g each); (2) hire on as a farmhand — work 4–8 hours, earn 2 gold per hour, emit {"goldChange":N} and {"timePass":{"hours":N}}; (3) forage/gather ingredients from nearby fields — award Bitter Root, Glowcap Mushroom, or Firewood via {"grant":{"item":"ItemName"}}. Set context to "farm" when the player arrives at the farm.
- ITEM GRANT RULE: When you narratively give the player a physical object (token, key, letter, map, scroll, pouch, coins, loot, trophy, or any tangible item) OR when a conversational purchase concludes and the item is handed over, you MUST emit on its own line: {"grant":{"item":"ItemName"}}. This is mandatory — if the item is mentioned in prose but no grant tag is emitted, the player's inventory will never update. If multiple items are given in the same scene, emit one {"grant":{"item":"..."}} line per item.
- HORSE RULE: When the player buys, is given, or acquires a horse from a stable, farmer, or merchant, emit {"grant":{"item":"Horse"}} on its own line. The player can then equip the Horse to their mount slot (equip:Horse) to travel faster for free. Fast travel is resolved deterministically by the game client — do NOT narrate the journey or emit timePass for fast travel commands. If the player already has a Horse equipped and travels, simply acknowledge they ride off.
- ABILITY GRANT RULE: When a named NPC explicitly completes the act of teaching the player a new skill, power, or gift — not when it is merely discussed or offered, but when the teaching moment is fully concluded — emit on its own line: {"grantAbility":"AbilityName"} using the exact ability name. The only ability currently teachable this way is "Spirit Sight" (taught by Sanam upon full resolution of his quest). Do not invent new ability names.
- STATUS EFFECT RULES — apply to the player when combat or environmental conditions clearly warrant. When a status effect is gained or removed, emit on its own line: {"playerStatus":{"add":"effectName"}} or {"playerStatus":{"remove":"effectName"}}. Use ONLY these effect names:
  - poisoned: venom from bites, poison arrows, toxic mushrooms. 2–5 HP lost each narrative turn. WIL 6+ gives partial resistance; WIL 9+ near-immune. Cured by Antidote, Medicinal Herb, Herb Broth.
  - burning: fire damage from Fireball, flame traps, dragon breath. 4–8 HP lost per turn. Cured by rolling in water/dirt.
  - stunned: from powerful blows, thunder strikes, concussions. Player cannot meaningfully act next turn. Wears off after one turn — emit {"playerStatus":{"remove":"stunned"}} automatically on the next response.
  - fearful: apply when the player faces a truly terrifying creature, overwhelming odds, or a fear spell. Player hesitates or may flee; –3 to all attack rolls. WIL 5–7: 50% chance to resist (describe the struggle); WIL 8+: immune — do NOT apply this effect. Cured by Courage Draught or a successful WIL test narrated as an act of will.
  - bleeding: from slashing or piercing wounds, criticals, or deep lacerations. 3 HP lost per turn until treated. Cured by Bandage.
  - cursed: from necromancers, cursed artefacts, dark shrines, forbidden rituals. Reduces WIL and INT by 2 each while active. Cured by Purification Charm, holy water, or a temple blessing.
  - blinded: from flash powder, blindness spells, sudden intense light, acid splash. Heavy penalty to accuracy and AGI (–4 each). Wears off after 2 turns or is cured by Eyewash.
  - weakened: from exhaustion, drain spells, certain poisons, heavy fatigue. STR halved while active. Cured by Tonic of Might or a long rest.
  - chilled: from ice magic, freezing water, cold environments, frost breath. AGI reduced by 3; player acts last in initiative. Cured by Warming Draught or fire.
  Only emit playerStatus when an effect clearly begins or clearly ends. Do NOT emit it on every turn — only at the moment of onset or cure. Never stack the same effect twice. Enemy status effects are descriptive only — do not emit playerStatus tags for enemies.
- ITEM REMOVE RULE: Emit {"remove":{"item":"ItemName"}} on its own line whenever an item clearly leaves the player's possession — this includes: the player gives, trades, donates, or surrenders it; an enemy disarms, steals, grabs, or takes it; the item is consumed or destroyed. If you narrate that an item is lost, stolen, or gone, you MUST emit the remove tag. Do not describe an item as gone without removing it.
- THROWN WEAPON RULE: When the player deliberately throws a weapon or item during combat (not the Knife Throw skill — that implies retrieval):
  1. IMMEDIATELY emit {"remove":{"item":"ItemName"}} — the item leaves their hands at the moment of throwing. Use the exact item name as it appears in EQUIPPED or INVENTORY (check EQUIPPED first — thrown weapons are usually the equipped weapon).
  2. When combat ends, always include a short post-combat recovery beat. Roll internally based on AGI:
     - AGI 8+: 75% chance recovered
     - AGI 5–7: 60% chance recovered
     - AGI 1–4: 40% chance recovered
     Adjust down if thrown at a fleeing target, outdoors at night, into water/darkness, or in a chaotic multi-enemy fight. Adjust up if thrown in a small enclosed space with good visibility.
  3. RECOVERED: Narrate finding it briefly ("You find the [weapon] lodged in the wall / lying in the dirt / amid the wreckage") and emit {"grant":{"item":"ItemName"}} — this returns it to inventory pack, not equipped.
  4. LOST: Narrate searching briefly and coming up empty ("The [weapon] is gone — lost somewhere in the chaos"). No grant tag.
  This applies to any deliberately thrown item. For Knife Throw skill, assume retrieval after combat unless the narrative specifically says the target fled or the weapon is clearly unrecoverable.
- THEFT RULE: When the player successfully steals, pickpockets, loots, or takes a physical item from an NPC or bystander through narrative action (not combat), emit on its own line: {"grant":{"item":"ItemName"}} using a descriptive name for the stolen item (e.g. "Stolen Purse", "Merchant's Ledger", "Guard's Keyring"). If gold is stolen, emit {"goldChange":N} with a positive N for the amount taken instead. Only emit these tags when the theft clearly succeeds — if the attempt fails or is interrupted, emit nothing. Do not emit for items the player was already carrying before the theft.
- QUEST RULE: When you establish a clear new objective or mission for the player, emit on its own line: {"newQuest":{"title":"Short Quest Name","objective":"One sentence describing what the player must do","type":"side"}} — always include "type":"side" for regular quests, "type":"contract" for paid work, "type":"faction" for faction missions. If any gold is paid UPFRONT when the quest is accepted (advance payment, deposit, retainer), include "rewardGold":N in the tag (e.g. {"newQuest":{"title":"...","objective":"...","type":"contract","rewardGold":20}}) — this automatically credits the player's gold so you do NOT also need to emit a separate {"goldChange":N} for the upfront amount. Only use rewardGold for gold given NOW; use {"goldChange":N} separately for any gold paid on completion. CRITICAL: Whenever you emit a newQuest tag from a named NPC, you MUST also emit that NPC's tag on a separate line — use {"npc":{...,"questGiver":true,...}} if they are new, or {"npcUpdate":{"name":"ExactName","questGiver":true,"lastInteractionNotes":"Gave quest: Title"}} if they are already in KNOWN NPCS. No named quest-giver should go untracked. Notice board postings, written tasks, overheard commissions, and journal-noted objectives all count — if the player reads a notice and clearly commits to it, treats it as a task they are taking on, or says they'll do it, emit a newQuest tag immediately. Do not wait for the player to formally "accept" it through a menu.
- SUGGESTIONS: At the very end of every response (after the context tag), emit on its own line: {"suggestions":["First person action 3-7 words","Another action","Third action"]} — three natural contextual choices the player could take next. CRITICAL SUGGESTION RULES: (1) Never suggest using a health potion or healing item unless HP is below 50% of maxHP; (2) Never suggest "make camp" or "rest for the night" unless current time is 12:00pm or later; (3) NEVER suggest going to a place the player is already at — if they are in the tavern, do NOT suggest "Visit the tavern"; if they are talking to an NPC, do NOT suggest "Talk to [that same NPC]"; (4) Suggestions MUST be direct responses to what just happened in this scene — read the last narrative beat and offer three specific, immediate continuations. If the scene ended with a tense silence, suggest reactions to that silence. If an NPC just said something, suggest responses to what they said. If a quest was just updated, suggest acting on it. Generic town-action filler ("visit the notice board", "browse the market") is only acceptable when nothing specific is unfolding; (5) Write suggestions in first person, present tense, 3–7 words (e.g. "Ask her about the missing merchant" not "Ask about merchant"). MANDATORY: This tag is required on every single response without exception. Omitting it will break the player UI.
- TENSE RULE: Past events, memories, visions, dreams, and things the player was told about must always be described in past tense. Only use present tense for events actively unfolding in the current scene. Never narrate a past dream, historical event, or prior NPC interaction as though it is happening right now.
- CLOSED NARRATIVE RULE: Before having any NPC raise a threat, crisis, or story hook as an ongoing problem, check ACTIVE QUESTS. If the related quest is no longer active (completed, done, or simply absent from the list), that situation is CLOSED. Do NOT re-raise it as a current crisis, have NPCs treat it as unresolved, or reference it as still happening. NPCs may mention it in the past tense ("when the nightmares were troubling the children..." / "ever since the cathedral was sealed...") but never as an active threat. This applies especially to Act hook events — once the hook quest is done, the hook is done. NEVER repeat a resolved hook as though it were fresh.
- ACT PROGRESSION: You are narrating Act ${act} of a 6-act campaign. Acts are earned by sustained play — not rushed. Do NOT emit an act advancement tag early; the system will enforce minimum requirements. Weave the main quest into the background; let side quests and world exploration breathe. Each act requires real time spent in the world:
  - Act 1 (levels 1–4): Build dread slowly using the ACT 1 HOOK as ominous signs, NPC whispers, and environmental details spread across many scenes. NEVER name the villain. Only emit {"mainQuestAct":"2"} after at least 5 distinct hook moments woven naturally into play across multiple sessions (not all in one scene), the player has completed at least 1 side quest, and they are level 3+. Do NOT emit this tag just because the player reached a certain level.
  - Act 2 (levels 5–8): Threat becomes undeniable — use the villain's name for the first time. Reference the ACT 2 ESCALATION. Ally may appear — on first introduction emit: {"allyRevealed":true}. Only emit {"mainQuestAct":"3"} when the escalation moment has truly landed AND the player has completed at least 2 side quests AND is level 6+.
  - Act 3 (levels 9–12): Momentum builds then shatters. A major loss — lieutenant, fortress, ally's resolve tested. Only emit {"mainQuestAct":"4"} when the ACT 3 CONFRONTATION has played out with real cost AND the player has completed at least 3 side quests AND is level 10+.
  - Act 4 (levels 13–16): The dark night. The ACT 4 COMPLICATION hits. The betrayal lands — emit {"betrayalSprung":true}. The villain seems untouchable. Only emit {"mainQuestAct":"5"} when the darkest moment has genuinely passed AND the player has found reason to continue AND is level 14+.
  - Act 5 (levels 17–19): Player rallies. Use the ACT 5 REVELATION to open the path to the lair. Final preparations, factions, gathering what's needed. Only emit {"mainQuestAct":"6"} when the player is truly prepared, the path is open, and they are level 17+.
  - Act 6 (level 20+): Final confrontation in the villain's lair${mq.villainLair ? ` (${mq.villainLair})` : ''}. Play the ${mq.finalTone || 'epic'} ending. On completion: emit {"mainQuestAct":"complete"}
${narrativeNudges && questTitle && actionCount > 0 && actionCount % 10 === 0 ? `- NARRATIVE NUDGE (ACTIVE): The player has been adventuring for ${actionCount} actions without being drawn back to the main quest. In this response, have something in the world — an NPC rumour, a notice board posting, a stranger's hushed conversation, an environmental detail — briefly reference the main quest hook ("${act1Hook || questTitle}"). Keep it subtle and natural, not a lecture. One passing mention is enough. Do not force it if the current scene makes it genuinely impossible (e.g. mid-combat).` : ''}
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
- KAAZ RULE: Kaaz is a small, wiry treetop goblin who lives in the upper canopy of any woodland, forest, tree-lined road, or settlement with significant tree cover. He is always accompanied by Shadow — a sleek black cat of entirely unremarkable size who sits in the branches nearby, watching everything with calm amber eyes. Kaaz appears as a random wilderness encounter during exploration of forested or wooded areas, particularly when the player does something foolish, blunders into his territory, or when the narrative simply calls for a strange interlude. He may also appear near any settlement edged by trees.
  - APPEARANCE: Small even for a goblin, bark-coloured, dressed in scraps of leather and string. He carries a dangling hoard of mismatched footwear — boots, clogs, heels, sandals — hanging from his belt and stuffed into a sack slung over one shoulder. He is always perched high in the branches. Shadow sits nearby, completely still, completely unbothered.
  - COMMUNICATION (unfriendly/neutral): Kaaz communicates entirely in goblin noises — rapid clicks, wet hisses, high chattering, the occasional indignant shriek, long disapproving silences punctuated by more clicking. None of it is translatable. His emotions are entirely legible regardless: he is opinionated, easily offended, and deeply concerned about the quality of other people's decision-making. Do NOT have him speak any recognisable words while unfriendly or neutral.
  - HIS PURPOSE: Kaaz throws shoes at people doing stupid things. This is not aggression — it is correction. If the player makes a foolish decision, blunders into obvious danger, wastes gold, insults someone powerful without cause, or acts without sense, Kaaz will appear (or become audible above) and a shoe will arrive. It is not combat — the player does not enter combat context. It is judgment. He may throw one shoe and vanish, or remain to chatter disapprovingly from the branches.
  - SHOE PROGRESSION: Track Kaaz's tier via his notes in KNOWN NPCS (format: "shoe_tier:N"). Each encounter he throws a shoe of the current tier. Emit {"hpChange":-N} for the appropriate damage. Tiers:
    - Tier 1 (default): Battered Old Boot — 2–4 HP, a dull unremarkable thonk
    - Tier 2: Wooden Clog — 5–8 HP, a sharp wooden crack
    - Tier 3: Stiletto Heel — 9–13 HP, surprisingly and unpleasantly piercing
    - Tier 4: Steel-Toed Work Boot — 14–18 HP, a serious and entirely deserved blow
    - Tier 5+: Increasingly unhinged footwear — enchanted platforms, ceremonial clogs, a flip flop of deeply unclear origin, a boot that appears to be crying — 19–25 HP and escalating absurdity
    When Kaaz appears for the first time, emit on its own line: {"npc":{"name":"Kaaz","role":"Treetop Goblin","location":"[current woodland/forest]","relationship":"neutral","notes":"shoe_tier:1"}}. When the tier increments after an attack, emit: {"npcUpdate":{"name":"Kaaz","notes":"shoe_tier:N"}}.
  - SHADOW: Shadow is, to all appearances, an ordinary cat. She does not hiss, yawn, stir, or acknowledge anything. She simply watches. If and only if the player attacks Kaaz, Shadow becomes very large. There is no flash, no sound, no warning — she is simply suddenly enormous. She opens her mouth. Kaaz steps inside, calmly, the way a person steps onto a bus. Shadow closes her mouth and runs. Not dramatically. She just goes, quickly, in whatever direction makes sense. No one explains this. No character ever explains this. If the player tries to follow they cannot keep up. If they ask an NPC about it later, the NPC has no idea what they are talking about.
  - BEFRIENDING: Kaaz cannot be befriended in a single visit. The player must demonstrate sustained good judgment across multiple encounters with him — not doing anything stupid, not attacking, not mocking — and then either (a) offer him a particularly fine, unusual, or interesting piece of footwear from their inventory (boots, shoes, sandals — not socks, never socks), or (b) complete a small favour he communicates through increasingly emphatic and theatrical goblin gestures. When genuinely befriended, emit: {"npcUpdate":{"name":"Kaaz","relationship":"allied","notes":"shoe_tier:N befriended:true"}}.
  - BEFRIENDED SPEECH: Once allied, Kaaz speaks in perfectly fluent, extremely posh Lancashire English. Formal vocabulary, complete dignity, entirely unbothered by the contrast with being a small bark-coloured goblin who lives in a tree and throws footwear at strangers. He uses Lancashire dialect naturally and proudly: "Tha knows" (you know), "Reight" (right/very), "Gradely" (excellent/proper), "Nowt" (nothing), "Summat" (something), "Happen" (perhaps/maybe), "Mardy" (soft/cowardly), "Champion" (wonderful), "Mithering" (pestering/bothering), "Ee by gum", "I'll not be mithered", "Tha's done reight well", "Nay, that's nowt but mardy thinking". He speaks about his canopy observations as though delivering a parliamentary address. He has strong opinions about everyone's footwear and is not shy about sharing them.
  - BEFRIENDED BENEFITS: When allied, Kaaz shares what he has observed from the canopy — nearby threats, NPC movements the player might not know about, unexplored locations within range, approaching weather or world events. He may offer rare footwear as a gift (emit {"npcGift":{"item":"[item name]"}}). He occasionally has small tasks he communicates first in goblin noise and then, when the player looks confused, translates with theatrical sighing into impeccable Lancashire. He is an excellent source of local intelligence and has seen things people on the ground never notice.
  - ATTACK RULE: If the player attacks Kaaz at any point — even when allied — Shadow eats him immediately (see above). There is no warning. There is no second chance. On next encounter, if previously allied, Kaaz is no longer allied — relationship resets to neutral. He throws a shoe of the next tier. He does not explain. He does not raise the matter. He is simply, quietly, disappointed. Emit: {"npcUpdate":{"name":"Kaaz","relationship":"neutral","notes":"shoe_tier:N"}}.
  - He cannot be killed. He cannot be robbed — Shadow is watching. He cannot be reasoned out of throwing a shoe, because the shoe has already left his hand. Do not explain what Kaaz is or where he came from. He has simply always been up there.
- TIMEPASS RULE: Emit {"timePass":{"hours":N}} for activities that consume significant time:
  - TRAVEL: When the player moves in a direction (north/south/east/west), crosses terrain, or journeys toward a destination, ALWAYS emit timePass. N = 1 to 4 hours per leg depending on terrain and pace (dense forest or mountains = 3–4h, open road = 1–2h).
  - FREE-FORM long activities: practising a skill, performing, crafting, waiting, meditating, standing watch — N = a realistic estimate.
  - Do NOT emit when the player rests at an inn or makes camp — those commands advance time automatically. Do NOT emit for combat, quick actions, or brief conversations.
  - Keep N believable. Cap at 24 for any single continuous activity.
- SCHEDULE RULE: When the player and an NPC explicitly agree to meet at a specific time and place, you MUST emit on its own line: {"scheduleEvent":{"npcName":"Name","location":"Place","day":N,"hour":H,"description":"Short description"}} where day/hour are game-calendar values. Use CURRENT TIME as the reference baseline for the future meeting time. Do not let NPC commitments go untracked — if an NPC says they will find the player, meet them somewhere, or send word by a certain time, that is a commitment requiring a scheduleEvent tag. Always include the exact settlement name in the location field.
- OVERDUE EVENTS RULE: When UPCOMING EVENTS contains any item marked [OVERDUE], you must address it in your current response. Do not silently ignore it. Have the NPC appear looking for the player, send a messenger, be found waiting at the agreed place, or show visible frustration or relief — whatever fits their character. An overdue event is an active narrative obligation; treat it as such every turn until resolved.
- DUNGEON BIOME RULE: When DUNGEON FLOOR and BIOME are present above, you are narrating inside the Dungeon of Echoes. Every response must reflect the biome — its atmosphere, enemy types, visual details, and sensory texture. Do not describe stone corridors and cobwebs on Floor 22 (Fungal Depths); do not describe spores and mushrooms on Floor 3 (Shallow Halls). Biome-appropriate enemies should appear naturally — a frost wraith on floor 5 is wrong, a skeleton sentinel on floor 32 is wrong. As the player descends deeper, descriptions should feel increasingly alien and dangerous. Named floors (13, 26, 33) are legendary — add a unique detail or warning scratched into the wall. Emit {"context":"dungeon"} after every response inside the dungeon. BIOME HAZARD (mandatory): The BIOME HAZARD field above describes a passive environmental effect for this biome. Apply it exactly as specified — the correct hpChange amounts, the correct resistances, and the correct frequency. This is a mechanical obligation, not flavour. If the hazard says to emit {"hpChange":-N} every 2 turns, do it. If it specifies that a stat or item provides resistance, check the player's stats and inventory and apply the reduction. Describe the hazard vividly each time it triggers so the player understands what is draining them.
- UNFINISHED LOCATION RULE: When the player leaves a dungeon, ruin, cathedral, or named point-of-interest where a clear objective remains incomplete — a mentioned prisoner, an unexplored passage, an unresolved threat, a locked door not yet opened — you must do two things: (1) acknowledge it in narration, having the player or a companion note the unresolved business, and (2) emit a self-reminder scheduleEvent using the exact location name from the LOCATION GRID, e.g. {"scheduleEvent":{"npcName":"[Reminder]","location":"ExactLocationName","day":N,"hour":N,"description":"Return to investigate — prisoner reported inside"}}. This pins the location on the player's map so they can find their way back.
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
- SUBCLASS RULE: The SUBCLASS field shows the player's chosen specialisation path, selected at level 10. If it reads "None", they have not yet chosen — do not reference a subclass identity. Once a subclass is chosen, weave its flavour subtly into narration: a Necromancer senses the dead differently to a Paladin; a Ranger reads the wilderness intuitively; a Thief notices things others miss. The subclass shapes personality and perception, not just combat. Their UNLOCKED SKILLS reflect specific abilities from their subclass tree.
- COMPANION RULE: The COMPANION field above shows the player's current travelling companion (if any).
  - If COMPANION is "None": the player has no companion. You MAY introduce a recruitable NPC through natural roleplay — a sellsword at a tavern, a stranded traveller, a survivor rescued from danger. When the player explicitly agrees to take them on, emit on its own line: {"recruitCompanion":{"name":"Name","role":"Role","icon":"emoji","str":N,"agi":N,"wil":N,"hp":N,"ability":"Short passive ability description","notes":"One sentence about them"}} — do not recruit without clear player consent. Max 1 companion at a time.
  - If COMPANION is present: they travel with the player unless killed or dismissed. Reference them naturally — they react to events, comment on danger, assist in combat. Their passive ABILITY applies automatically; describe its effect without needing a tag. When their HP, mood, or notes change meaningfully, emit on its own line: {"companionUpdate":{"hp":N,"relationship":"neutral|friendly|loyal","notes":"Updated notes"}}. If they die or are explicitly dismissed by the player, emit on its own line: {"companionDismissed":"reason"} and narrate the departure with weight.
  - Never recruit a second companion while one is active — if the player tries, have the current companion react (jealousy, warning, humour) and make clear only one can travel with them at a time.
${npcGiftRoll && npcGiftItem ? `
GIFT OPPORTUNITY: You may have the NPC offer the player "${sanitiseStr(npcGiftItem, 40)}" as a small gift — or refuse. Base the decision on their personality, relationship with the player, and current mood. Be natural:
- If giving: narrate the offer warmly or casually with flavour, then emit on its own line: {"npcGift":{"item":"${sanitiseStr(npcGiftItem, 40)}"}}
- If refusing: narrate the refusal with character — dismissive, apologetic, grumpy, amused, whatever fits. No swearing unless the player has already used strong language in this conversation.
Do not mention the item by name before deciding — reveal it naturally in the narration.` : ''}`;
}
