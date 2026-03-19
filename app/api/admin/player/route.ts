import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    const playerId = new URL(request.url).searchParams.get('playerId');
    if (!playerId) {
      return NextResponse.json({ error: 'playerId required' }, { status: 400 });
    }

    // Player + account info — search by player_id OR email
    // Use accounts.player_id for the join (account_id on players can be NULL for legacy rows)
    const playerResult = await query(
      `SELECT p.player_id, p.tokens, p.total_spent, a.email, a.verified, a.created_at
       FROM players p
       LEFT JOIN accounts a ON a.player_id = p.player_id
       WHERE p.player_id = $1
          OR LOWER(a.email) = LOWER($1)`,
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const resolvedId = playerResult.rows[0].player_id;

    // Token log
    const tokenLog = await query(
      `SELECT id, change, reason, created_at FROM token_log
       WHERE player_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [resolvedId]
    );

    // Moderation incidents
    const incidents = await query(
      `SELECT id, source, reason, trigger_text, status, created_at FROM moderation_incidents
       WHERE player_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [resolvedId]
    );

    return NextResponse.json({
      player: playerResult.rows[0],
      tokenLog: tokenLog.rows,
      incidents: incidents.rows,
    });
  } catch (error) {
    console.error('[ADMIN PLAYER]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
