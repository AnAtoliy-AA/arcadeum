import { memo } from 'react';
import type { CatDashThemeTokens } from '../lib/theme';
import type { CatDashTheme } from '../types';

interface BoardBackgroundProps {
  variant: CatDashTheme;
  tokens: CatDashThemeTokens;
  svgW: number;
  svgH: number;
}

export const BoardBackground = memo(function BoardBackground({
  variant,
  tokens,
  svgW,
  svgH,
}: BoardBackgroundProps) {
  return (
    <>
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={`${tokens.track}aa`} />
          <stop offset="100%" stopColor={tokens.background} />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Glowing cyber grid pattern for Neon Cyber */}
        <pattern
          id="cyberGrid"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 30 0 L 0 0 0 30"
            fill="none"
            stroke={tokens.trackBorder}
            strokeWidth="0.5"
            opacity="0.1"
          />
        </pattern>

        {/* Cosmic star coordinates for Space Cats */}
        <pattern
          id="spaceStars"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="1.2" fill="#ffffff" opacity="0.25" />
          <circle cx="80" cy="35" r="1.8" fill="#ffffff" opacity="0.45" />
          <circle cx="45" cy="75" r="0.8" fill="#ffffff" opacity="0.2" />
          <circle cx="70" cy="85" r="1.4" fill="#ffffff" opacity="0.35" />
          <path
            d="M 50 15 L 52 20 L 57 20 L 53 23 L 55 28 L 50 25 L 45 28 L 47 23 L 43 20 L 48 20 Z"
            fill="#ffffff"
            opacity="0.08"
            transform="scale(0.5) translate(50, 50)"
          />
        </pattern>

        {/* Cozy cobblestone pattern for Classic Village */}
        <pattern
          id="villageTiles"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 20 Q 10 10 20 20 T 40 20 M 0 40 Q 10 30 20 40 T 40 40"
            fill="none"
            stroke={tokens.trackBorder}
            strokeWidth="0.8"
            opacity="0.08"
          />
        </pattern>

        {/* Organic leaf pattern for Nature Wild */}
        <pattern
          id="natureLeaves"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 10 20 Q 20 15 20 30 Q 20 45 10 40 Q 0 45 0 30 Q 0 15 10 20 Z"
            fill="none"
            stroke={tokens.trackBorder}
            strokeWidth="0.8"
            opacity="0.06"
            transform="scale(0.6) translate(10, 10)"
          />
          <path
            d="M 40 45 Q 50 40 50 50 Q 50 60 40 55 Q 30 60 30 50 Q 30 40 40 45 Z"
            fill="none"
            stroke={tokens.trackBorder}
            strokeWidth="0.8"
            opacity="0.06"
            transform="scale(0.6) translate(30, 20)"
          />
        </pattern>
      </defs>
      <rect width={svgW} height={svgH} fill="url(#bgGlow)" rx={20} />
      {variant === 'cyberpunk' && (
        <rect
          width={svgW}
          height={svgH}
          fill="url(#cyberGrid)"
          rx={20}
          pointerEvents="none"
        />
      )}
      {variant === 'galaxy' && (
        <rect
          width={svgW}
          height={svgH}
          fill="url(#spaceStars)"
          rx={20}
          pointerEvents="none"
        />
      )}
      {variant === 'adventure' && (
        <rect
          width={svgW}
          height={svgH}
          fill="url(#villageTiles)"
          rx={20}
          pointerEvents="none"
        />
      )}
      {variant === 'zen' && (
        <rect
          width={svgW}
          height={svgH}
          fill="url(#natureLeaves)"
          rx={20}
          pointerEvents="none"
        />
      )}
    </>
  );
});
