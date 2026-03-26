import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.mp3$|.*\\.ogg$).*)'],
};

const BETA_COOKIE = 'ae_beta';

async function hmac(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow: invite links, API, closed page
  if (
    pathname.startsWith('/invite/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/closed') ||
    pathname.startsWith('/admin')
  ) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  const betaTokensEnv = process.env.BETA_TOKENS;

  // If gate isn't configured, pass through (so dev environments without the var aren't bricked)
  if (!secret || !betaTokensEnv) {
    return NextResponse.next();
  }

  const validTokens = new Set(betaTokensEnv.split(',').map((t) => t.trim()).filter(Boolean));
  const cookieValue = request.cookies.get(BETA_COOKIE)?.value ?? '';
  const colonIdx = cookieValue.lastIndexOf(':');

  if (colonIdx !== -1) {
    const token = cookieValue.slice(0, colonIdx);
    const providedHmac = cookieValue.slice(colonIdx + 1);

    if (validTokens.has(token)) {
      const expectedHmac = await hmac(secret, token);
      if (providedHmac === expectedHmac) {
        return NextResponse.next();
      }
    }
  }

  const closedUrl = request.nextUrl.clone();
  closedUrl.pathname = '/closed';
  return NextResponse.redirect(closedUrl);
}
