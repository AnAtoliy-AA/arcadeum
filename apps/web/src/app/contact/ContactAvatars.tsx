'use client';

import type { CSSProperties } from 'react';
import { useTheme } from 'tamagui';

const palettes = [
  'linear-gradient(135deg,#5eead4,#818cf8)',
  'linear-gradient(135deg,#fbbf24,#f472b6)',
  'linear-gradient(135deg,#38bdf8,#c084fc)',
  'linear-gradient(135deg,#34d399,#22d3ee)',
  'linear-gradient(135deg,#fb7185,#f59e0b)',
];
const initials = ['AT', 'MK', 'SR', 'JL', 'ND'];

const stackStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
};

const avatarStyle = (
  size: number,
  index: number,
  borderColor: string,
): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: palettes[index % palettes.length],
  marginLeft: index === 0 ? 0 : -size / 3,
  border: `2px solid ${borderColor}`,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: Math.max(9, Math.round(size * 0.36)),
  fontWeight: 700,
  color: '#0b1018',
  letterSpacing: 0.3,
});

export type ContactAvatarsProps = {
  count?: number;
  size?: number;
  borderColor?: string;
};

type ThemeRecord = Record<string, { val?: string; get?: () => string }>;

export function ContactAvatars({
  count = 3,
  size = 24,
  borderColor,
}: ContactAvatarsProps) {
  const theme = useTheme() as unknown as ThemeRecord;
  const resolvedBorder =
    borderColor ??
    theme.background?.val ??
    theme.background?.get?.() ??
    '#06011b';
  return (
    <span style={stackStyle} aria-hidden="true" data-testid="contact-avatars">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={avatarStyle(size, i, resolvedBorder)} data-avatar>
          {initials[i % initials.length]}
        </span>
      ))}
    </span>
  );
}
