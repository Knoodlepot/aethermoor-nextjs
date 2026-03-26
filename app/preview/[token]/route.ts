import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import * as auth from '@/lib/auth';
import { query, migrateDb } from '@/lib/db';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const previewTokensEnv = process.env.PREVIEW_TOKENS;
  if (!previewTokensEnv) {
    return NextResponse.redirect(new URL('/preview/invalid', request.url));
  }

  const validTokens = new Set(previewTokensEnv.split(',').map((t) => t.trim()).filter(Boolean));
  if (!validTokens.has(token)) {
    return NextResponse.redirect(new URL('/preview/invalid', request.url));
  }

  // Ensure preview_invites table exists (runs fast after first migration)
  await migrateDb();

  // Look up existing invite record
  const existing = await query(
    'SELECT token, used_at, expires_at, account_id FROM preview_invites WHERE token = $1',
    [token]
  );

  const now = new Date();

  if (existing.rows.length > 0) {
    const invite = existing.rows[0];
    const expiresAt: Date = new Date(invite.expires_at);

    // Expired?
    if (now > expiresAt) {
      return NextResponse.redirect(new URL('/preview/expired', request.url));
    }

    // Already used — check if the current browser is the original user
    const currentJwt = request.cookies.get(auth.AUTH_COOKIE_NAME)?.value;
    const decoded = currentJwt ? auth.verifyJwt(currentJwt) : null;

    if (decoded && decoded.accountId === invite.account_id) {
      // Same user re-clicking — refresh their session
      const newToken = auth.issueJwtWithExpiry(decoded.accountId, decoded.playerId, decoded.email, expiresAt);
      const response = NextResponse.redirect(new URL('/game', request.url));
      auth.setAuthCookie(response, newToken);
      return response;
    }

    // Different browser / shared link — dead end
    return NextResponse.redirect(new URL('/preview/used', request.url));
  }

  // First use — create a guest account
  const shortId = token.slice(0, 8);
  const guestEmail = `preview-${shortId}@aethermoor.preview`;
  const guestPassword = randomBytes(16).toString('hex');

  const result = await auth.registerAccount(guestEmail, guestPassword);
  if (!result) {
    return NextResponse.redirect(new URL('/preview/invalid', request.url));
  }

  const expiresAt = new Date(now.getTime() + SEVEN_DAYS_MS);

  // Record usage
  await query(
    `INSERT INTO preview_invites (token, used_at, expires_at, account_id)
     VALUES ($1, $2, $3, $4)`,
    [token, now, expiresAt, result.accountId]
  );

  // Issue a 7-day JWT
  const timedToken = auth.issueJwtWithExpiry(result.accountId, result.playerId, guestEmail, expiresAt);

  const response = NextResponse.redirect(new URL('/game?new=1', request.url));
  auth.setAuthCookie(response, timedToken);
  return response;
}
