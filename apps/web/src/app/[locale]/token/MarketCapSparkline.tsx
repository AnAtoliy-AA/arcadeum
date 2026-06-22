'use client';

import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import styles from './TokenClient.module.scss';

type TimeRange = '1H' | '1D' | '1W' | '1M' | '3M' | 'ALL';

const TIME_RANGES: TimeRange[] = ['1H', '1D', '1W', '1M', '3M', 'ALL'];

interface DataPoint {
  time: string;
  ts: number;
  value: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface PoolStats {
  priceUsd: string;
  priceChange: Record<string, string>;
  volume24h: number;
  liquidity: number;
  fdv: number;
  txns24h: { buys: number; sells: number };
}

function formatPrice(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n >= 0.01) return `$${n.toFixed(6)}`;
  if (n >= 0.000001) return `$${n.toFixed(8)}`;
  return `$${n.toExponential(2)}`;
}

function formatVolume(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

const RANGE_CONFIG: Array<{
  key: TimeRange;
  timeframe: string;
  aggregate: string;
  limit: number;
}> = [
  { key: '1H', timeframe: 'minute', aggregate: '5', limit: 12 },
  { key: '1D', timeframe: 'minute', aggregate: '15', limit: 96 },
  { key: '1W', timeframe: 'hour', aggregate: '1', limit: 168 },
  { key: '1M', timeframe: 'day', aggregate: '1', limit: 30 },
  { key: '3M', timeframe: 'day', aggregate: '1', limit: 90 },
  { key: 'ALL', timeframe: 'day', aggregate: '1', limit: 365 },
];

const FALLBACK_CONFIG: Array<{
  timeframe: string;
  aggregate: string;
  limit: number;
}> = [
  { timeframe: 'minute', aggregate: '5', limit: 200 },
  { timeframe: 'minute', aggregate: '15', limit: 200 },
  { timeframe: 'hour', aggregate: '1', limit: 200 },
  { timeframe: 'hour', aggregate: '4', limit: 200 },
  { timeframe: 'day', aggregate: '1', limit: 200 },
];

const RANGE_LABEL: Record<TimeRange, string> = {
  '1H': '1 Hour',
  '1D': '1 Day',
  '1W': '1 Week',
  '1M': '1 Month',
  '3M': '3 Months',
  ALL: 'All Time',
};

async function fetchPoolStats(
  poolAddress: string,
): Promise<PoolStats | null> {
  try {
    const res = await fetch(
      `/api/token-chart?pool=${poolAddress}`,
    );
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

async function fetchOHLCV(
  poolAddress: string,
  range: TimeRange,
): Promise<DataPoint[]> {
  const config = RANGE_CONFIG.find((c) => c.key === range);
  if (!config) return [];

  let ohlcvList: Array<[number, number, number, number, number, number]> = [];

  try {
    const primaryRes = await fetch(
      `/api/token-chart?pool=${poolAddress}&timeframe=${config.timeframe}&aggregate=${config.aggregate}&limit=${config.limit}`,
    );
    if (primaryRes.ok) {
      const primaryData = await primaryRes.json();
      ohlcvList = primaryData?.data?.attributes?.ohlcv_list ?? [];
    }
  } catch {
    ohlcvList = [];
  }

  if (ohlcvList.length === 0) {
    for (const fb of FALLBACK_CONFIG) {
      try {
        const res = await fetch(
          `/api/token-chart?pool=${poolAddress}&timeframe=${fb.timeframe}&aggregate=${fb.aggregate}&limit=${fb.limit}`,
        );
        if (res.ok) {
          const data = await res.json();
          ohlcvList = data?.data?.attributes?.ohlcv_list ?? [];
          if (ohlcvList.length > 0) break;
        }
      } catch {
        // continue to next fallback
      }
    }
  }

  if (!Array.isArray(ohlcvList) || ohlcvList.length === 0) return [];

  return ohlcvList
    .map(
      (candle: [number, number, number, number, number, number]) => {
        const [timestamp, open, high, low, close, vol] = candle;
        const date = new Date(timestamp * 1000);

        let timeLabel: string;
        if (range === '1H' || range === '1D') {
          timeLabel = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
        } else {
          timeLabel = date.toLocaleDateString('en-US', {
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
      },
    )
    .reverse();
}

function formatTooltipLabel(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: DataPoint }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DataPoint;
  if (!d || typeof d.open !== 'number') return null;
  const close = d.value ?? 0;
  const open = d.open;
  const high = d.high;
  const low = d.low;
  const vol = d.volume ?? 0;
  const change = close - open;
  const changePct = open !== 0 ? (change / open) * 100 : 0;
  const isUp = change >= 0;

  return (
    <div className={styles.chartTooltip}>
      <div className={styles.tooltipTime}>{label ? formatTooltipLabel(Number(label)) : ''}</div>
      <div className={styles.tooltipGrid}>
        <span className={styles.tooltipKey}>Open</span>
        <span className={styles.tooltipVal}>{formatPrice(open)}</span>
        <span className={styles.tooltipKey}>High</span>
        <span className={styles.tooltipVal}>{formatPrice(high)}</span>
        <span className={styles.tooltipKey}>Low</span>
        <span className={styles.tooltipVal}>{formatPrice(low)}</span>
        <span className={styles.tooltipKey}>Close</span>
        <span
          className={styles.tooltipVal}
          style={{ color: isUp ? '#34d399' : '#f87171' }}
        >
          {formatPrice(close)} ({isUp ? '+' : ''}
          {changePct.toFixed(2)}%)
        </span>
        <span className={styles.tooltipKey}>Vol</span>
        <span className={styles.tooltipVal}>{formatVolume(vol)}</span>
      </div>
    </div>
  );
}

export default function MarketCapSparkline() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1D');
  const [data, setData] = useState<DataPoint[]>([]);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [loading, setLoading] = useState(false);

  const poolAddress =
    process.env.NEXT_PUBLIC_ARC_POOL_ADDRESS ??
    'BHYF1uFfwujrZyLrAQw3vZJQFQ6XEkRk4TNxHo8kTTXj';

  useEffect(() => {
    if (!poolAddress) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      const [ohlcv, stats] = await Promise.all([
        fetchOHLCV(poolAddress, selectedRange),
        fetchPoolStats(poolAddress),
      ]);
      if (!cancelled) {
        setData(ohlcv);
        if (stats) setPoolStats(stats);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [poolAddress, selectedRange]);

  if (!poolAddress) return null;

  const priceChangeKey: Record<TimeRange, string> = {
    '1H': 'h1',
    '1D': 'h24',
    '1W': 'h24',
    '1M': 'h24',
    '3M': 'h24',
    ALL: 'h24',
  };

  const priceChangeKeyForRange = priceChangeKey[selectedRange];
  const apiPriceChange = Number(
    poolStats?.priceChange?.[priceChangeKeyForRange] ?? 0,
  );

  const firstPrice = data.length > 0 ? data[0].value : 0;
  const lastPrice = data.length > 0 ? data[data.length - 1].value : 0;
  const periodChange =
    firstPrice !== 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

  const usePeriodChange = selectedRange !== '1H' && selectedRange !== '1D';
  const priceChange = usePeriodChange ? periodChange : apiPriceChange;
  const isUp = priceChange >= 0;

  const values = data.map((d) => d.value);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const pricePadding = (maxVal - minVal) * 0.1 || maxVal * 0.1;

  const periodHigh = values.length > 0 ? Math.max(...values) : 0;
  const periodLow = values.length > 0 ? Math.min(...values) : 0;
  const periodVol = data.reduce((a, d) => a + (d.volume ?? 0), 0);

  const formatXTick = (ts: number): string => {
    const date = new Date(ts);
    if (selectedRange === '1H' || selectedRange === '1D') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.sparklineContainer}>
      <div className={styles.sparklineHeader}>
        <div>
          <span className={styles.sparklineLabel}>Price (USD)</span>
          <div className={styles.sparklinePriceRow}>
            <span className={styles.sparklineValue}>
              {formatPrice(
                Number(poolStats?.priceUsd ?? data[data.length - 1]?.value ?? 0),
              )}
            </span>
            <span
              className={`${styles.sparklineChange} ${isUp ? styles.changeUp : styles.changeDown}`}
            >
              {isUp ? '+' : ''}
              {priceChange.toFixed(2)}% ({RANGE_LABEL[selectedRange]})
            </span>
          </div>
        </div>
      </div>

      <div className={styles.sparklineChart}>
        {loading ? (
          <div className={styles.sparklineLoading} />
        ) : data.length === 0 ? (
          <div className={styles.sparklineEmpty}>
            No price data available for this range yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 8, left: 8, bottom: 4 }}
            >
              <defs>
                <linearGradient
                  id="priceGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#6366f1"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="#6366f1"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="ts"
                tickFormatter={formatXTick}
                tick={{ fontSize: 10, fill: '#52525b' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                yAxisId="price"
                domain={[minVal - pricePadding, maxVal + pricePadding]}
                tick={{ fontSize: 10, fill: '#52525b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
                width={65}
              />
              <Tooltip
                content={<ChartTooltip />}
                wrapperStyle={{ pointerEvents: 'none' }}
              />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: '#6366f1',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className={styles.timeRangeButtons}>
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            className={`${styles.timeRangeBtn} ${selectedRange === range ? styles.timeRangeBtnActive : ''}`}
            onClick={() => setSelectedRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      <div className={styles.periodStats}>
        <div className={styles.periodStat}>
          <span className={styles.periodStatLabel}>
            {RANGE_LABEL[selectedRange]} High
          </span>
          <span className={styles.periodStatValue}>
            {formatPrice(periodHigh)}
          </span>
        </div>
        <div className={styles.periodStat}>
          <span className={styles.periodStatLabel}>
            {RANGE_LABEL[selectedRange]} Low
          </span>
          <span className={styles.periodStatValue}>
            {formatPrice(periodLow)}
          </span>
        </div>
        <div className={styles.periodStat}>
          <span className={styles.periodStatLabel}>
            {RANGE_LABEL[selectedRange]} Vol
          </span>
          <span className={styles.periodStatValue}>
            {formatVolume(periodVol)}
          </span>
        </div>
        {poolStats && (
          <>
            <div className={styles.periodStat}>
              <span className={styles.periodStatLabel}>Liquidity</span>
              <span className={styles.periodStatValue}>
                {formatVolume(poolStats.liquidity)}
              </span>
            </div>
            <div className={styles.periodStat}>
              <span className={styles.periodStatLabel}>Buys (24h)</span>
              <span
                className={styles.periodStatValue}
                style={{ color: '#34d399' }}
              >
                {poolStats.txns24h.buys}
              </span>
            </div>
            <div className={styles.periodStat}>
              <span className={styles.periodStatLabel}>Sells (24h)</span>
              <span
                className={styles.periodStatValue}
                style={{ color: '#f87171' }}
              >
                {poolStats.txns24h.sells}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
