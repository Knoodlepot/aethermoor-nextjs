import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import * as tokens from '@/lib/tokens';

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

    return NextResponse.json({ accountId, playerId, email, balance, sessionExpiresAt });
  } catch (error) {
    console.error('[AUTH ME]', error);
    return NextResponse.json({ error: 'server_error', message: 'Internal server error' }, { status: 500 });
  }
}
