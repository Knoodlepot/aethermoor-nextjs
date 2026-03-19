import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authCtx = await auth.authenticateRequestAsync(request);
    if (!authCtx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'currentPassword and newPassword required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'password_too_short', message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const success = await auth.changePassword(authCtx.accountId, currentPassword, newPassword);

    if (!success) {
      return NextResponse.json(
        { error: 'invalid_password', message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[CHANGE PASSWORD]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
