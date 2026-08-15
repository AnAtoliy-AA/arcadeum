'use client';

import type { ComponentProps } from 'react';
import { cx } from '../../utils/cx';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ContainerProps = {
  size?: ContainerSize;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: unknown) => void;
  // ─── legacy Tamagui-compat props (mapped to style) ───
  flex?: number | string;
  jc?: string;
  ai?: string;
  p?: string | number;
  pb?: string | number;
  pt?: string | number;
  maxWidth?: number | string;
  gap?: number | string;
  paddingTop?: string | number;
  paddingBottom?: string | number;
} & React.HTMLAttributes<HTMLDivElement>;

const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-[600px]',
  md: 'max-w-[800px]',
  lg: 'max-w-[1000px]',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
};

export function Container({
  size = 'lg',
  className,
  onPress,
  onClick,
  flex,
  jc,
  ai,
  p,
  pb,
  pt,
  maxWidth,
  gap,
  paddingTop,
  paddingBottom,
  style,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cx('mx-auto w-full gap-4', sizeClasses[size], className)}
      style={{
        ...(flex !== undefined ? { flex } : null),
        ...(jc ? { justifyContent: jc as React.CSSProperties['justifyContent'] } : null),
        ...(ai ? { alignItems: ai as React.CSSProperties['alignItems'] } : null),
        ...(p !== undefined ? { padding: p } : null),
        ...(pb !== undefined ? { paddingBottom: pb } : null),
        ...(pt !== undefined ? { paddingTop: pt } : null),
        ...(maxWidth !== undefined ? { maxWidth } : null),
        ...(gap !== undefined ? { gap } : null),
        ...(paddingTop !== undefined ? { paddingTop } : null),
        ...(paddingBottom !== undefined ? { paddingBottom } : null),
        ...style,
      }}
      onClick={(e) => {
        onClick?.(e);
        onPress?.();
      }}
      {...(rest as React.HTMLAttributes<HTMLDivElement>)}
    />
  );
}
