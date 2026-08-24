import type { SpadesThemeMeta } from '../data/spades-themes';

interface Props {
  theme: SpadesThemeMeta;
  size?: 'sm' | 'lg';
}

export function SpadesBoardPoster({ theme, size = 'sm' }: Props) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;

  const cards = [
    { rank: 'A', suit: 'S', x: 0.15, y: 0.3 },
    { rank: 'K', suit: 'H', x: 0.35, y: 0.25, red: true },
    { rank: 'Q', suit: 'S', x: 0.55, y: 0.35 },
    { rank: 'J', suit: 'D', x: 0.75, y: 0.28, red: true },
    { rank: '10', suit: 'C', x: 0.45, y: 0.6 },
  ];

  const suitSymbol = (s: string) =>
    s === 'S' ? '♠' : s === 'H' ? '♥' : s === 'D' ? '♦' : '♣';

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect width={w} height={h} fill={theme.color} fillOpacity="0.15" />
      <rect width={w} height={h} fill="url(#sg-bg)" />

      {cards.map((c, i) => {
        const cx = c.x * w;
        const cy = c.y * h;
        const cw = big ? 52 : 32;
        const ch = big ? 72 : 45;
        const isRed = Boolean(c.red);
        return (
          <g key={i}>
            <rect
              x={cx - cw / 2}
              y={cy - ch / 2}
              width={cw}
              height={ch}
              rx={big ? 6 : 4}
              fill="#1e1b2e"
              stroke={isRed ? '#dc2626' : '#475569'}
              strokeWidth={big ? 2 : 1.5}
              opacity="0.9"
            />
            <text
              x={cx}
              y={cy - (big ? 6 : 4)}
              textAnchor="middle"
              fontSize={big ? 16 : 10}
              fontWeight="bold"
              fill={isRed ? '#dc2626' : '#e2e8f0'}
            >
              {c.rank}
            </text>
            <text
              x={cx}
              y={cy + (big ? 12 : 8)}
              textAnchor="middle"
              fontSize={big ? 14 : 9}
              fill={isRed ? '#dc2626' : '#94a3b8'}
            >
              {suitSymbol(c.suit)}
            </text>
          </g>
        );
      })}

      <text
        x={w / 2}
        y={h * 0.85}
        textAnchor="middle"
        fontSize={big ? 20 : 14}
        fill={theme.color}
        opacity="0.6"
      >
        ♠ ♠ ♠
      </text>
    </svg>
  );
}
