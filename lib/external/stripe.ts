import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(STRIPE_SECRET_KEY);

export interface TokenPackage {
  tokens: number;
  pence: number;
  label: string;
  priceId: string;
}

export const TOKEN_PACKAGES: Record<string, TokenPackage> = {
  starter: {
    tokens: 100,
    pence: 100,
    label: '100 Tokens',
    priceId: 'price_1T8kmJKvhVLecCSvf593COyi',
  },
  adventurer: {
    tokens: 290,
    pence: 250,
    label: '290 Tokens',
    priceId: 'price_1T8kmlKvhVLecCSvV6GQdjMh',
  },
  hero: {
    tokens: 650,
    pence: 500,
    label: '650 Tokens',
    priceId: 'price_1T8kn5KvhVLecCSvmCtEMlx3',
  },
  legend: {
    tokens: 1500,
    pence: 999,
    label: '1,500 Tokens',
    priceId: 'price_1T8kntKvhVLecCSv8kd4Pkzu',
  },
  champion: {
    tokens: 3500,
    pence: 1999,
    label: '3,500 Tokens',
    priceId: 'price_1T92wKKvhVLecCSvnhNCNVHc',
  },
  immortal: {
    tokens: 8500,
    pence: 4999,
    label: '8,500 Tokens',
    priceId: 'price_1T92yTKvhVLecCSvRqpaI9j2',
  },
};

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(
  packageId: string,
  playerId: string,
  successUrl: string,
  cancelUrl: string,
  gameUrl: string
): Promise<{ url: string | null; error?: string }> {
  const pkg = TOKEN_PACKAGES[packageId];

  if (!pkg) {
    return { url: null, error: 'Invalid package' };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: pkg.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${gameUrl}?payment=success`,
      cancel_url: cancelUrl || `${gameUrl}?payment=cancelled`,
      metadata: {
        playerId,
        packageId,
      },
    });

    return { url: session.url };
  } catch (error: any) {
    console.error('Stripe checkout error:', error.message);
    return { url: null, error: error.message };
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  body: Buffer,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret) as Stripe.Event;
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return null;
  }
}

/**
 * Handle completed checkout session
 */
export function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): {
  playerId: string | null;
  packageId: string | null;
  tokens: number;
  pence: number;
} {
  const playerId = (session.metadata?.playerId as string) || null;
  const packageId = (session.metadata?.packageId as string) || null;
  const pkg = packageId ? TOKEN_PACKAGES[packageId] : null;

  return {
    playerId,
    packageId,
    tokens: pkg?.tokens || 0,
    pence: pkg?.pence || 0,
  };
}

/**
 * Get all published token packages
 */
export function getTokenPackages(): Array<{
  id: string;
  label: string;
  tokens: number;
  pence: number;
  display: string;
}> {
  return Object.entries(TOKEN_PACKAGES).map(([id, pkg]) => ({
    id,
    label: pkg.label,
    tokens: pkg.tokens,
    pence: pkg.pence,
    display: `£${(pkg.pence / 100).toFixed(2)}`,
  }));
}

/**
 * Validate Stripe is configured
 */
export function validateStripeConfig(): boolean {
  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_placeholder') {
    console.warn('Stripe not fully configured (development mode)');
    return false;
  }
  return true;
}
