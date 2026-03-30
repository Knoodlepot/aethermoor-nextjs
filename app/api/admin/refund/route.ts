import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { issueRefund } from '@/lib/external/stripe';
import { cacheDel } from '@/lib/redis';

function checkAdminAuth(request: NextRequest): boolean {
  const headerSecret = request.headers.get('x-admin-secret');
  const bearer = request.headers.get('authorization');
  const bearerSecret = bearer?.startsWith('Bearer ') ? bearer.substring(7) : null;
  const secret = headerSecret || bearerSecret;
  return !!(secret && secret === process.env.SESSION_SECRET);
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { purchaseId } = await request.json();
    if (!purchaseId) {
      return NextResponse.json({ error: 'purchaseId required' }, { status: 400 });
    }

    // Fetch the purchase
    const result = await query(
      `SELECT id, player_id, stripe_session_id, tokens_awarded, amount_pence, status
       FROM purchases WHERE id = $1 LIMIT 1`,
      [purchaseId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const purchase = result.rows[0];

    if (purchase.status === 'refunded') {
      return NextResponse.json({ error: 'Purchase already refunded' }, { status: 409 });
    }

    if (!purchase.stripe_session_id) {
      return NextResponse.json({ error: 'No Stripe session ID on this purchase' }, { status: 400 });
    }

    // Issue refund via Stripe
    const refundResult = await issueRefund(purchase.stripe_session_id);
    if (!refundResult.success) {
      return NextResponse.json({ error: refundResult.error || 'Stripe refund failed' }, { status: 502 });
    }

    // Mark purchase as refunded
    await query(
      `UPDATE purchases SET status = 'refunded' WHERE id = $1`,
      [purchaseId]
    );

    // Deduct the tokens that were awarded (clamp at 0 — don't go negative)
    await query(
      `UPDATE players SET tokens = GREATEST(0, tokens - $1), updated_at = NOW() WHERE player_id = $2`,
      [purchase.tokens_awarded, purchase.player_id]
    );
    await query(
      `INSERT INTO token_log (player_id, change, reason, model_tier, created_at)
       VALUES ($1, $2, $3, NULL, NOW())`,
      [purchase.player_id, -purchase.tokens_awarded, `Refund: purchase ${purchaseId.slice(0, 8)}`]
    );
    await cacheDel(`token:bal:${purchase.player_id}`);

    console.log(`[ADMIN REFUND] ${purchase.tokens_awarded} tokens deducted from ${purchase.player_id}, refund ${refundResult.refundId}`);

    return NextResponse.json({
      success: true,
      refundId: refundResult.refundId,
      tokensDeducted: purchase.tokens_awarded,
      amountPence: purchase.amount_pence,
    });
  } catch (error) {
    console.error('[ADMIN REFUND]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
