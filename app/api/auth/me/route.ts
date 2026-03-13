import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import * as tokens from '@/lib/tokens';

export async function GET(request: NextRequest) {
  try {
    const authCtx = auth.authenticateRequest(request);

    if (!authCtx) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { accountId, playerId, email } = authCtx;

    await tokens.ensurePlayerRow(playerId);
    const balance = await tokens.getBalance(playerId);

    return NextResponse.json({ accountId, playerId, email, balance });
  } catch (error) {
    console.error('[AUTH ME]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
