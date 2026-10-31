import type { CatDashThemeTokens } from '../lib/theme';

interface TrackPoint {
  x: number;
  y: number;
}

interface TrackGatesProps {
  start: TrackPoint;
  finish: TrackPoint;
  tokens: CatDashThemeTokens;
  startLabel: string;
  finishLabel: string;
  isFullscreen: boolean;
}

export function TrackGates({
  start,
  finish,
  tokens,
  startLabel,
  finishLabel,
  isFullscreen,
}: TrackGatesProps) {
  const gateWidth = isFullscreen ? 34 : 26;
  const labelSize = isFullscreen ? 11 : 8;

  return (
    <>
      <g transform={`translate(${start.x}, ${start.y})`} opacity="0.95">
        <path
          d={`M ${-gateWidth} 18 V 30 M ${gateWidth} 18 V 30 M ${-gateWidth} 24 H ${gateWidth}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        <text
          y="-28"
          textAnchor="middle"
          fill="#bbf7d0"
          fontSize={labelSize}
          fontWeight="900"
          letterSpacing="2"
        >
          {startLabel}
        </text>
      </g>

      <g transform={`translate(${finish.x}, ${finish.y})`} opacity="0.98">
        <path
          d={`M ${-gateWidth} -18 V -30 M ${gateWidth} -18 V -30 M ${-gateWidth} -24 H ${gateWidth}`}
          fill="none"
          stroke={tokens.trackBorder}
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        <g transform={`translate(${-gateWidth}, -38)`}>
          {[0, 1, 2, 3].map((index) => (
            <rect
              key={index}
              x={index * 8}
              y={index % 2 === 0 ? 0 : 6}
              width="8"
              height="6"
              fill={index % 2 === 0 ? '#f8fafc' : '#0f172a'}
              opacity="0.95"
            />
          ))}
        </g>
        <text
          y="42"
          textAnchor="middle"
          fill="#fde68a"
          fontSize={labelSize}
          fontWeight="900"
          letterSpacing="2"
        >
          {finishLabel}
        </text>
      </g>
    </>
  );
}
