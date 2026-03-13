import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleCode } from '@/lib/external/oauth';
import { issueJwt } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, redirectUri } = body;

    if (!code) {
      return NextResponse.json({ error: 'code required' }, { status: 400 });
    }

    const { account, error } = await exchangeGoogleCode(code, redirectUri);

    if (!account || error) {
      return NextResponse.json(
        { error: 'oauth_failed', message: error || 'Google OAuth failed' },
        { status: 400 }
      );
    }

    const token = issueJwt(account.accountId, account.playerId, account.email);

    return NextResponse.json({
      token,
      accountId: account.accountId,
      playerId: account.playerId,
      email: account.email,
    });
  } catch (error) {
    console.error('[OAUTH GOOGLE]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
