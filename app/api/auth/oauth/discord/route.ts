import { NextRequest, NextResponse } from 'next/server';
import { exchangeDiscordCode } from '@/lib/external/oauth';
import * as auth from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, redirectUri } = body;

    if (!code) {
      return NextResponse.json({ error: 'code required' }, { status: 400 });
    }

    const { account, error } = await exchangeDiscordCode(code, redirectUri);

    if (!account || error) {
      return NextResponse.json(
        { error: 'oauth_failed', message: error || 'Discord OAuth failed' },
        { status: 400 }
      );
    }

    const token = auth.issueJwt(account.accountId, account.playerId, account.email);

    const response = NextResponse.json({
      token,
      accountId: account.accountId,
      playerId: account.playerId,
      email: account.email,
    });
    auth.setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('[OAUTH DISCORD]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
