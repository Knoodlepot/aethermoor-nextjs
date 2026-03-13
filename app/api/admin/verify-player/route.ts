import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensurePlayerRow } from '@/lib/tokens';

function getAdminSecret(request: NextRequest, legacyBodySecret?: string): string | null {
  const headerSecret = request.headers.get('x-admin-secret');
  const bearer = request.headers.get('authorization');
  const bearerSecret = bearer?.startsWith('Bearer ') ? bearer.substring(7) : null;
  return headerSecret || bearerSecret || legacyBodySecret || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, email } = body;
    const adminSecret = getAdminSecret(request, secret);

    if (!adminSecret || adminSecret !== process.env.SESSION_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const result = await query(
      `UPDATE accounts SET verified = TRUE
       WHERE email = $1
       RETURNING id, player_id`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { player_id: playerId } = result.rows[0];
    await ensurePlayerRow(playerId);

    return NextResponse.json({ success: true, playerId });
  } catch (error) {
    console.error('[ADMIN VERIFY PLAYER]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
