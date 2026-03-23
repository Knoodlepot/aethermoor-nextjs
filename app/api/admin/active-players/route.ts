import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cacheGetJson, cacheSetJson } from '@/lib/redis';

function checkAdminAuth(request: NextRequest): boolean {
  const headerSecret = request.headers.get('x-admin-secret');
  const bearer = request.headers.get('authorization');
  const bearerSecret = bearer?.startsWith('Bearer ') ? bearer.substring(7) : null;
  const secret = headerSecret || bearerSecret;
  return !!(secret && secret === process.env.SESSION_SECRET);
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const minutes = parseInt(url.searchParams.get('minutes') || '60', 10);
    const clampedMinutes = Math.min(Math.max(minutes, 1), 1440); // 1 min to 24 hours

    const cacheKey = `admin:active:${clampedMinutes}`;
    const cached = await cacheGetJson(cacheKey);
    if (cached) return NextResponse.json(cached);

    const result = await query(
      `SELECT gs.player_id, a.email,
              MAX(gs.updated_at) AS last_active,
              COUNT(DISTINCT gs.slot) AS save_slots
       FROM game_saves gs
       JOIN accounts a ON a.player_id = gs.player_id
       WHERE gs.updated_at > NOW() - ($1 || ' minutes')::INTERVAL
       GROUP BY gs.player_id, a.email
       ORDER BY last_active DESC
       LIMIT 100`,
      [clampedMinutes]
    );

    const payload = {
      players: result.rows,
      windowMinutes: clampedMinutes,
      count: result.rows.length,
    };
    await cacheSetJson(cacheKey, payload, 180); // 3-min cache
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[ADMIN ACTIVE PLAYERS]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
