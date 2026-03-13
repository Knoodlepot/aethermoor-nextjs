import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, playerId } = body;

    if (!secret || secret !== process.env.SESSION_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!playerId) {
      return NextResponse.json({ error: 'playerId required' }, { status: 400 });
    }

    const result = await query(
      'DELETE FROM moderation_incidents WHERE player_id = $1',
      [playerId]
    );

    return NextResponse.json({ success: true, cleared: result.rowCount });
  } catch (error) {
    console.error('[ADMIN CLEAR MODERATION]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
