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
import { cx } from '@arcadeum/ui/utils/cx';

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
    <div className="p-3 rounded-[10px] bg-[var(--background)] border border-[var(--glassBorderStrong)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] min-w-[160px]">
      <div className="text-[11px] text-[var(--textSecondary)] mb-2 pb-1.5 border-b border-[var(--glassBorder)]">
        {label ? formatTooltipLabel(Number(label)) : ''}
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-[3px]_2.5">
        <span className="text-[11px] text-[var(--textSecondary)]">Open</span>
        <span className="text-[11px] font-semibold text-[var(--color)] text-right">
          {formatPrice(open)}
        </span>
        <span className="text-[11px] text-[var(--textSecondary)]">High</span>
        <span className="text-[11px] font-semibold text-[var(--color)] text-right">
          {formatPrice(high)}
        </span>
        <span className="text-[11px] text-[var(--textSecondary)]">Low</span>
        <span className="text-[11px] font-semibold text-[var(--color)] text-right">
          {formatPrice(low)}
        </span>
        <span className="text-[11px] text-[var(--textSecondary)]">Close</span>
        <span
          className="text-[11px] font-semibold text-right"
          style={{ color: isUp ? '#34d399' : '#f87171' }}
        >
          {formatPrice(close)} ({isUp ? '+' : ''}
          {changePct.toFixed(2)}%)
        </span>
        <span className="text-[11px] text-[var(--textSecondary)]">Vol</span>
        <span className="text-[11px] font-semibold text-[var(--color)] text-right">
          {formatVolume(vol)}
        </span>
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
    <div className="mb-8 p-5 rounded-[16px] bg-[var(--background)] border border-[var(--glassBorder)]">
      <style>{`
        .dark .sp-change-up { color: #34d399; }
        .dark .sp-change-down { color: #f87171; }
      `}</style>

      <div className="mb-4">
        <span className="text-xs text-[var(--textSecondary)] uppercase tracking-[0.08em]">
          Price (USD)
        </span>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-2xl font-bold text-[var(--color)]">
            {formatPriceWithUsdc(
              Number(poolStats?.priceUsd ?? data[data.length - 1]?.value ?? 0),
            )}
          </span>
          <span
            className={cx(
              'text-[13px] font-semibold',
              isUp
                ? 'text-[#10b981] sp-change-up'
                : 'text-[#ef4444] sp-change-down',
            )}
          >
            {isUp ? '+' : ''}
            {priceChange.toFixed(2)}% ({RANGE_LABEL[selectedRange]})
          </span>
        </div>
      </div>

      <div className="w-full h-60">
        {loading ? (
          <div className="w-full h-60 rounded-lg bg-[linear-gradient(110deg,var(--backgroundHover)_30%,var(--glassBgHover)_50%,var(--backgroundHover)_70%)] bg-[length:200%_100%] animate-shimmer" />
        ) : data.length === 0 ? (
          <div className="w-full h-60 flex items-center justify-center text-[13px] text-[var(--textSecondary)]">
            No price data available for this range yet.
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="w-full h-60 rounded-lg bg-[linear-gradient(110deg,var(--backgroundHover)_30%,var(--glassBgHover)_50%,var(--backgroundHover)_70%)] bg-[length:200%_100%] animate-shimmer" />
            }
          >
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

      <div className="flex gap-1 mt-4 justify-center">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            className={cx(
              'px-3 py-1.5 rounded-lg border border-[var(--glassBorder)] bg-transparent text-[var(--textSecondary)] text-xs font-semibold cursor-pointer transition-all duration-[0.15s] ease-out',
              'hover:text-[var(--color)] hover:border-[var(--glassBorderStrong)] hover:bg-[var(--backgroundHover)]',
              selectedRange === range &&
                'text-[#6366f1] border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.12)] hover:text-[#818cf8] hover:border-[rgba(99,102,241,0.5)] hover:bg-[rgba(99,102,241,0.18)]',
            )}
            onClick={() => setSelectedRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--glassBorder)] max-[480px]:grid-cols-2">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[10px] text-[var(--textSecondary)] uppercase tracking-[0.06em]">
            {RANGE_LABEL[selectedRange]} High
          </span>
          <span className="text-[13px] font-semibold text-[var(--color)]">
            {formatPrice(periodHigh)}
          </span>
        </div>
        <div className="flex flex-col gap-[2px]">
          <span className="text-[10px] text-[var(--textSecondary)] uppercase tracking-[0.06em]">
            {RANGE_LABEL[selectedRange]} Low
          </span>
          <span className="text-[13px] font-semibold text-[var(--color)]">
            {formatPrice(periodLow)}
          </span>
        </div>
        <div className="flex flex-col gap-[2px]">
          <span className="text-[10px] text-[var(--textSecondary)] uppercase tracking-[0.06em]">
            {RANGE_LABEL[selectedRange]} Vol
          </span>
          <span className="text-[13px] font-semibold text-[var(--color)]">
            {formatVolume(periodVol)}
          </span>
        </div>
        {poolStats && (
          <>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[10px] text-[var(--textSecondary)] uppercase tracking-[0.06em]">
                Liquidity
              </span>
              <span className="text-[13px] font-semibold text-[var(--color)]">
                {formatVolume(poolStats.liquidity)}
              </span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[10px] text-[var(--textSecondary)] uppercase tracking-[0.06em]">
                Buys (24h)
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: '#34d399' }}
              >
                {poolStats.txns24h.buys}
              </span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[10px] text-[var(--textSecondary)] uppercase tracking-[0.06em]">
                Sells (24h)
              </span>
              <span
                className="text-[13px] font-semibold"
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
