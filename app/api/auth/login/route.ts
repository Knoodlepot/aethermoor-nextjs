import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { getIP, isIpRateLimited } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  try {
    if (await isIpRateLimited(getIP(request), 10)) {
      return NextResponse.json({ error: 'rate_limited', message: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'email and password required' },
        { status: 400 }
      );
    }

    const result = await auth.login(email.toLowerCase().trim(), password);

    if (!result) {
      return NextResponse.json(
        { error: 'invalid_credentials', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      token: result.token,
      accountId: result.accountId,
      playerId: result.playerId,
    });
    auth.setAuthCookie(response, result.token);
    return response;
  } catch (error) {
    console.error('[AUTH LOGIN]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
