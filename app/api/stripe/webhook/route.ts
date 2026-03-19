import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleCheckoutSessionCompleted } from '@/lib/external/stripe';
import { addTokens, updateTotalSpent } from '@/lib/tokens';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Disable body parsing — Stripe needs the raw body
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // Raw body needed for signature verification
    const rawBody = await request.arrayBuffer();
    const bodyBuffer = Buffer.from(rawBody);

    const event = verifyWebhookSignature(bodyBuffer, sig, webhookSecret);

    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as import('stripe').Stripe.Checkout.Session;
      const { playerId, packageId, tokens, pence } = handleCheckoutSessionCompleted(session);

      if (!playerId || tokens <= 0) {
        console.error('[STRIPE WEBHOOK] Missing playerId or zero tokens', { playerId, tokens });
        return NextResponse.json({ received: true });
      }

      // Idempotency guard — skip if this session was already processed
      const existing = await query(
        `SELECT id FROM purchases WHERE stripe_session_id = $1 AND status = 'completed' LIMIT 1`,
        [session.id]
      );
      if (existing.rows.length > 0) {
        console.log(`[STRIPE WEBHOOK] Already processed session ${session.id} — skipping`);
        return NextResponse.json({ received: true });
      }

      // Add tokens to player
      await addTokens(playerId, tokens, `Stripe purchase: ${packageId}`);

      // Update total spent
      await updateTotalSpent(playerId, pence);

      // Record purchase
      await query(
        `INSERT INTO purchases (id, player_id, stripe_session_id, tokens_awarded, amount_pence, status)
         VALUES ($1, $2, $3, $4, $5, 'completed')
         ON CONFLICT (id) DO NOTHING`,
        [uuidv4(), playerId, session.id, tokens, pence]
      ).catch((err) => console.error('[STRIPE WEBHOOK] Purchase record error:', err));

      console.log(`[STRIPE WEBHOOK] +${tokens} tokens → ${playerId} (${packageId})`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[STRIPE WEBHOOK]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
