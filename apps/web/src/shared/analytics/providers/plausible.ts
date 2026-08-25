// Plausible adapter (roadmap 6C). Cookieless, privacy-first — no consent
// banner needed. Uses the official queue shim so events emitted before the
// script finishes loading are replayed once it arrives.

import type { AnalyticsPayload } from '@/shared/lib/analytics';

type PlausibleOptions = { props?: Record<string, unknown> };
type PlausibleFn = {
  (event: string, options?: PlausibleOptions): void;
  q?: unknown[];
};

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

const SCRIPT_ATTR = 'data-analytics-provider';

export function loadPlausible(domain: string, apiHost: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (document.querySelector(`script[${SCRIPT_ATTR}="plausible"]`)) return;

  // Queue shim from https://plausible.io/docs/custom-events — the real script
  // replaces window.plausible and processes anything queued meanwhile.
  const plausible =
    window.plausible ??
    (((event: string, options?: PlausibleOptions) => {
      const fn = window.plausible;
      if (!fn) return;
      (fn.q = fn.q ?? []).push([event, options]);
    }) as PlausibleFn);
  window.plausible = plausible;

  const script = document.createElement('script');
  script.src = `${apiHost}/js/script.js`;
  script.defer = true;
  script.dataset.domain = domain;
  script.setAttribute(SCRIPT_ATTR, 'plausible');
  document.head.appendChild(script);
}

export function sendPlausibleEvent(
  event: string,
  props: AnalyticsPayload,
): void {
  if (typeof window === 'undefined') return;
  try {
    window.plausible?.(event, props ? { props: { ...props } } : undefined);
  } catch {
    // Never let analytics break product code.
  }
}
