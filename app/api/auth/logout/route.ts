import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { blockToken } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;
    const authCtx = auth.authenticateFromHeaders(authHeader);

    if (authCtx && authHeader) {
      // Blocklist the token in Redis so it can't be reused before expiry
      const rawToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      await blockToken(rawToken, 90 * 24 * 60 * 60); // 90 days (JWT max lifetime)
    }

    // Always return success — client clears state regardless
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AUTH LOGOUT]', error);
    // Still return success — client-side logout proceeds regardless
    return NextResponse.json({ success: true });
  }
}
