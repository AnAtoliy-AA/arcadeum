'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { CosmeticSprite } from '../CosmeticSprite';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<AvatarSize, number> = {
  sm: 36,
  md: 52,
  lg: 68,
  xl: 84,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 15,
  md: 20,
  lg: 26,
  xl: 34,
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
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const initials = useMemo(() => getInitials(name), [name]);
  const sizeValue = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const hasValidSrc =
    src &&
    src.trim() !== '' &&
    src !== 'null' &&
    src !== 'undefined' &&
    !imgError;

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
        overflow: hasValidSrc ? 'visible' : 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: boxShadow ?? '0 2px 10px var(--shadowColor)',
        ...style,
      }}
    >
      {hasValidSrc ? (
        <CosmeticSprite
          src={src}
          alt={alt ?? name}
          size={sizeValue}
          priority={priority}
          onError={() => setImgError(true)}
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
