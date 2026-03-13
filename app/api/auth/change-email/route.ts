import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authCtx = auth.authenticateFromHeaders(
      request.headers.get('authorization') || undefined
    );
    if (!authCtx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { accountId, playerId } = authCtx;
    const body = await request.json();
    const { currentPassword, newEmail } = body;

    if (!currentPassword || !newEmail) {
      return NextResponse.json(
        { error: 'currentPassword and newEmail required' },
        { status: 400 }
      );
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

    // Verify current password
    const accountResult = await query(
      'SELECT password_hash FROM accounts WHERE id = $1',
      [accountId]
    );
    if (!accountResult.rows[0]) {
      return NextResponse.json({ error: 'account_not_found' }, { status: 404 });
    }

    const passwordValid = await auth.verifyPassword(
      currentPassword,
      accountResult.rows[0].password_hash
    );
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'invalid_password', message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Check new email not taken
    const existing = await query(
      'SELECT id FROM accounts WHERE email = $1 AND id != $2',
      [normalizedEmail, accountId]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'email_taken', message: 'That email is already in use' },
        { status: 409 }
      );
    }

    // Update email
    await query(
      'UPDATE accounts SET email = $1 WHERE id = $2',
      [normalizedEmail, accountId]
    );

    // Issue new JWT with updated email
    const newToken = auth.issueJwt(accountId, playerId, normalizedEmail);

    return NextResponse.json({ success: true, token: newToken, email: normalizedEmail });
  } catch (error) {
    console.error('[CHANGE EMAIL]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
