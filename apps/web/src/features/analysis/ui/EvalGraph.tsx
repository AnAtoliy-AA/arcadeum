'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';

interface EvalGraphProps {
  /** White-perspective evaluation in centipawns after each ply. */
  evals: number[];
  /** Ply to highlight as the turning point, if any. */
  turningPointPly: number | null;
  /** Label for the evaluation unit, e.g. "cp". */
  unitLabel: string;
  /** Localized side labels used in the tooltip. */
  whiteLabel: string;
  blackLabel: string;
  /** Accessible name for the chart. */
  ariaLabel: string;
}

interface EvalPoint {
  ply: number;
  value: number;
  rawValue: number;
}

function formatEval(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function EvalTooltip({
  active,
  payload,
  unitLabel,
  whiteLabel,
  blackLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload: EvalPoint }>;
  unitLabel: string;
  whiteLabel: string;
  blackLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const moveNumber = Math.floor(point.ply / 2) + 1;
  const side = point.ply % 2 === 0 ? whiteLabel : blackLabel;

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(10,14,22,0.95)] px-3 py-2 text-[12px] shadow-lg">
      <div className="font-semibold text-[rgba(255,255,255,0.85)]">
        {moveNumber}. {side}
      </div>
      <div className={point.rawValue >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
        {formatEval(point.rawValue)} {unitLabel}
        {Math.abs(point.rawValue) >= 500 && (
          <span className="text-[9px] opacity-60 ml-1">(mate)</span>
        )}
      </div>
    </div>
  );
}

export function EvalGraph({
  evals,
  turningPointPly,
  unitLabel,
  whiteLabel,
  blackLabel,
  ariaLabel,
}: EvalGraphProps) {
  const data = useMemo<EvalPoint[]>(
    () => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`[EvalGraph] received evals (first 10):`, evals.slice(0, 10));
      }
      return evals.map((value, ply) => ({
        ply,
        value: Math.max(-500, Math.min(500, value)),
        rawValue: value,
      }));
    },
    [evals],
  );

  const domain = useMemo<[number, number]>(() => {
    if (data.length === 0) return [-1, 1];
    let min = Infinity;
    let max = -Infinity;
    for (const point of data) {
      if (point.value < min) min = point.value;
      if (point.value > max) max = point.value;
    }
    const pad = Math.max(100, (max - min) * 0.2);
    return [min - pad, max + pad];
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="h-[180px] w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="analysisEvalGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="ply"
            type="number"
            domain={[0, Math.max(1, data.length - 1)]}
            tick={{ fontSize: 10, fill: '#52525b' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickCount={Math.min(6, data.length)}
            allowDecimals={false}
          />
          <YAxis
            domain={domain}
            tick={{ fontSize: 10, fill: '#52525b' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatEval(v)}
            width={48}
          />
          <Tooltip
            content={
              <EvalTooltip
                unitLabel={unitLabel}
                whiteLabel={whiteLabel}
                blackLabel={blackLabel}
              />
            }
            wrapperStyle={{ pointerEvents: 'none' }}
            cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
          />
          <ReferenceLine
            y={0}
            stroke="rgba(255,255,255,0.18)"
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#analysisEvalGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: '#6366f1',
              stroke: '#fff',
              strokeWidth: 1,
            }}
          />
          {turningPointPly != null && turningPointPly < data.length && (
            <ReferenceDot
              x={turningPointPly}
              y={data[turningPointPly].value}
              r={5}
              fill="#f59e0b"
              stroke="#fff"
              strokeWidth={1.5}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
