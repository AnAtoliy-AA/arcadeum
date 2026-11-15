'use client';

import { memo, useId } from 'react';
import type { CatId } from '../types';
import { CAT_PROFILES } from './catData';

export interface RealisticCatProps {
  catId: CatId;
  size?: number;
  className?: string;
  showGlow?: boolean;
  variant?: 'circle' | 'card';
}

export const RealisticCat = memo(function RealisticCat({
  catId,
  size = 40,
  className,
  showGlow = false,
  variant = 'circle',
}: RealisticCatProps) {
  const profile = CAT_PROFILES[catId] ?? CAT_PROFILES.neon;
  const reactId = useId().replace(/:/g, '');
  const clipId = `cat-clip-${catId}-${variant}-${reactId}`;

  const isCard = variant === 'card';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <clipPath id={clipId}>
          {isCard ? (
            <rect x="2" y="2" width="96" height="96" rx="20" />
          ) : (
            <circle cx="50" cy="50" r="46" />
          )}
        </clipPath>
        <radialGradient id={`glow-${clipId}`} cx="50%" cy="50%" r="50%">
          <stop offset="65%" stopColor={profile.accentGlow} stopOpacity="0" />
          <stop
            offset="100%"
            stopColor={profile.accentGlow}
            stopOpacity="0.45"
          />
        </radialGradient>
      </defs>

      {showGlow &&
        (isCard ? (
          <rect
            x="1"
            y="1"
            width="98"
            height="98"
            rx="21"
            fill="none"
            stroke={profile.accentGlow}
            strokeWidth="3.5"
            opacity="0.85"
          />
        ) : (
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={profile.accentGlow}
            strokeWidth="3.5"
            opacity="0.85"
          />
        ))}

      {isCard ? (
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="20"
          fill={profile.coatBase}
        />
      ) : (
        <circle cx="50" cy="50" r="46" fill={profile.coatBase} />
      )}

      <image
        href={profile.imageSrc}
        x="0"
        y="0"
        width="100"
        height="100"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />

      {isCard ? (
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="20"
          fill={`url(#glow-${clipId})`}
        />
      ) : (
        <circle cx="50" cy="50" r="46" fill={`url(#glow-${clipId})`} />
      )}

      {isCard ? (
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="19"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.25"
        />
      ) : (
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.25"
        />
      )}

      {isCard ? (
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="20"
          fill="none"
          stroke={profile.accentGlow}
          strokeWidth="2.5"
          opacity="0.9"
        />
      ) : (
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={profile.accentGlow}
          strokeWidth="2.5"
          opacity="0.9"
        />
      )}
    </svg>
  );
});
