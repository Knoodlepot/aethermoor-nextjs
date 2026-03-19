import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { query } from '@/lib/db';

// One-time migration: creates dungeon_progress row if it doesn't exist
export async function POST(request: NextRequest) {
  try {
    const authCtx = await auth.authenticateRequestAsync(request);
    if (!authCtx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { playerId } = authCtx;

    const existing = await query(
      'SELECT player_id FROM dungeon_progress WHERE player_id = $1',
      [playerId]
    );

    if (existing.rows.length > 0) {
      // Already exists — no-op
      return NextResponse.json({ synced: false, message: 'Already synced' });
    }

    await query(
      `INSERT INTO dungeon_progress (player_id, current_floor, deepest_floor)
       VALUES ($1, 0, 0)
       ON CONFLICT DO NOTHING`,
      [playerId]
    );

    return NextResponse.json({ synced: true });
  } catch (error) {
    console.error('[DUNGEON SYNC]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
