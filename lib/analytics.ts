/**
 * Analytics wrapper — Posthog
 *
 * PostHog is initialised on-demand via initPostHog() (called by CookieConsent
 * when the user accepts analytics). Set NEXT_PUBLIC_POSTHOG_KEY to enable.
 * All tracking calls are no-ops when PostHog is absent.
 */

type Properties = Record<string, string | number | boolean | null | undefined>;

function ph(): { capture: (e: string, p?: Properties) => void } | undefined {
  if (typeof window === 'undefined') return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).posthog;
}

let posthogInitialised = false;

/**
 * Dynamically initialise PostHog after cookie consent.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function initPostHog(): void {
  if (typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || posthogInitialised) return;
  posthogInitialised = true;

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

  // Inline PostHog snippet (same as the official CDN snippet)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (!w.posthog) {
    w.posthog = [];
    w.posthog._i = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    w.posthog.init = function (i: string, s: any, a: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function g(t: any, e: string) {
        const o = e.split('.');
        if (o.length === 2) { t = t[o[0]]; e = o[1]; }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
      }
      const p = document.createElement('script');
      p.type = 'text/javascript';
      p.crossOrigin = 'anonymous';
      p.async = true;
      p.src = s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
      const r = document.getElementsByTagName('script')[0];
      r.parentNode!.insertBefore(p, r);
      let u = w.posthog;
      if (typeof a !== 'undefined') { u = w.posthog[a] = []; } else { a = 'posthog'; }
      u.people = u.people || [];
      u.toString = function (t: boolean) { let e = 'posthog'; if (a !== 'posthog') e += '.' + a; if (!t) e += ' (stub)'; return e; };
      u.people.toString = function () { return u.toString(true) + ' (stub)'; };
      'capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId setPersonPropertiesForFlags'
        .split(' ').forEach(m => g(u, m));
      w.posthog._i.push([i, s, a]);
    };
    w.posthog.__SV = 1;
  }
  w.posthog.init(key, { api_host: host, person_profiles: 'identified_only' });
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
