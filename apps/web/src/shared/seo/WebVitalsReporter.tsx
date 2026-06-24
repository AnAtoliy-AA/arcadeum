'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Collects Core Web Vitals (LCP, INP, CLS, FCP, TTFB) from the client
 * and ships them to `/api/metrics` via `navigator.sendBeacon` so the
 * payload survives page unload (which is exactly when LCP/INP fire on
 * most navigations). The server route is a thin accept-and-drop sink
 * for now; pointing it at a real RUM store is a follow-up.
 *
 * Why this matters for SEO: Google uses field CrUX data (CWV from
 * real Chrome users) as a ranking signal. Without RUM we'd only see
 * lab data from Lighthouse, which can drift from what real visitors
 * actually experience.
 */

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

const ENDPOINT = '/api/metrics';

function dispatch(metric: Metric): void {
  if (typeof window === 'undefined') return;

  // sendBeacon is the only API guaranteed to deliver during page
  // unload, which is when the most useful CWV samples land. Fallback
  // to fetch+keepalive for the (rare) browsers that don't expose it.
  const payload = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
    delta: metric.delta,
    page: window.location.pathname,
  });

  const beacon = (
    navigator as Navigator & {
      sendBeacon?: (url: string, data: string) => boolean;
    }
  ).sendBeacon;

  if (beacon) {
    try {
      beacon.call(navigator, ENDPOINT, payload);
    } catch {
      /* Best-effort; never let RUM failures surface to the user. */
    }
  } else {
    // Browsers without sendBeacon (older Safari, some bots) still get
    // best-effort delivery via fetch + keepalive.
    fetch(ENDPOINT, {
      method: 'POST',
      body: payload,
      keepalive: true,
      headers: { 'content-type': 'application/json' },
    }).catch(() => undefined);
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    window.localStorage?.getItem('debug:web-vitals') === '1'
  ) {
    const navTag =
      metric.navigationType === 'soft-nav' ? ' [soft-nav]' : '';
    console.info(
      `[web-vitals]${navTag}`,
      metric.name,
      metric.value,
      metric,
    );
  }
}

export function WebVitalsReporter() {
  useReportWebVitals(dispatch);
  return null;
}
