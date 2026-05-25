import type { CriticalTheme } from '../data/themes';

interface Props {
  theme: CriticalTheme;
  size?: 'sm' | 'lg';
}

// Render a Critical-style card stack with one featured "System Overload" card.
// Used in the theme grid (sm) and the preview rail (lg).
export function CriticalCardPoster({ theme, size = 'sm' }: Props) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;
  const featuredW = big ? 128 : 84;
  const featuredH = big ? 184 : 108;
  const featuredX = (w - featuredW) / 2;
  const featuredY = big ? 60 : 18;
  const ghostW = big ? 108 : 64;
  const ghostH = big ? 156 : 92;
  const glyphSize = big ? 62 : 34;
  const cardNameSize = big ? 12 : 8;
  const effectSize = big ? 8 : 5.5;
  const tinyGlyphSize = big ? 18 : 11;

  const cardBg = `color-mix(in srgb, ${theme.color} 8%, #0a0510)`;
  const bgId = `gc-crit-bg-${theme.id}-${size}`;
  const rgId = `gc-crit-rg-${theme.id}-${size}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={theme.color} stopOpacity="0.18" />
          <stop offset="1" stopColor="#0a0510" />
        </linearGradient>
        <radialGradient id={rgId} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={theme.color} stopOpacity="0.35" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>

      <rect width={w} height={h} fill={`url(#${bgId})`} />
      <rect width={w} height={h} fill={`url(#${rgId})`} />

      {/* Left ghost card */}
      <g
        transform={`translate(${big ? 36 : 28} ${big ? 72 : 32}) rotate(-10)`}
        opacity="0.4"
      >
        <rect
          width={ghostW}
          height={ghostH}
          rx={big ? 11 : 7}
          fill={cardBg}
          stroke={theme.color}
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      </g>

      {/* Right ghost card */}
      <g
        transform={`translate(${big ? w - ghostW - 36 : 150} ${big ? 64 : 28}) rotate(9)`}
        opacity="0.4"
      >
        <rect
          width={ghostW}
          height={ghostH}
          rx={big ? 11 : 7}
          fill={cardBg}
          stroke={theme.color}
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      </g>

      {/* Featured card */}
      <g transform={`translate(${featuredX} ${featuredY}) rotate(-2)`}>
        <rect
          width={featuredW}
          height={featuredH}
          rx={big ? 14 : 9}
          fill={cardBg}
          stroke={theme.color}
          strokeWidth="1.4"
        />
        <text
          x={big ? 13 : 9}
          y={big ? 26 : 18}
          fill={theme.color}
          fontFamily="JetBrains Mono, monospace"
          fontSize={tinyGlyphSize}
          fontWeight="700"
        >
          {theme.glyph}
        </text>
        <text
          x={featuredW - (big ? 13 : 9)}
          y={featuredH - (big ? 12 : 8)}
          textAnchor="end"
          fill={theme.color}
          fontFamily="JetBrains Mono, monospace"
          fontSize={tinyGlyphSize}
          fontWeight="700"
          transform={`rotate(180 ${featuredW - (big ? 13 : 9)} ${featuredH - (big ? 12 : 8)})`}
        >
          {theme.glyph}
        </text>
        <text
          x={featuredW / 2}
          y={featuredH / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={theme.color}
          fontFamily="JetBrains Mono, monospace"
          fontSize={glyphSize}
          fontWeight="700"
        >
          {theme.glyph}
        </text>
        <text
          x={featuredW / 2}
          y={featuredH * 0.74}
          textAnchor="middle"
          fill="#f5f3ff"
          fontFamily="Space Grotesk, sans-serif"
          fontSize={cardNameSize}
          fontWeight="600"
        >
          {theme.cardName}
        </text>
        <line
          x1={featuredW * 0.17}
          y1={featuredH * 0.8}
          x2={featuredW * 0.83}
          y2={featuredH * 0.8}
          stroke={theme.color}
          strokeOpacity="0.3"
          strokeWidth="0.4"
        />
        <text
          x={featuredW / 2}
          y={featuredH * 0.89}
          textAnchor="middle"
          fill={theme.accent}
          fontFamily="JetBrains Mono, monospace"
          fontSize={effectSize}
        >
          {theme.effect}
        </text>
      </g>
    </svg>
  );
}
