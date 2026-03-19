import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authCtx = await auth.authenticateRequestAsync(request);
    if (!authCtx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { playerId } = authCtx;

    await query(
      `UPDATE dungeon_progress SET current_floor = 0, updated_at = NOW() WHERE player_id = $1`,
      [playerId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DUNGEON RESET]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
