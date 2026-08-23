import { getGoTheme } from '@/widgets/BoardGames/GoGame/lib/theme';
import type { GoThemeMeta } from '../data/themes';

interface Props {
  theme: GoThemeMeta;
  size?: 'sm' | 'lg';
}

type Stone = 'black' | 'white';

// Fixed mid-game snapshot — a corner enclosure, star points and a running
// fight so the position is recognisably "Go" at a glance.
const STONES: Array<readonly [number, number, Stone]> = [
  [1, 2, 'black'],
  [2, 2, 'black'],
  [2, 3, 'black'],
  [1, 6, 'white'],
  [2, 6, 'white'],
  [4, 5, 'black'],
  [4, 6, 'white'],
  [5, 6, 'black'],
  [5, 2, 'white'],
  [6, 2, 'white'],
  [6, 3, 'white'],
];

const SIZE = 9;

export function GoBoardPoster({ theme, size = 'sm' }: Props) {
  const big = size === 'lg';
  // Wide aspect matching the other posters so picker (sm) and rail
  // preview (lg) slots don't show empty bars.
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;

  const tokens = getGoTheme(theme.id);

  const boardSize = Math.min(w, h) - (big ? 28 : 14);
  const boardX = (w - boardSize) / 2;
  const boardY = (h - boardSize) / 2;
  const pad = big ? 10 : 6;
  const inner = boardSize - pad * 2;
  const cell = inner / (SIZE - 1);

  const bgIsGradient = tokens.background.startsWith('linear-gradient');
  const gradientId = `go-bg-${theme.id}`;
  const bgFill = bgIsGradient ? `url(#${gradientId})` : tokens.background;
  const gradientStops = bgIsGradient
    ? Array.from(tokens.background.matchAll(/#[0-9a-fA-F]{3,8}/g)).map(
        (m) => m[0],
      )
    : [];
  const from = gradientStops[0] ?? '#000';
  const to = gradientStops[1] ?? gradientStops[0] ?? '#000';

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      role="img"
      aria-label={`${theme.name} go board preview`}
      style={{ display: 'block' }}
    >
      {bgIsGradient ? (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
      ) : null}
      <rect x={0} y={0} width={w} height={h} fill={bgFill} />

      <rect
        x={boardX}
        y={boardY}
        width={boardSize}
        height={boardSize}
        rx={big ? 12 : 7}
        fill={tokens.boardBackground}
        stroke={tokens.gridLine}
        strokeWidth={big ? 2 : 1}
      />

      {/* Grid lines */}
      {Array.from({ length: SIZE }).map((_, i) => {
        const p = pad + i * cell;
        return (
          <g
            key={`l-${i}`}
            stroke={tokens.gridLine}
            strokeWidth={big ? 1.4 : 0.9}
          >
            <line x1={boardX + pad + p} y1={boardY + pad} x2={boardX + pad + p} y2={boardY + pad + inner} />
            <line x1={boardX + pad} y1={boardY + pad + p} x2={boardX + pad + inner} y2={boardY + pad + p} />
          </g>
        );
      })}

      {/* Star points */}
      {[
        [2, 2],
        [2, 6],
        [4, 4],
        [6, 2],
        [6, 6],
      ].map(([r, c]) => (
        <circle
          key={`s-${r}-${c}`}
          cx={boardX + pad + c * cell}
          cy={boardY + pad + r * cell}
          r={big ? 3 : 2}
          fill={tokens.gridLine}
        />
      ))}

      {/* Stones */}
      {STONES.map(([r, c, color]) => {
        const cx = boardX + pad + c * cell;
        const cy = boardY + pad + r * cell;
        const radius = cell * 0.46;
        return (
          <g key={`${r}-${c}`}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill={color === 'black' ? tokens.blackStone : tokens.whiteStone}
              stroke={tokens.stoneBorder}
              strokeWidth={big ? 1.4 : 0.8}
            />
            <circle
              cx={cx - radius * 0.3}
              cy={cy - radius * 0.35}
              r={radius * 0.22}
              fill={color === 'black' ? '#ffffff40' : '#00000018'}
            />
          </g>
        );
      })}
    </svg>
  );
}
