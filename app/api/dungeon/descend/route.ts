import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { query } from '@/lib/db';
import { cacheDel } from '@/lib/redis';

const COOLDOWN_MS = 15 * 1000; // 15 seconds

export async function POST(request: NextRequest) {
  try {
    const authCtx = auth.authenticateFromHeaders(
      request.headers.get('authorization') || undefined
    );
    if (!authCtx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { playerId } = authCtx;
    const body = await request.json();
    const { floor, heroName, heroClass, heroLevel, ngPlus } = body;

    if (!floor || floor < 1) {
      return NextResponse.json({ error: 'floor must be >= 1' }, { status: 400 });
    }

    // Check cooldown
    const existing = await query(
      'SELECT last_descent_at, deepest_floor FROM dungeon_progress WHERE player_id = $1',
      [playerId]
    );

    if (existing.rows.length > 0) {
      const lastDescent = existing.rows[0].last_descent_at;
      if (lastDescent) {
        const elapsed = Date.now() - new Date(lastDescent).getTime();
        if (elapsed < COOLDOWN_MS) {
          const waitMs = COOLDOWN_MS - elapsed;
          return NextResponse.json(
            { error: 'cooldown', message: `Wait ${Math.ceil(waitMs / 1000)}s before descending again` },
            { status: 429 }
          );
        }
      }
    }

    const prevDeepest = existing.rows[0]?.deepest_floor ?? 0;
    const newDeepest = Math.max(prevDeepest, floor);
    const now = new Date();

    // Upsert dungeon_progress
    await query(
      `INSERT INTO dungeon_progress (player_id, current_floor, deepest_floor, last_descent_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (player_id) DO UPDATE SET
         current_floor = $2,
         deepest_floor = GREATEST(dungeon_progress.deepest_floor, $3),
         last_descent_at = $4,
         updated_at = $4`,
      [playerId, floor, floor, now]
    );

    // Record descent
    await query(
      'INSERT INTO dungeon_descents (player_id, floor, created_at) VALUES ($1, $2, $3)',
      [playerId, floor, now]
    );

    // Update leaderboard if new personal record
    if (floor > prevDeepest && heroName && heroClass) {
      await query(
        `INSERT INTO leaderboard_entries (player_id, hero_name, hero_class, hero_level, deepest_floor, ng_plus, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (player_id) DO UPDATE SET
           hero_name = $2,
           hero_class = $3,
           hero_level = $4,
           deepest_floor = GREATEST(leaderboard_entries.deepest_floor, $5),
           ng_plus = $6,
           updated_at = NOW()`,
        [playerId, heroName, heroClass, heroLevel || 1, floor, ngPlus || 0]
      );
    }

    // Bust leaderboard cache
    await cacheDel('leaderboard:v1');

    return NextResponse.json({ success: true, floor, deepest: newDeepest });
  } catch (error) {
    console.error('[DUNGEON DESCEND]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
