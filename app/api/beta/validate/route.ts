import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac } from 'crypto';

// Simple in-memory rate limiter: 5 attempts per IP per 15 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'too_many_attempts', message: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }

  let code: string;
  try {
    const body = await request.json();
    code = typeof body.code === 'string' ? body.code.trim() : '';
  } catch {
    return NextResponse.json({ error: 'bad_request', message: 'Invalid request.' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'bad_request', message: 'Code is required.' }, { status: 400 });
  }

  const storedHash = process.env.BETA_CODE_HASH;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!storedHash || !sessionSecret) {
    return NextResponse.json({ error: 'server_error', message: 'Beta gate not configured.' }, { status: 500 });
  }

  const submitted = createHash('sha256').update(code).digest('hex');
  const valid = submitted === storedHash;

  if (!valid) {
    return NextResponse.json(
      { error: 'invalid_code', message: 'Invalid access code.' },
      { status: 403 }
    );
  }

  // Compute the cookie token
  const cookieToken = createHmac('sha256', sessionSecret).update('ae_beta_v1').digest('hex');

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: 'ae_beta',
    value: cookieToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  return response;
}
