import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { blockToken } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const authCtx = auth.authenticateRequest(request);
    const rawToken = auth.getTokenFromRequest(request);

    if (authCtx && rawToken) {
      // Blocklist the token in Redis so it can't be reused before expiry
      await blockToken(rawToken, 90 * 24 * 60 * 60); // 90 days (JWT max lifetime)
    }

    // Always return success and clear cookie regardless
    const response = NextResponse.json({ success: true });
    auth.clearAuthCookie(response);
    return response;
  } catch (error) {
    console.error('[AUTH LOGOUT]', error);
    // Still return success — client-side logout proceeds regardless
    const response = NextResponse.json({ success: true });
    auth.clearAuthCookie(response);
    return response;
  }
}
