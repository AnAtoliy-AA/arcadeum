import { NextRequest, NextResponse } from 'next/server';

const GECKOTERMINAL_BASE =
  'https://api.geckoterminal.com/api/v2/networks/solana/pools';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pool = searchParams.get('pool');
  const timeframe = searchParams.get('timeframe');
  const aggregate = searchParams.get('aggregate');
  const limit = searchParams.get('limit');

  if (!pool) {
    return NextResponse.json(
      { error: 'pool parameter required' },
      { status: 400 },
    );
  }

  try {
    if (timeframe) {
      const url = `${GECKOTERMINAL_BASE}/${pool}/ohlcv/${timeframe}?aggregate=${aggregate ?? '5'}&limit=${limit ?? '100'}`;
      const res = await fetch(url, { next: { revalidate: 30 } });
      if (!res.ok) {
        return NextResponse.json(
          { error: 'Upstream error' },
          { status: res.status },
        );
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    const res = await fetch(`${GECKOTERMINAL_BASE}/${pool}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Upstream error' },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch' },
      { status: 502 },
    );
  }
}
