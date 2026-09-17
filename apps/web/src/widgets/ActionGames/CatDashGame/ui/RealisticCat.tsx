import { memo } from 'react';
import type { CatId } from '../types';
import { CAT_PROFILES } from './catData';

export interface RealisticCatProps {
  catId: CatId;
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export const RealisticCat = memo(function RealisticCat({
  catId,
  size = 40,
  className,
  showGlow = false,
}: RealisticCatProps) {
  const profile = CAT_PROFILES[catId] ?? CAT_PROFILES.neon;
  const gradientId = `cat-grad-${catId}-${size}`;
  const eyeGradId = `cat-eye-grad-${catId}-${size}`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={profile.coatHighlight} />
          <stop offset="60%" stopColor={profile.coatBase} />
          <stop offset="100%" stopColor={profile.coatShade} />
        </radialGradient>
        <linearGradient id={eyeGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={profile.eyeSecondary} />
          <stop offset="100%" stopColor={profile.eyePrimary} />
        </linearGradient>
      </defs>

      {showGlow && (
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke={profile.accentGlow}
          strokeWidth="3"
          opacity="0.6"
        />
      )}

      <path
        d="M 22 46 L 8 10 C 14 14 26 24 38 30 Z"
        fill={profile.earOuter}
        stroke={profile.coatShade}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M 22 40 L 12 16 C 18 20 28 27 34 32 Z" fill={profile.earInner} />
      <path
        d="M 18 34 Q 24 30 20 22 M 22 36 Q 28 32 25 25"
        fill="none"
        stroke={profile.earTuft}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M 78 46 L 92 10 C 86 14 74 24 62 30 Z"
        fill={profile.earOuter}
        stroke={profile.coatShade}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M 78 40 L 88 16 C 82 20 72 27 66 32 Z" fill={profile.earInner} />
      <path
        d="M 82 34 Q 76 30 80 22 M 78 36 Q 72 32 75 25"
        fill="none"
        stroke={profile.earTuft}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <ellipse
        cx="50"
        cy="56"
        rx="36"
        ry="33"
        fill={`url(#${gradientId})`}
        stroke={profile.coatShade}
        strokeWidth="1.5"
      />

      <path
        d="M 14 54 L 8 58 L 15 62"
        fill={profile.coatHighlight}
        stroke={profile.coatShade}
        strokeWidth="1"
      />
      <path
        d="M 86 54 L 92 58 L 85 62"
        fill={profile.coatHighlight}
        stroke={profile.coatShade}
        strokeWidth="1"
      />

      {catId === 'whiskers' && (
        <g stroke="#78350f" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <path d="M 44 26 L 47 34 L 50 28 L 53 34 L 56 26" fill="none" />
          <path d="M 50 34 L 50 40" />
          <path d="M 28 42 L 36 44" />
          <path d="M 26 48 L 34 49" />
          <path d="M 72 42 L 64 44" />
          <path d="M 74 48 L 66 49" />
        </g>
      )}

      {catId === 'neon' && (
        <g stroke={profile.accentGlow} strokeWidth="1.75" strokeLinecap="round">
          <path d="M 50 24 L 50 36 M 44 28 L 44 34 M 56 28 L 56 34" />
          <circle cx="50" cy="22" r="1.5" fill={profile.accentGlow} />
          <path d="M 26 44 L 34 46 M 74 44 L 66 46" opacity="0.8" />
        </g>
      )}

      {catId === 'stardust' && (
        <g fill="#fef08a" opacity="0.85">
          <polygon points="50,23 52,28 57,28 53,32 55,37 50,34 45,37 47,32 43,28 48,28" />
          <circle cx="40" cy="30" r="1.2" />
          <circle cx="60" cy="30" r="1.2" />
          <circle cx="50" cy="40" r="1.2" />
        </g>
      )}

      {catId === 'felix' && (
        <path
          d="M 50 32 L 44 46 C 42 54 40 60 38 66 C 44 68 56 68 62 66 C 60 60 58 54 56 46 Z"
          fill="#ffffff"
        />
      )}

      {catId === 'luna' && (
        <ellipse cx="50" cy="60" rx="22" ry="18" fill="#475569" opacity="0.9" />
      )}

      {catId === 'shadow' && (
        <g stroke="#27272a" strokeWidth="2" strokeLinecap="round" opacity="0.6">
          <path d="M 46 30 L 50 36 L 54 30" fill="none" />
          <path d="M 50 36 L 50 42" />
        </g>
      )}

      <g>
        <ellipse
          cx="35"
          cy="50"
          rx="8"
          ry="9.5"
          fill="#0f172a"
          transform="rotate(6 35 50)"
        />
        <ellipse
          cx="35"
          cy="50"
          rx="6.5"
          ry="8"
          fill={`url(#${eyeGradId})`}
          transform="rotate(6 35 50)"
        />
        <ellipse
          cx="35"
          cy="50"
          rx="2.2"
          ry="7"
          fill={profile.eyePupil}
          transform="rotate(4 35 50)"
        />
        <circle cx="33.5" cy="47" r="1.8" fill="#ffffff" />
        <circle cx="37" cy="52" r="1" fill="#ffffff" opacity="0.75" />
      </g>

      <g>
        <ellipse
          cx="65"
          cy="50"
          rx="8"
          ry="9.5"
          fill="#0f172a"
          transform="rotate(-6 65 50)"
        />
        <ellipse
          cx="65"
          cy="50"
          rx="6.5"
          ry="8"
          fill={`url(#${eyeGradId})`}
          transform="rotate(-6 65 50)"
        />
        <ellipse
          cx="65"
          cy="50"
          rx="2.2"
          ry="7"
          fill={profile.eyePupil}
          transform="rotate(-4 65 50)"
        />
        <circle cx="63.5" cy="47" r="1.8" fill="#ffffff" />
        <circle cx="67" cy="52" r="1" fill="#ffffff" opacity="0.75" />
      </g>

      <ellipse
        cx="43"
        cy="69"
        rx="10"
        ry="7.5"
        fill={profile.muzzleColor}
        stroke={profile.coatShade}
        strokeWidth="0.75"
      />
      <ellipse
        cx="57"
        cy="69"
        rx="10"
        ry="7.5"
        fill={profile.muzzleColor}
        stroke={profile.coatShade}
        strokeWidth="0.75"
      />

      <ellipse cx="50" cy="75" rx="6" ry="4" fill={profile.chinColor} />

      <polygon points="50,65 44,60 56,60" fill={profile.noseColor} />
      <path
        d="M 45 60 Q 50 59 55 60"
        stroke={profile.noseColor}
        strokeWidth="1"
        fill="none"
      />
      <line
        x1="50"
        y1="64.5"
        x2="50"
        y2="69"
        stroke="#1e293b"
        strokeWidth="1.5"
      />
      <path
        d="M 50 69 Q 45 73 40 70 M 50 69 Q 55 73 60 70"
        fill="none"
        stroke="#1e293b"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <circle cx="40" cy="67" r="0.9" fill={profile.whiskerDotColor} />
      <circle cx="43" cy="69" r="0.9" fill={profile.whiskerDotColor} />
      <circle cx="39" cy="71" r="0.9" fill={profile.whiskerDotColor} />

      <circle cx="60" cy="67" r="0.9" fill={profile.whiskerDotColor} />
      <circle cx="57" cy="69" r="0.9" fill={profile.whiskerDotColor} />
      <circle cx="61" cy="71" r="0.9" fill={profile.whiskerDotColor} />

      <g
        stroke={profile.whiskerColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      >
        <path d="M 38 67 Q 24 64 8 68" fill="none" />
        <path d="M 38 70 Q 22 72 6 78" fill="none" />
        <path d="M 38 72 Q 24 78 10 86" fill="none" />

        <path d="M 62 67 Q 76 64 92 68" fill="none" />
        <path d="M 62 70 Q 78 72 94 78" fill="none" />
        <path d="M 62 72 Q 76 78 90 86" fill="none" />
      </g>
    </svg>
  );
});
