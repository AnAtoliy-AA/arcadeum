export interface DataPoint {
  time: string;
  ts: number;
  value: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface PoolStats {
  priceUsd: string;
  priceChange: Record<string, string>;
  volume24h: number;
  liquidity: number;
  fdv: number;
  txns24h: { buys: number; sells: number };
}

export type TimeRange = '1H' | '1D' | '1W' | '1M' | '3M' | 'ALL';

export const TIME_RANGES: TimeRange[] = ['1H', '1D', '1W', '1M', '3M', 'ALL'];

export const RANGE_LABEL: Record<TimeRange, string> = {
  '1H': '1 Hour',
  '1D': '1 Day',
  '1W': '1 Week',
  '1M': '1 Month',
  '3M': '3 Months',
  ALL: 'All Time',
};

const RANGE_CONFIG: Record<
  TimeRange,
  Array<{ timeframe: string; aggregate: string; limit: number }>
> = {
  '1H': [
    { timeframe: 'minute', aggregate: '5', limit: 12 },
    { timeframe: 'minute', aggregate: '15', limit: 4 },
  ],
  '1D': [
    { timeframe: 'minute', aggregate: '15', limit: 96 },
    { timeframe: 'minute', aggregate: '30', limit: 48 },
  ],
  '1W': [
    { timeframe: 'hour', aggregate: '1', limit: 168 },
    { timeframe: 'hour', aggregate: '4', limit: 42 },
  ],
  '1M': [
    { timeframe: 'day', aggregate: '1', limit: 30 },
    { timeframe: 'hour', aggregate: '4', limit: 180 },
  ],
  '3M': [
    { timeframe: 'day', aggregate: '1', limit: 90 },
    { timeframe: 'day', aggregate: '3', limit: 30 },
  ],
  ALL: [
    { timeframe: 'day', aggregate: '1', limit: 365 },
    { timeframe: 'week', aggregate: '1', limit: 52 },
  ],
};

export function formatPrice(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n >= 0.01) return `$${n.toFixed(6)}`;
  if (n >= 0.000001) return `$${n.toFixed(8)}`;
  return `$${n.toExponential(2)}`;
}

export function formatVolume(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatTooltipLabel(ts: number): string {
  const date = new Date(ts * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatXTick(ts: number, range: TimeRange): string {
  const date = new Date(ts * 1000);
  if (range === '1H' || range === '1D') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const PRICE_CHANGE_KEY: Record<TimeRange, string> = {
  '1H': 'h1',
  '1D': 'h24',
  '1W': 'h24',
  '1M': 'h24',
  '3M': 'h24',
  ALL: 'h24',
};

export function calcPriceChange(
  data: DataPoint[],
  poolStats: PoolStats | null,
  range: TimeRange,
): number {
  const apiKey = PRICE_CHANGE_KEY[range];
  const apiChange = Number(poolStats?.priceChange?.[apiKey] ?? 0);

  if (range === '1H' || range === '1D') return apiChange;

  const first = data.length > 0 ? data[0].value : 0;
  const last = data.length > 0 ? data[data.length - 1].value : 0;
  return first !== 0 ? ((last - first) / first) * 100 : 0;
}

export async function fetchPoolStats(
  poolAddress: string,
): Promise<PoolStats | null> {
  try {
    const res = await fetch(`/api/token-chart?pool=${poolAddress}`);
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.data?.attributes;
    if (!a) return null;
    return {
      priceUsd: a.base_token_price_usd ?? '0',
      priceChange: a.price_change_percentage ?? {},
      volume24h: Number(a.volume_usd?.h24 ?? 0),
      liquidity: Number(a.reserve_in_usd ?? 0),
      fdv: Number(a.fdv_usd ?? 0),
      txns24h: a.transactions?.h24 ?? { buys: 0, sells: 0 },
    };
  } catch {
    return null;
  }
}

const RANGE_SECONDS: Record<TimeRange, number> = {
  '1H': 3600,
  '1D': 86400,
  '1W': 604800,
  '1M': 2592000,
  '3M': 7776000,
  ALL: 31536000,
};

export async function fetchOHLCV(
  poolAddress: string,
  range: TimeRange,
): Promise<DataPoint[]> {
  const configs = RANGE_CONFIG[range];
  if (!configs) return [];

  let ohlcvList: Array<[number, number, number, number, number, number]> = [];

  for (const cfg of configs) {
    try {
      const res = await fetch(
        `/api/token-chart?pool=${poolAddress}&timeframe=${cfg.timeframe}&aggregate=${cfg.aggregate}&limit=${cfg.limit}`,
      );
      if (res.ok) {
        const data = await res.json();
        ohlcvList = data?.data?.attributes?.ohlcv_list ?? [];
        if (ohlcvList.length > 0) break;
      }
    } catch {
      // try next config
    }
  }

  if (!Array.isArray(ohlcvList) || ohlcvList.length === 0) return [];

  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - RANGE_SECONDS[range];

  const points = ohlcvList
    .filter(
      (candle: [number, number, number, number, number, number]) =>
        candle[0] >= cutoff,
    )
    .map((candle: [number, number, number, number, number, number]) => {
      const [timestamp, open, high, low, close, vol] = candle;

      let timeLabel: string;
      if (range === '1H' || range === '1D') {
        timeLabel = new Date(timestamp * 1000).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else {
        timeLabel = new Date(timestamp * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }

      return {
        time: timeLabel,
        ts: timestamp,
        value: close,
        open,
        high,
        low,
        volume: vol,
      };
    })
    .reverse();

  if (points.length === 0) {
    const last = ohlcvList[ohlcvList.length - 1];
    if (!last) return [];
    const [ts, , , , close] = last;
    points.push({
      time: '',
      ts,
      value: close,
      open: close,
      high: close,
      low: close,
      volume: 0,
    });
  }
  if (points.length === 1) {
    const p = points[0];
    points.unshift({
      ...p,
      ts: cutoff,
      time: '',
      open: p.value,
      high: p.value,
      low: p.value,
      volume: 0,
    });
  }

  return points;
}
