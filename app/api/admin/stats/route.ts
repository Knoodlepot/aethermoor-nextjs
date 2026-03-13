import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function checkAdminAuth(request: NextRequest): boolean {
  const headerSecret = request.headers.get('x-admin-secret');
  const bearer = request.headers.get('authorization');
  const bearerSecret = bearer?.startsWith('Bearer ') ? bearer.substring(7) : null;
  const legacyQuerySecret = new URL(request.url).searchParams.get('secret');
  const secret = headerSecret || bearerSecret || legacyQuerySecret;
  return !!(secret && secret === process.env.SESSION_SECRET);
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [accounts, players, incidents, purchases] = await Promise.all([
      query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE verified) AS verified FROM accounts', []),
      query('SELECT COUNT(*) AS total, SUM(tokens) AS total_tokens FROM players', []),
      query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = \'pending\') AS pending FROM moderation_incidents', []),
      query('SELECT COUNT(*) AS total, SUM(amount_pence) AS total_pence FROM purchases', []),
    ]);

    return NextResponse.json({
      accounts: accounts.rows[0],
      players: players.rows[0],
      incidents: incidents.rows[0],
      purchases: purchases.rows[0],
    });
  } catch (error) {
    console.error('[ADMIN STATS]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
