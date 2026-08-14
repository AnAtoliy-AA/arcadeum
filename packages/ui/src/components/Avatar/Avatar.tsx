'use client';

import { memo, useMemo } from 'react';
import type { ReactElement } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
};

function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export type AvatarProps = {
  name?: string;
  alt?: string;
  src?: string;
  size?: AvatarSize;
  'data-testid'?: string;
  isHost?: boolean;
  style?: React.CSSProperties;
  borderColor?: string;
  boxShadow?: string;
  borderWidth?: number;
  priority?: boolean;
};

export const Avatar = memo(function Avatar({
  name = '?',
  alt,
  src,
  size = 'md',
  'data-testid': dataTestId,
  isHost,
  style,
  borderColor,
  boxShadow,
  borderWidth,
  priority = false,
}: AvatarProps): ReactElement {
  const initials = useMemo(() => getInitials(name), [name]);
  const sizeValue = sizeMap[size];
  const fontSize = fontSizeMap[size];

  return (
    <div
      data-testid={dataTestId}
      style={{
        width: sizeValue,
        height: sizeValue,
        borderRadius: sizeValue / 2,
        backgroundColor: 'var(--primary)',
        borderWidth: borderWidth ?? 1,
        borderStyle: 'solid',
        borderColor: borderColor ?? 'var(--borderColor)',
        overflow: src ? 'visible' : 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: boxShadow ?? '0 2px 10px var(--shadowColor)',
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? name}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          style={{
            width: sizeValue,
            height: sizeValue,
            objectFit: 'contain',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span
          style={{
            color: '#f5f7ff',
            fontWeight: 700,
            fontSize,
          }}
        >
          {initials}
        </span>
      )}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          background: 'linear-gradient(135deg, var(--glassBorder) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
});
