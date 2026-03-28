import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import * as tokens from '@/lib/tokens';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authCtx = await auth.authenticateRequestAsync(request);

    if (!authCtx) {
      return NextResponse.json({ error: 'unauthorized', message: 'Authentication required' }, { status: 401 });
    }

    const { accountId, playerId, email } = authCtx;

    await tokens.ensurePlayerRow(playerId);
    const balance = await tokens.getBalance(playerId);

    // Extract session expiry from the JWT (exp claim is in seconds, convert to ms)
    const rawToken = auth.getTokenFromRequest(request);
    const decoded = rawToken ? auth.verifyJwt(rawToken) : null;
    const sessionExpiresAt = decoded ? decoded.exp * 1000 : null;

    // Fetch verified_age from DB
    const accRes = await query<{ verified_age: boolean }>(
      'SELECT verified_age FROM accounts WHERE id = $1',
      [accountId]
    );
    const verified_age = accRes.rows[0]?.verified_age ?? true;

    return NextResponse.json({ accountId, playerId, email, balance, sessionExpiresAt, verified_age });
  } catch (error) {
    console.error('[AUTH ME]', error);
    return NextResponse.json({ error: 'server_error', message: 'Internal server error' }, { status: 500 });
  }
}
