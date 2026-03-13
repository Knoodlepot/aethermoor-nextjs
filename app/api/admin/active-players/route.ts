import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function checkAdminAuth(request: NextRequest): boolean {
  const secret = new URL(request.url).searchParams.get('secret');
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

    const result = await query(
      `SELECT tl.player_id, a.email, COUNT(*) AS api_calls,
              MAX(tl.created_at) AS last_active
       FROM token_log tl
       JOIN players p ON p.player_id = tl.player_id
       JOIN accounts a ON a.id = p.account_id
       WHERE tl.created_at > NOW() - ($1 || ' minutes')::INTERVAL
       GROUP BY tl.player_id, a.email
       ORDER BY last_active DESC
       LIMIT 100`,
      [clampedMinutes]
    );

    return NextResponse.json({
      players: result.rows,
      windowMinutes: clampedMinutes,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('[ADMIN ACTIVE PLAYERS]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
