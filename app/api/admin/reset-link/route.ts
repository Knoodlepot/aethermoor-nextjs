import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';

function getAdminSecret(request: NextRequest, legacyBodySecret?: string): string | null {
  const headerSecret = request.headers.get('x-admin-secret');
  const bearer = request.headers.get('authorization');
  const bearerSecret = bearer?.startsWith('Bearer ') ? bearer.substring(7) : null;
  return headerSecret || bearerSecret || legacyBodySecret || null;
}

// POST /api/admin/reset-link
// Generates a password reset link for a user and returns it directly (no email sent).
// Use when email delivery is failing.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, email } = body;
    const adminSecret = getAdminSecret(request, secret);

    if (!adminSecret || adminSecret !== process.env.SESSION_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const resetToken = await auth.requestPasswordReset(normalizedEmail);

    if (!resetToken) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://aethermoor.vercel.app';
    const resetUrl = `${baseUrl}/auth?reset=${resetToken}`;

    return NextResponse.json({ success: true, resetUrl, expiresInMinutes: 60 });
  } catch (error) {
    console.error('[ADMIN RESET LINK]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
