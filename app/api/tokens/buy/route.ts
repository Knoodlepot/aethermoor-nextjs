import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { createCheckoutSession } from '@/lib/external/stripe';

export async function POST(request: NextRequest) {
  try {
    const authCtx = await auth.authenticateRequestAsync(request);
    if (!authCtx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json({ error: 'packageId required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/game?payment=success`;
    const cancelUrl = `${baseUrl}/game?payment=cancelled`;

    const { url, error } = await createCheckoutSession(
      packageId,
      authCtx.playerId,
      successUrl,
      cancelUrl,
      `${baseUrl}/game`
    );

    if (!url || error) {
      return NextResponse.json(
        { error: 'checkout_failed', message: error || 'Could not create checkout session' },
        { status: 400 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('[TOKENS BUY]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
