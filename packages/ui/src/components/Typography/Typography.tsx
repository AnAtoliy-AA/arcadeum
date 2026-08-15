'use client';
import { forwardRef } from 'react';
import { cx } from '../../utils/cx';

function normalizeLineHeight(
  lineHeight: number | string,
): React.CSSProperties['lineHeight'] {
  // The legacy runtime treated numeric lineHeight as px (e.g. 24 → 24px). React would
  // emit a unitless value (24 → 24em), ballooning the rendered line box.
  if (typeof lineHeight === 'number') {
    return lineHeight >= 10 ? `${lineHeight}px` : lineHeight;
  }
  return lineHeight;
}

export type TypographyProps = {
  children?: React.ReactNode;
  uiSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'heading' | 'subheading' | 'body' | 'label' | 'caption';
  gradient?: 'primary' | 'gold' | 'silver';
  weight?: '400' | '500' | '600' | '700' | '800';
  alpha?: 'low' | 'medium' | 'high';
  tracking?: 'sm' | 'md' | 'lg' | 'xl';
  textCenter?: boolean;
  textRight?: boolean;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: unknown) => void;
  id?: string;
  numberOfLines?: number;
  ref?: React.Ref<HTMLElement>;
  // ─── legacy-compat props (mapped to style/className) ───
  fontWeight?: string | number;
  fontSize?: number | string;
  marginTop?: string | number;
  marginBottom?: string | number;
  margin?: string | number;
  maxWidth?: number | string;
  flex?: number | string;
  gap?: number | string;
  textAlign?: React.CSSProperties['textAlign'];
  lineHeight?: number | string;
  textDecorationLine?: string;
  width?: number | string;
  whiteSpace?: string;
  mt?: string | number;
  ellipsizeMode?: string;
  letterSpacing?: number | string;
} & React.HTMLAttributes<HTMLSpanElement>;

const uiSizeClasses: Record<NonNullable<TypographyProps['uiSize']>, string> = {
  xs: 'typography-size-xs',
  sm: 'typography-size-sm',
  md: 'typography-size-md',
  lg: 'typography-size-lg',
  xl: 'typography-size-xl',
  '2xl': 'typography-size-2xl',
  '3xl': 'typography-size-3xl',
};

const variantClasses: Record<NonNullable<TypographyProps['variant']>, string> = {
  heading: 'typography-variant-heading',
  subheading: 'typography-variant-subheading',
  body: 'typography-variant-body',
  label: 'typography-variant-label',
  caption: 'typography-variant-caption',
};

const gradientClasses: Record<NonNullable<TypographyProps['gradient']>, string> = {
  primary: 'typography-gradient-primary',
  gold: 'typography-gradient-gold',
  silver: 'typography-gradient-silver',
};

const weightClasses: Record<NonNullable<TypographyProps['weight']>, string> = {
  '400': 'typography-weight-400',
  '500': 'typography-weight-500',
  '600': 'typography-weight-600',
  '700': 'typography-weight-700',
  '800': 'typography-weight-800',
};

const alphaOpacities: Record<NonNullable<TypographyProps['alpha']>, number> = {
  low: 0.65,
  medium: 0.8,
  high: 0.95,
};

const trackingSpacings: Record<NonNullable<TypographyProps['tracking']>, number> = {
  sm: 0.5,
  md: 1,
  lg: 2,
  xl: 3,
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  function Typography(
    {
      children,
      uiSize = 'md',
      variant = 'body',
      gradient,
      weight,
      alpha,
      tracking,
      textCenter,
      textRight,
      color,
      style,
      className,
      title,
      onPress,
      onClick,
      id,
      numberOfLines,
      fontWeight,
      fontSize,
      marginTop,
      marginBottom,
      margin,
      maxWidth,
      flex,
      gap,
      textAlign,
      lineHeight,
      textDecorationLine,
      width,
      whiteSpace,
      mt,
      letterSpacing,
      ...rest
    },
    ref,
  ) {
    const spanProps = rest as React.HTMLAttributes<HTMLSpanElement>;
    const typographyStyle: React.CSSProperties = {
      ...(alpha ? { opacity: alphaOpacities[alpha] } : null),
      ...(tracking ? { letterSpacing: trackingSpacings[tracking] } : null),
      ...(color ? { color } : null),
      ...(numberOfLines
        ? {
            display: '-webkit-box',
            WebkitLineClamp: numberOfLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }
        : null),
      ...(fontWeight ? { fontWeight: fontWeight as React.CSSProperties['fontWeight'] } : null),
      ...(fontSize ? { fontSize: fontSize as React.CSSProperties['fontSize'] } : null),
      ...(marginTop !== undefined ? { marginTop } : null),
      ...(marginBottom !== undefined ? { marginBottom } : null),
      ...(margin !== undefined ? { margin } : null),
      ...(maxWidth !== undefined ? { maxWidth } : null),
      ...(flex !== undefined ? { flex } : null),
      ...(gap !== undefined ? { gap } : null),
      ...(textAlign ? { textAlign } : null),
      ...(lineHeight !== undefined
        ? { lineHeight: normalizeLineHeight(lineHeight) }
        : null),
      ...(textDecorationLine ? { textDecorationLine: textDecorationLine as React.CSSProperties['textDecorationLine'] } : null),
      ...(width !== undefined ? { width } : null),
      ...(whiteSpace ? { whiteSpace: whiteSpace as React.CSSProperties['whiteSpace'] } : null),
      ...(mt !== undefined ? { marginTop: mt } : null),
      ...(letterSpacing !== undefined
        ? { letterSpacing: letterSpacing as React.CSSProperties['letterSpacing'] }
        : null),
    };
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        id={id}
        title={title}
        className={cx(
          uiSizeClasses[uiSize],
          variantClasses[variant],
          gradient && gradientClasses[gradient],
          weight && weightClasses[weight],
          textCenter && 'typography-text-center',
          textRight && 'typography-text-right',
          className,
        )}
        style={{ ...typographyStyle, ...style }}
        onClick={(e) => {
          onClick?.(e);
          onPress?.();
        }}
        {...spanProps}
      >
        {children}
      </span>
    );
  },
);
