import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { updateIncidentStatus } from '@/lib/moderation';

function getAdminSecret(request: NextRequest): string | null {
  const headerSecret = request.headers.get('x-admin-secret');
  const bearer = request.headers.get('authorization');
  const bearerSecret = bearer?.startsWith('Bearer ') ? bearer.substring(7) : null;
  return headerSecret || bearerSecret || null;
}

// GET /api/admin/moderation — list recent card incidents with player email
export async function GET(request: NextRequest) {
  try {
    const adminSecret = getAdminSecret(request);
    if (!adminSecret || adminSecret !== process.env.SESSION_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 90);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    const result = await query<{
      id: number;
      player_id: string;
      account_id: string;
      card_type: string;
      reason: string;
      trigger_text: string | null;
      status: string;
      created_at: string;
      email: string | null;
    }>(
      `SELECT mi.id, mi.player_id, mi.account_id, mi.card_type, mi.reason,
              mi.trigger_text, mi.status, mi.created_at,
              a.email
       FROM moderation_incidents mi
       LEFT JOIN accounts a ON a.player_id = mi.player_id
       WHERE mi.card_type IS NOT NULL
         AND mi.created_at > NOW() - ($1 * INTERVAL '1 day')
       ORDER BY mi.created_at DESC
       LIMIT $2`,
      [days, limit]
    );

    // Count pending (non-dismissed) card incidents
    const pendingCount = result.rows.filter((r) => r.status === 'pending').length;

    return NextResponse.json({ incidents: result.rows, pendingCount });
  } catch (error) {
    console.error('[ADMIN MODERATION GET]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// POST /api/admin/moderation — dismiss an incident
export async function POST(request: NextRequest) {
  try {
    const adminSecret = getAdminSecret(request);
    if (!adminSecret || adminSecret !== process.env.SESSION_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { incidentId, action, notes } = body;

    if (!incidentId || !action) {
      return NextResponse.json({ error: 'incidentId and action required' }, { status: 400 });
    }

    if (action !== 'dismiss' && action !== 'escalate') {
      return NextResponse.json({ error: 'action must be dismiss or escalate' }, { status: 400 });
    }

    const status = action === 'dismiss' ? 'dismissed' : 'escalated';
    const success = await updateIncidentStatus(incidentId, status, notes, 'admin');

    if (!success) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('[ADMIN MODERATION POST]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
