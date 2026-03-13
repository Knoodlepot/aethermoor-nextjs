import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/external/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    // Await the work before responding (serverless functions are killed on return)
    // Always return the same message to prevent email enumeration
    const normalizedEmail = email.toLowerCase().trim();
    const resetToken = await auth.requestPasswordReset(normalizedEmail);
    if (resetToken) {
      const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
      await sendPasswordResetEmail(normalizedEmail, resetToken, baseUrl).catch((err: Error) =>
        console.error('[FORGOT PASSWORD] Email send error:', err)
      );
    }

    return NextResponse.json({
      message: 'If that email is registered, a reset link has been sent.',
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
