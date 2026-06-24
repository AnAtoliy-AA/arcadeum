import {
  getTheme,
  type CascadeThemeTokens,
} from '@/widgets/CascadeGame/lib/theme';
import type { CascadeVariant } from '@/widgets/CascadeGame/types';
import type { CascadeThemeMeta } from '../data/themes';

interface Props {
  theme: CascadeThemeMeta;
  size?: 'sm' | 'lg';
}

interface FanCard {
  color: keyof CascadeThemeTokens['palette'];
  label: string;
}

// Fixed three-card fan snapshot — gives the picker thumbnail and rail preview a
// recognisable Cascade silhouette without having to ship per-variant assets.
const FAN: FanCard[] = [
  { color: 'R', label: '7' },
  { color: 'Y', label: '+2' },
  { color: 'G', label: '↻' },
];

export function CascadeBoardPoster({ theme, size = 'sm' }: Props) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;

  const tokens = getTheme(theme.id as CascadeVariant);

  const cardW = big ? 84 : 48;
  const cardH = big ? 120 : 70;
  const baseY = h / 2 - cardH / 2 + (big ? 12 : 4);
  const spread = big ? 24 : 12;
  const cx = w / 2;

  const gradientId = `csc-bg-${theme.id}`;
  const stops = Array.from(
    tokens.background.matchAll(/#[0-9a-fA-F]{3,8}/g),
  ).map((m) => m[0]);
  const from = stops[0] ?? '#000';
  const to = stops[stops.length - 1] ?? from;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      role="img"
      aria-label={`${theme.name} Cascade preview`}
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill={`url(#${gradientId})`} />

      {FAN.map((card, i) => {
        const idx = i - (FAN.length - 1) / 2;
        const x = cx + idx * (cardW * 0.7) - cardW / 2;
        const y = baseY + Math.abs(idx) * (big ? 6 : 3);
        const angle = idx * spread;
        return (
          <g
            key={card.color + i}
            transform={`rotate(${angle} ${x + cardW / 2} ${y + cardH})`}
          >
            <rect
              x={x}
              y={y}
              width={cardW}
              height={cardH}
              rx={cardW * 0.14}
              fill={tokens.palette[card.color]}
              stroke={tokens.cardBorder}
              strokeWidth={2}
            />
            <text
              x={x + cardW / 2}
              y={y + cardH / 2 + (big ? 12 : 6)}
              fontSize={big ? 38 : 22}
              fontWeight={800}
              fill={tokens.cardText}
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              {card.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
