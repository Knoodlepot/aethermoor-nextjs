import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/external/email';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'email and password required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'password_too_short', message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await query(
      'SELECT id FROM accounts WHERE email = $1',
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'email_taken', message: 'An account with that email already exists' },
        { status: 409 }
      );
    }

    const result = await auth.registerAccount(normalizedEmail, password);

    if (!result) {
      return NextResponse.json(
        { error: 'registration_failed', message: 'Could not create account' },
        { status: 500 }
      );
    }

    // Generate verify token and send email (fire-and-forget)
    const verifyToken = uuidv4();
    await query(
      'UPDATE accounts SET verify_token = $1 WHERE id = $2',
      [verifyToken, result.accountId]
    );

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    sendVerificationEmail(normalizedEmail, verifyToken, baseUrl).catch((err: Error) =>
      console.error('[REGISTER] Email send error:', err)
    );

    const response = NextResponse.json({
      requiresVerification: true,
      token: result.token,
      accountId: result.accountId,
      playerId: result.playerId,
      message: 'Account created. Check your email to verify.',
    });
    auth.setAuthCookie(response, result.token);
    return response;
  } catch (error) {
    console.error('[AUTH REGISTER]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
