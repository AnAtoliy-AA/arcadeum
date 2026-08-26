'use client';
import { createElement, forwardRef } from 'react';
import { cx } from '../../utils/cx';

export type TypographyLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type TypographyProps = {
  children?: React.ReactNode;
  as?: string;
  uiSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'heading' | 'subheading' | 'body' | 'label' | 'caption';
  level?: TypographyLevel;
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
  id?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  role?: React.AriaRole;
  tabIndex?: number;
  'aria-expanded'?: boolean | 'true' | 'false';
  'aria-label'?: string;
  'data-testid'?: string;
  'data-expanded'?: boolean | string;
};

const uiSizeClasses: Record<NonNullable<TypographyProps['uiSize']>, string> = {
  xs: 'typography-size-xs',
  sm: 'typography-size-sm',
  md: 'typography-size-md',
  lg: 'typography-size-lg',
  xl: 'typography-size-xl',
  '2xl': 'typography-size-2xl',
  '3xl': 'typography-size-3xl',
};

const variantClasses: Record<
  NonNullable<TypographyProps['variant']>,
  string
> = {
  heading: 'typography-variant-heading text-[var(--color)]',
  subheading: 'typography-variant-subheading text-[var(--color)]',
  body: 'typography-variant-body text-[var(--color)]',
  label: 'typography-variant-label text-[var(--color)]',
  caption: 'typography-variant-caption text-[var(--color)]',
};

const gradientClasses: Record<
  NonNullable<TypographyProps['gradient']>,
  string
> = {
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

const trackingSpacings: Record<
  NonNullable<TypographyProps['tracking']>,
  number
> = {
  sm: 0.5,
  md: 1,
  lg: 2,
  xl: 3,
};

const headingTagByVariant: Record<
  Extract<NonNullable<TypographyProps['variant']>, 'heading' | 'subheading'>,
  'h2' | 'h3'
> = {
  heading: 'h2',
  subheading: 'h3',
};

const headingTags: Record<TypographyLevel, string> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  function Typography(
    {
      children,
      as: asTag,
      uiSize = 'md',
      variant = 'body',
      level,
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
      id,
      onClick,
      onKeyDown,
      onMouseEnter,
      onMouseLeave,
      role,
      tabIndex,
      'aria-expanded': ariaExpanded,
      'aria-label': ariaLabel,
      'data-testid': dataTestId,
      'data-expanded': dataExpanded,
    },
    ref,
  ) {
    const typographyStyle: React.CSSProperties = {
      ...(alpha ? { opacity: alphaOpacities[alpha] } : null),
      ...(tracking ? { letterSpacing: trackingSpacings[tracking] } : null),
      ...(color ? { color } : null),
    };
    const tag =
      asTag ??
      (variant === 'heading' || variant === 'subheading'
        ? level
          ? headingTags[level]
          : headingTagByVariant[variant]
        : 'span');
    return createElement(
      tag,
      {
        ref,
        id,
        title,
        onClick,
        onKeyDown,
        onMouseEnter,
        onMouseLeave,
        role,
        tabIndex,
        'aria-expanded': ariaExpanded,
        'aria-label': ariaLabel,
        'data-testid': dataTestId,
        'data-expanded': dataExpanded,
        className: cx(
          uiSizeClasses[uiSize],
          variantClasses[variant],
          gradient && gradientClasses[gradient],
          weight && weightClasses[weight],
          textCenter && 'typography-text-center',
          textRight && 'typography-text-right',
          className,
        ),
        style: { ...typographyStyle, ...style },
      },
      children,
    );
  },
);
