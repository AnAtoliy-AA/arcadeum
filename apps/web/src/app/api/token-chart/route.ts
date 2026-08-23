import { NextRequest, NextResponse } from 'next/server';

const GECKOTERMINAL_API = new URL('https://api.geckoterminal.com');

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const TIMEFRAME_REGEX = /^[a-z0-9]+$/i;
const AGGREGATE_REGEX = /^\d+$/;
const LIMIT_REGEX = /^\d+$/;

function isValidSolanaAddress(address: string): boolean {
  return SOLANA_ADDRESS_REGEX.test(address);
}

function isValidTimeframe(tf: string): boolean {
  return TIMEFRAME_REGEX.test(tf) && tf.length <= 20;
}

function isValidAggregate(agg: string): boolean {
  return AGGREGATE_REGEX.test(agg) && agg.length <= 5;
}

function isValidLimit(lim: string): boolean {
  return LIMIT_REGEX.test(lim) && lim.length <= 5;
}

const ALLOWED_UPSTREAM_ORIGIN = /^https:\/\/api\.geckoterminal\.com\//;

function safeFetch(url: URL): ReturnType<typeof fetch> {
  if (url.protocol !== 'https:' || !ALLOWED_UPSTREAM_ORIGIN.test(url.href)) {
    throw new Error('Request blocked: unexpected hostname');
  }
  return fetch(url.toString(), { next: { revalidate: 30 } });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const pool = searchParams.get('pool');
  const timeframe = searchParams.get('timeframe');
  const aggregate = searchParams.get('aggregate');
  const limit = searchParams.get('limit');

  if (!pool || !isValidSolanaAddress(pool)) {
    return NextResponse.json(
      { error: 'pool parameter required' },
      { status: 400 },
    );
  }

  try {
    if (timeframe) {
      if (!isValidTimeframe(timeframe)) {
        return NextResponse.json(
          { error: 'Invalid timeframe parameter' },
          { status: 400 },
        );
      }
      const safeAggregate =
        aggregate && isValidAggregate(aggregate) ? aggregate : '5';
      const safeLimit = limit && isValidLimit(limit) ? limit : '100';
      const url = new URL(
        `/api/v2/networks/solana/pools/${encodeURIComponent(pool)}/ohlcv/${encodeURIComponent(timeframe)}`,
        GECKOTERMINAL_API,
      );
      url.searchParams.set('aggregate', safeAggregate);
      url.searchParams.set('limit', safeLimit);
      const res = await safeFetch(url);
      if (!res.ok) {
        return NextResponse.json(
          { error: 'Upstream error' },
          { status: res.status },
        );
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    const url = new URL(
      `/api/v2/networks/solana/pools/${encodeURIComponent(pool)}`,
      GECKOTERMINAL_API,
    );
    const res = await safeFetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Upstream error' },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 502 });
  }
}
