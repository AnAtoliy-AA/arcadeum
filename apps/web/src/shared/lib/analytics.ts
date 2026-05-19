'use client';

// Lightweight analytics shim. No provider is wired up yet — this exists so
// product surfaces can call `track('feature.event', { ... })` today and have
// the call recorded in dev devtools; when a real provider (PostHog, Mixpanel,
// GA4, etc.) is added the implementation slots in here without touching call
// sites. Server code shouldn't import this — analytics is a client concern.

type AnalyticsPayload = Record<string, string | number | boolean | null>;

const isDev = process.env.NODE_ENV === 'development';

export function track(event: string, props?: AnalyticsPayload): void {
  if (typeof window === 'undefined') return;
  if (isDev) {
    // Single console.debug per event keeps the dev console scrollable; switch
    // to console.info if QA wants a louder signal during a campaign. Gated
    // strictly to development so test runs (`NODE_ENV=test`) stay quiet.
    console.debug('[analytics]', event, props ?? {});
  }
  // Real provider plugs in here. Keep the shim sync so callers don't need to
  // await — providers should buffer and flush internally.
}
