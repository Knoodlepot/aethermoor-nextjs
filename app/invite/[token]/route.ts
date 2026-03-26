import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const secret = process.env.SESSION_SECRET;
  const betaTokensEnv = process.env.BETA_TOKENS;

  if (!secret || !betaTokensEnv) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const validTokens = new Set(betaTokensEnv.split(',').map((t) => t.trim()).filter(Boolean));

  if (!validTokens.has(token)) {
    return NextResponse.redirect(new URL('/closed?invalid=1', request.url));
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  return response;
}
