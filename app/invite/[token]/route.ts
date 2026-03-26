import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const secret = process.env.SESSION_SECRET;
  const betaTokensEnv = process.env.BETA_TOKENS;

  if (!secret) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  let cookieMaxAge = 30 * 24 * 60 * 60; // default 30 days

  // Check env var tokens first
  const validEnvTokens = new Set((betaTokensEnv || '').split(',').map((t) => t.trim()).filter(Boolean));

  if (!validEnvTokens.has(token)) {
    // Check DB-generated beta keys
    const dbKey = await query<{ token: string; expires_at: string | null; revoked: boolean }>(
      `SELECT token, expires_at, revoked FROM beta_keys WHERE token = $1`,
      [token]
    );
    if (dbKey.rows.length === 0 || dbKey.rows[0].revoked) {
      return NextResponse.redirect(new URL('/closed?invalid=1', request.url));
    }
    const { expires_at } = dbKey.rows[0];
    if (expires_at && new Date(expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/closed?expired=1', request.url));
    }
    // Set cookie duration to match key expiry (or default 30d if permanent)
    if (expires_at) {
      cookieMaxAge = Math.floor((new Date(expires_at).getTime() - Date.now()) / 1000);
    }
  }

  const sig = createHmac('sha256', secret).update(token).digest('hex');
  const cookieValue = `${token}:${sig}`;

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set({
    name: 'ae_beta',
    value: cookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: cookieMaxAge,
  });
  return response;
}
