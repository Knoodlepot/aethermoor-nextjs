import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';

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

    const result = await auth.login(email.toLowerCase().trim(), password);

    if (!result) {
      return NextResponse.json(
        { error: 'invalid_credentials', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      token: result.token,
      accountId: result.accountId,
      playerId: result.playerId,
    });
  } catch (error) {
    console.error('[AUTH LOGIN]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
