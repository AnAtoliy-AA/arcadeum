import { NextRequest, NextResponse } from 'next/server';

/**
 * Web Vitals ingestion endpoint. Receives CWV metrics (LCP, INP, CLS,
 * FCP, TTFB) from `WebVitalsReporter` via `navigator.sendBeacon`, which
 * survives page unload. The route deliberately stays a thin accept-and-
 * drop sink for now — the goal of this PR is to flip the reporter from
 * no-op to "actually sending data" so we can wire a real backend
 * (Vercel Analytics, ClickHouse, a custom RUM store) in a follow-up
 * without another round-trip on the client.
 *
 * Why this matters for SEO: Google uses field CrUX data (CWV from real
 * Chrome users) as a ranking signal. Without RUM we only have lab data
 * from Lighthouse, which can drift significantly from what actual
 * visitors experience.
 */

interface WebVitalsPayload {
  name: string;
  value: number;
  rating?: string;
  id?: string;
  navigationType?: string;
  delta?: number;
  page?: string;
}

function isPayload(value: unknown): value is WebVitalsPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === 'string' && typeof v.value === 'number';
}

export const runtime = 'edge';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (!isPayload(payload)) {
    return new NextResponse(null, { status: 400 });
  }

  if (process.env.NODE_ENV !== 'production') {
    // Surface metric to the dev server console; helps detect regressions
    // during local development without a third-party RUM provider.
    console.info(
      `[web-vitals] ${payload.name}=${payload.value}` +
        (payload.rating ? ` (${payload.rating})` : ''),
    );
  }

  // 204 keeps the response body empty — `sendBeacon` doesn't read the
  // body anyway, and an empty response avoids any chance of the browser
  // logging a console warning about content-type mismatches.
  return new NextResponse(null, { status: 204 });
}
