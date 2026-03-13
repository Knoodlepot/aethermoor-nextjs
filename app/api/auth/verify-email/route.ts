import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import * as tokens from '@/lib/tokens';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'token required' }, { status: 400 });
    }

    const result = await query(
      'SELECT id, player_id, email FROM accounts WHERE verify_token = $1',
      [token]
    );

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Verification token is invalid or already used' },
        { status: 400 }
      );
    }

    const { id: accountId, player_id: playerId, email } = result.rows[0];

    await query(
      'UPDATE accounts SET verified = TRUE, verify_token = NULL WHERE id = $1',
      [accountId]
    );

    await tokens.ensurePlayerRow(playerId);

    const jwt = auth.issueJwt(accountId, playerId, email);

    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
      token: jwt,
      accountId,
      playerId,
    });
    auth.setAuthCookie(response, jwt);
    return response;
  } catch (error) {
    console.error('[VERIFY EMAIL]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
