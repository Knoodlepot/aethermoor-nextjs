import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.mp3$|.*\\.ogg$).*)'],
};

const BETA_COOKIE = 'ae_beta';

async function computeExpectedToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode('ae_beta_v1'));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow: API routes, beta entry page
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/beta')
  ) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // SESSION_SECRET not configured — fail open so the app isn't bricked in dev
    return NextResponse.next();
  }

  const betaCookie = request.cookies.get(BETA_COOKIE)?.value;
  const expected = await computeExpectedToken(secret);

  if (betaCookie !== expected) {
    const betaUrl = request.nextUrl.clone();
    betaUrl.pathname = '/beta';
    return NextResponse.redirect(betaUrl);
  }

  return NextResponse.next();
}
