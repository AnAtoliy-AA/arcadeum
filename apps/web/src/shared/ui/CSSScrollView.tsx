'use client';

import React, { forwardRef } from 'react';

type ScrollViewProps = {
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  bounces?: boolean;
  style?: React.CSSProperties;
  flex?: number;
  maxHeight?: number;
  width?: number | string;
  height?: number | string;
  padding?: number | string;
  gap?: number | string;
} & React.HTMLAttributes<HTMLDivElement>;

export const ScrollView = forwardRef<HTMLDivElement, ScrollViewProps>(
  function ScrollView(
    {
      children,
      className,
      horizontal,
      showsVerticalScrollIndicator = true,
      bounces: _bounces,
      style,
      flex,
      maxHeight,
      width,
      height,
      padding,
      gap,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          overflow: 'auto',
          overscrollBehavior: 'contain',
          scrollbarWidth: showsVerticalScrollIndicator ? 'auto' : 'none',
          display: horizontal ? 'flex' : 'block',
          flexDirection: horizontal ? 'row' : undefined,
          flexShrink: 0,
          ...(flex !== undefined ? { flex } : {}),
          ...(maxHeight !== undefined ? { maxHeight } : {}),
          ...(width !== undefined ? { width } : {}),
          ...(height !== undefined ? { height } : {}),
          ...(padding !== undefined ? { padding } : {}),
          ...(gap !== undefined ? { gap } : {}),
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
