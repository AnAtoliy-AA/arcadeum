// PostHog adapter (roadmap 6C). posthog-js is dynamically imported so the
// bundle stays untouched unless NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog.
// Autocapture is disabled — only explicit funnel events and pageviews go out.

import type { AnalyticsPayload } from '@/shared/lib/analytics';

type PostHogClient = {
  capture: (event: string, props?: Record<string, unknown>) => void;
};

let clientPromise: Promise<PostHogClient | null> | null = null;

export function loadPostHog(key: string, apiHost: string): void {
  if (typeof window === 'undefined') return;
  if (clientPromise) return;

  clientPromise = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: apiHost,
        autocapture: false,
        persistence: 'localStorage+cookie',
        // Pageviews come from the provider itself; explicit events are
        // instrumented via shared/analytics/funnel.ts.
        capture_pageview: true,
      });
      return posthog as PostHogClient;
    })
    .catch(() => null);
}

export function sendPostHogEvent(event: string, props: AnalyticsPayload): void {
  if (typeof window === 'undefined' || !clientPromise) return;
  void clientPromise.then((client) => {
    try {
      client?.capture(event, { ...props });
    } catch {
      // Never let analytics break product code.
    }
  });
}
