import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomBytes } from 'crypto';

function checkAdmin(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret');
  return secret && secret === process.env.SESSION_SECRET;
}

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await query<{ token: string; label: string; created_at: string; expires_at: string | null; revoked: boolean }>(
    `SELECT token, label, created_at, expires_at, revoked FROM beta_keys ORDER BY created_at DESC`
  );
  return NextResponse.json({ keys: rows.rows });
}

export async function POST(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const label = (body.label || '').trim() || null;
  const days = typeof body.days === 'number' ? body.days : null;
  const token = randomBytes(16).toString('hex');
  const expiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null;
  await query(
    `INSERT INTO beta_keys (token, label, expires_at) VALUES ($1, $2, $3)`,
    [token, label, expiresAt]
  );
  return NextResponse.json({ token, label, expires_at: expiresAt });
}

export async function DELETE(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!body.token) return NextResponse.json({ error: 'token required' }, { status: 400 });
  await query(`UPDATE beta_keys SET revoked = TRUE WHERE token = $1`, [body.token]);
  return NextResponse.json({ ok: true });
}
