import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import * as db from '@/lib/db';
import { cacheGetJson, cacheSetJson, cacheDel } from '@/lib/redis';
import { getIP, isIpRateLimited } from '@/lib/ratelimit';


// GET /api/save
// Fetch cloud save for a specific slot (default: slot 1)
// Add ?slots=all to get summary of all 3 slots
export async function GET(request: NextRequest) {
  try {
    const authCtx = await auth.authenticateRequestAsync(request);
    if (!authCtx) {
      return NextResponse.json({ error: 'unauthorized', message: 'Authentication required' }, { status: 401 });
    }
    const { playerId } = authCtx;

    // Return all slot summaries
    if (request.nextUrl.searchParams.get('slots') === 'all') {
      const cacheKey = `save:slots:${playerId}`;
      const cached = await cacheGetJson<unknown>(cacheKey);
      if (cached) return NextResponse.json(cached, { status: 200 });

      const result = await db.query(
        `SELECT slot, player_json, saved_at FROM game_saves WHERE player_id = $1 ORDER BY slot ASC`,
        [playerId]
      );
      const slots = [1, 2, 3].map((s) => {
        const row = result.rows.find((r: any) => r.slot === s);
        if (!row) return { slot: s, empty: true };
        try {
          const p = JSON.parse(row.player_json);
          return {
            slot: s,
            empty: false,
            name: p.name ?? 'Unknown',
            cls: p.class ?? '',
            level: p.level ?? 1,
            location: p.location ?? '',
            savedAt: row.saved_at,
          };
        } catch {
          return { slot: s, empty: true };
        }
      });
      await cacheSetJson(cacheKey, slots, 30);
      return NextResponse.json(slots, { status: 200 });
    }

    // Return single slot
    const slot = Math.min(3, Math.max(1, parseInt(request.nextUrl.searchParams.get('slot') ?? '1', 10) || 1));
    const cacheKey = `save:${playerId}:${slot}`;
    const cached = await cacheGetJson<unknown>(cacheKey);
    if (cached) return NextResponse.json(cached, { status: 200 });

    const result = await db.query(
      `SELECT player_json, seed_json, messages_json, narrative, log_json, saved_at
       FROM game_saves WHERE player_id = $1 AND slot = $2`,
      [playerId, slot]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'no_save', message: 'No save found' }, { status: 404 });
    }

    const save = result.rows[0];
    await cacheSetJson(cacheKey, save, 30);
    return NextResponse.json(save, { status: 200 });
  } catch (error) {
    console.error('[SAVE GET]', error);
    return NextResponse.json({ error: 'server_error', message: 'Failed to load save' }, { status: 500 });
  }
}

// POST /api/save
// Save game state to cloud
export async function POST(request: NextRequest) {
  try {
    if (await isIpRateLimited(getIP(request), 30)) {
      return NextResponse.json({ error: 'rate_limited', message: 'Too many save requests. Please slow down.' }, { status: 429 });
    }

    const authCtx = await auth.authenticateRequestAsync(request);
    if (!authCtx) {
      return NextResponse.json({ error: 'unauthorized', message: 'Authentication required' }, { status: 401 });
    }
    const { playerId } = authCtx;

    const body = await request.json();
    const { player_json, seed_json, messages_json, narrative, log_json, slot: rawSlot, clientSavedAt } = body;
    const slot = Math.min(3, Math.max(1, parseInt(rawSlot ?? '1', 10) || 1));

    // Conflict detection: if client sends clientSavedAt, check whether the DB has a newer save
    if (clientSavedAt) {
      const existing = await db.query(
        'SELECT updated_at FROM game_saves WHERE player_id = $1 AND slot = $2',
        [playerId, slot]
      );
      if (existing.rows.length > 0 && existing.rows[0].updated_at) {
        const dbUpdatedAt = new Date(existing.rows[0].updated_at).getTime();
        const clientTs = new Date(clientSavedAt).getTime();
        // Allow 2s buffer for clock skew / in-flight requests
        if (dbUpdatedAt > clientTs + 2000) {
          return NextResponse.json(
            { error: 'conflict', message: 'A newer save exists from another session. Reload to see the latest.' },
            { status: 409 }
          );
        }
      }
    }

    if (!player_json || !seed_json) {
      return NextResponse.json({ error: 'missing_fields', message: 'player_json and seed_json are required' }, { status: 400 });
    }

    const parsedPlayer = parseJsonField(player_json);
    const parsedSeed = parseJsonField(seed_json);
    const parsedMessages = parseJsonField(messages_json, []);
    const parsedLog = parseJsonField(log_json, []);

    if (!parsedPlayer || typeof parsedPlayer !== 'object' || Array.isArray(parsedPlayer) ||
        !parsedSeed || typeof parsedSeed !== 'object' || Array.isArray(parsedSeed)) {
      return NextResponse.json({ error: 'invalid_payload', message: 'player_json and seed_json must be valid JSON objects' }, { status: 400 });
    }

    const playerPayload = parsedPlayer as Record<string, unknown>;
    if (typeof playerPayload.playerId === 'string' && playerPayload.playerId !== playerId) {
      return NextResponse.json({ error: 'forbidden', message: 'player mismatch' }, { status: 403 });
    }
    playerPayload.playerId = playerId;

    // Sanitise character name server-side (defence-in-depth against invisible
    // Unicode, control characters, and bidirectional markers injected directly).
    if (typeof playerPayload.name === 'string') {
      playerPayload.name = playerPayload.name
        .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\u2028\u2029\uFEFF\u202A-\u202E]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 30);
    }

    const safePlayerJson = JSON.stringify(playerPayload);
    const safeSeedJson = JSON.stringify(parsedSeed);
    const safeMessagesJson = JSON.stringify(Array.isArray(parsedMessages) ? parsedMessages : []);
    const safeLogJson = JSON.stringify(Array.isArray(parsedLog) ? parsedLog : []);
    const safeNarrative = typeof narrative === 'string' ? narrative.slice(0, 50000) : '';

    await db.query(
      `INSERT INTO game_saves
       (player_id, slot, player_json, seed_json, messages_json, narrative, log_json, saved_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (player_id, slot) DO UPDATE SET
         player_json = $3,
         seed_json = $4,
         messages_json = $5,
         narrative = $6,
         log_json = $7,
         updated_at = NOW()`,
      [playerId, slot, safePlayerJson, safeSeedJson, safeMessagesJson, safeNarrative, safeLogJson]
    );

    await clearSaveCache(playerId, slot);
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() }, { status: 200 });
  } catch (error) {
    console.error('[SAVE POST]', error);
    return NextResponse.json({ error: 'server_error', message: 'Failed to save game' }, { status: 500 });
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
async function clearSaveCache(playerId: string, slot?: number): Promise<void> {
  try {
    if (slot) await cacheDel(`save:${playerId}:${slot}`);
    await cacheDel(`save:slots:${playerId}`);
  } catch (error) {
    console.warn('Failed to clear save cache:', error);
  }
}

