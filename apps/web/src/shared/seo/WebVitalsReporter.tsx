'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Collects Core Web Vitals (LCP, INP, CLS, FCP, TTFB) from the client and
 * forwards them somewhere observable. We don't ship an analytics provider
 * in this PR — the hook is in place and routes through a typed `dispatch`
 * function so wiring it to a real backend (GA4, Vercel Analytics, Plausible,
 * a custom `/api/metrics` endpoint) is a one-line change.
 *
 * Why this matters for SEO: Google uses field CrUX data (CWV from real
 * Chrome users) as a ranking signal. Having a reporter in production gives
 * us our own RUM stream to optimize against between CrUX refreshes.
 */

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

function dispatch(metric: Metric): void {
  // No-op by default. When analytics are added, route this through
  // `navigator.sendBeacon('/api/metrics', JSON.stringify(metric))` so the
  // report survives page unload.
  if (
    process.env.NODE_ENV !== 'production' &&
    typeof window !== 'undefined' &&
    window.localStorage?.getItem('debug:web-vitals') === '1'
  ) {
    console.info('[web-vitals]', metric.name, metric.value, metric);
  }
}

export function WebVitalsReporter() {
  useReportWebVitals(dispatch);
  return null;
}
