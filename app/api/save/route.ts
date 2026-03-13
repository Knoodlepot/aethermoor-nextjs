import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import * as db from '@/lib/db';
import { cacheGetJson, cacheSetJson, cacheDel } from '@/lib/redis';


// GET /api/save
// Fetch latest cloud save
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate JWT from Authorization header
    const authHeader = request.headers.get('authorization');
    const authCtx = auth.authenticateFromHeaders(authHeader || undefined);

    if (!authCtx) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { playerId } = authCtx;

    // 2. Try cache first
    const cacheKey = `save:${playerId}`;
    const cached = await cacheGetJson<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    // 3. Query database
    const result = await db.query(
      `SELECT player_json, seed_json, messages_json, narrative, log_json, saved_at
       FROM game_saves
       WHERE player_id = $1`,
      [playerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'no_save', message: 'No save found for this player' },
        { status: 404 }
      );
    }

    const save = result.rows[0];

    // 4. Cache result (30 seconds)
    await cacheSetJson(cacheKey, save, 30);

    // 5. Return save data
    return NextResponse.json(save, { status: 200 });
  } catch (error) {
    console.error('[SAVE GET]', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to load save' },
      { status: 500 }
    );
  }
}

// POST /api/save
// Save game state to cloud
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate JWT from Authorization header
    const authHeader = request.headers.get('authorization');
    const authCtx = auth.authenticateFromHeaders(authHeader || undefined);

    if (!authCtx) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { playerId } = authCtx;

    // 2. Parse request body
    const body = await request.json();
    const { player_json, seed_json, messages_json, narrative, log_json } = body;

    // 3. Validate required fields
    if (!player_json || !seed_json) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'player_json and seed_json are required' },
        { status: 400 }
      );
    }

    const parsedPlayer = parseJsonField(player_json);
    const parsedSeed = parseJsonField(seed_json);
    const parsedMessages = parseJsonField(messages_json, []);
    const parsedLog = parseJsonField(log_json, []);

    if (
      !parsedPlayer ||
      typeof parsedPlayer !== 'object' ||
      Array.isArray(parsedPlayer) ||
      !parsedSeed ||
      typeof parsedSeed !== 'object' ||
      Array.isArray(parsedSeed)
    ) {
      return NextResponse.json(
        { error: 'invalid_payload', message: 'player_json and seed_json must be valid JSON objects' },
        { status: 400 }
      );
    }

    const playerPayload = parsedPlayer as Record<string, unknown>;

    if (typeof playerPayload.playerId === 'string' && playerPayload.playerId !== playerId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'player mismatch' },
        { status: 403 }
      );
    }

    playerPayload.playerId = playerId;

    const safePlayerJson = JSON.stringify(playerPayload);
    const safeSeedJson = JSON.stringify(parsedSeed);
    const safeMessagesJson = JSON.stringify(Array.isArray(parsedMessages) ? parsedMessages : []);
    const safeLogJson = JSON.stringify(Array.isArray(parsedLog) ? parsedLog : []);
    const safeNarrative = typeof narrative === 'string' ? narrative.slice(0, 50000) : '';

    // 4. Upsert into database
    await db.query(
      `INSERT INTO game_saves
       (player_id, player_json, seed_json, messages_json, narrative, log_json, saved_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (player_id) DO UPDATE SET
         player_json = $2,
         seed_json = $3,
         messages_json = $4,
         narrative = $5,
         log_json = $6,
         updated_at = NOW()`,
      [playerId, safePlayerJson, safeSeedJson, safeMessagesJson, safeNarrative, safeLogJson]
    );

    // 5. Clear cache
    await clearSaveCache(playerId);

    // 6. Return success
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[SAVE POST]', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to save game' },
      { status: 500 }
    );
  }
}

function parseJsonField(value: unknown, fallback: unknown = null): unknown {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') return value;
  return null;
}

/**
 * Clear save cache for player
 */
async function clearSaveCache(playerId: string): Promise<void> {
  try {
    const cacheKey = `save:${playerId}`;
    await cacheDel(cacheKey);
  } catch (error) {
    console.warn('Failed to clear save cache:', error);
  }
}

