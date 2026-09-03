'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import {
  type DataPoint,
  type TimeRange,
  type PoolStats,
  TIME_RANGES,
  RANGE_LABEL,
  formatPrice,
  formatPriceWithUsdc,
  formatVolume,
  formatTooltipLabel,
  formatXTick,
  calcPriceChange,
  fetchPoolStats,
  fetchOHLCV,
} from './chartHelpers';
import styles from './Sparkline.module.scss';

const LazyComposedChart = lazy(() =>
  import('recharts').then((m) => ({
    default: m.ComposedChart,
  })),
);
const LazyArea = lazy(() =>
  import('recharts').then((m) => ({ default: m.Area })),
);
const LazyResponsiveContainer = lazy(() =>
  import('recharts').then((m) => ({ default: m.ResponsiveContainer })),
);
const LazyTooltip = lazy(() =>
  import('recharts').then((m) => ({ default: m.Tooltip })),
);
const LazyXAxis = lazy(() =>
  import('recharts').then((m) => ({ default: m.XAxis })),
);
const LazyYAxis = lazy(() =>
  import('recharts').then((m) => ({ default: m.YAxis })),
);
const LazyCartesianGrid = lazy(() =>
  import('recharts').then((m) => ({ default: m.CartesianGrid })),
);

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
      <div className={styles.tooltipTime}>
        {label ? formatTooltipLabel(Number(label)) : ''}
      </div>
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

  const priceChange = calcPriceChange(data, poolStats, selectedRange);
  const isUp = priceChange >= 0;

  const values = data.map((d) => d.value);
  // Single-pass min/max to avoid Math.max(...spread) stack overflow risk
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (const v of values) {
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }
  if (minVal === Infinity) minVal = 0;
  if (maxVal === -Infinity) maxVal = 0;
  const pricePadding = (maxVal - minVal) * 0.1 || maxVal * 0.1;

  const periodHigh = maxVal;
  const periodLow = minVal;
  const periodVol = data.reduce((a, d) => a + (d.volume ?? 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Price (USD)</span>
        <div className={styles.priceRow}>
          <span className={styles.value}>
            {formatPriceWithUsdc(
              Number(poolStats?.priceUsd ?? data[data.length - 1]?.value ?? 0),
            )}
          </span>
          <span
            className={`${styles.change} ${isUp ? styles.changeUp : styles.changeDown}`}
          >
            {isUp ? '+' : ''}
            {priceChange.toFixed(2)}% ({RANGE_LABEL[selectedRange]})
          </span>
        </div>
      </div>

      <div className={styles.chart}>
        {loading ? (
          <div className={styles.loading} />
        ) : data.length === 0 ? (
          <div className={styles.empty}>
            No price data available for this range yet.
          </div>
        ) : (
          <Suspense fallback={<div className={styles.loading} />}>
            <LazyResponsiveContainer width="100%" height={240}>
              <LazyComposedChart
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
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <LazyCartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <LazyXAxis
                  dataKey="ts"
                  tickFormatter={(ts) => formatXTick(ts, selectedRange)}
                  tick={{ fontSize: 10, fill: '#52525b' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <LazyYAxis
                  yAxisId="price"
                  domain={[minVal - pricePadding, maxVal + pricePadding]}
                  tick={{ fontSize: 10, fill: '#52525b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatPrice}
                  width={65}
                />
                <LazyTooltip
                  content={<ChartTooltip />}
                  wrapperStyle={{ pointerEvents: 'none' }}
                />
                <LazyArea
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
              </LazyComposedChart>
            </LazyResponsiveContainer>
          </Suspense>
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
