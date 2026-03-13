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
    const cached = await cacheGetJson<any>(cacheKey);
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
      [playerId, player_json, seed_json, messages_json || '[]', narrative || '', log_json || '[]']
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

