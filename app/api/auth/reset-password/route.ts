import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'token and newPassword required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'password_too_short', message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const success = await auth.resetPassword(token, newPassword);

    if (!success) {
      return NextResponse.json(
        { error: 'invalid_or_expired_token', message: 'Reset token is invalid or has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    console.error('[RESET PASSWORD]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
