/**
 * Analytics wrapper — Posthog
 *
 * Posthog is loaded via CDN snippet in app/layout.tsx.
 * Set NEXT_PUBLIC_POSTHOG_KEY to enable.
 * All calls are no-ops when Posthog is absent.
 */

type Properties = Record<string, string | number | boolean | null | undefined>;

function ph(): { capture: (e: string, p?: Properties) => void } | undefined {
  if (typeof window === 'undefined') return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).posthog;
}

export function trackEvent(event: string, properties?: Properties) {
  ph()?.capture(event, properties);
}

// ── Typed convenience helpers ─────────────────────────────────────────────────

export const analytics = {
  characterCreated(cls: string, worldSeed: string) {
    trackEvent('character_created', { class: cls, world_seed: worldSeed });
  },
  narratorCall(modelTier: string) {
    trackEvent('narrator_call', { model_tier: modelTier });
  },
  cloudSave(slot: number) {
    trackEvent('cloud_save', { slot });
  },
  tokenPurchaseStarted(packageId: string, tokens: number, pence: number) {
    trackEvent('token_purchase_started', { package_id: packageId, tokens, pence });
  },
  sessionStart() {
    trackEvent('session_start');
  },
};
