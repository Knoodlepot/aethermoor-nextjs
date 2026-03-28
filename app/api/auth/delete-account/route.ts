import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { blockToken } from '@/lib/redis';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authCtx = await auth.authenticateRequestAsync(request);
    if (!authCtx) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { accountId } = authCtx;
    const body = await request.json();
    const { password } = body;

    // Fetch the account to check if it has a real password
    const accountRes = await query<{ password_hash: string }>(
      'SELECT password_hash FROM accounts WHERE id = $1',
      [accountId]
    );
    if (accountRes.rows.length === 0) {
      return NextResponse.json({ error: 'account_not_found' }, { status: 404 });
    }

    const { password_hash } = accountRes.rows[0];

    // OAuth-only accounts have a 64-char hex random hash (no real password).
    // We detect this by whether the hash starts with '$2' (bcrypt) or not.
    const hasRealPassword = password_hash.startsWith('$2');

    if (hasRealPassword) {
      if (!password) {
        return NextResponse.json(
          { error: 'password_required', message: 'Please enter your current password to confirm.' },
          { status: 400 }
        );
      }
      const valid = await auth.verifyPassword(password, password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: 'invalid_password', message: 'Incorrect password.' },
          { status: 403 }
        );
      }
    }

    // Blocklist current session token before deleting
    const rawToken = auth.getTokenFromRequest(request);
    if (rawToken) {
      await blockToken(rawToken, 90 * 24 * 60 * 60);
    }

    // Delete account — FK ON DELETE CASCADE handles players, game_saves,
    // token_log, moderation_incidents, etc.
    await query('DELETE FROM accounts WHERE id = $1', [accountId]);

    const response = NextResponse.json({ success: true });
    auth.clearAuthCookie(response);
    return response;
  } catch (error) {
    console.error('[DELETE ACCOUNT]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
