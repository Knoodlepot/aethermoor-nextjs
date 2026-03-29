import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleCode } from '@/lib/external/oauth';
import * as auth from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const homeUrl = new URL('/', origin);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  if (code) homeUrl.searchParams.set('code', code);
  if (state) homeUrl.searchParams.set('state', state);
  if (error) homeUrl.searchParams.set('error', error);
  return NextResponse.redirect(homeUrl);
}

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
    console.error('[OAUTH GOOGLE]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
