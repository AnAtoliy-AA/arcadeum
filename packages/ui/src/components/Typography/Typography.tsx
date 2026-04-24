'use client';
import { Text, styled, GetProps } from 'tamagui';
import './Typography.css';

const StyledTypography = styled(Text, {
  name: 'Typography',
  color: '$color',
  fontFamily: '$body',

  variants: {
    uiSize: {
      xs: { className: 'typography-size-xs' },
      sm: { className: 'typography-size-sm' },
      md: { className: 'typography-size-md' },
      lg: { className: 'typography-size-lg' },
      xl: { className: 'typography-size-xl' },
      '2xl': { className: 'typography-size-2xl' },
      '3xl': { className: 'typography-size-3xl' },
    },
    variant: {
      heading: { className: 'typography-variant-heading' },
      subheading: { className: 'typography-variant-subheading' },
      body: { className: 'typography-variant-body' },
      label: { className: 'typography-variant-label' },
      caption: { className: 'typography-variant-caption' },
    },
    gradient: {
      primary: { className: 'typography-gradient-primary' },
      gold: { className: 'typography-gradient-gold' },
      silver: { className: 'typography-gradient-silver' },
    },
    weight: {
      '400': { className: 'typography-weight-400' },
      '500': { className: 'typography-weight-500' },
      '600': { className: 'typography-weight-600' },
      '700': { className: 'typography-weight-700' },
      '800': { className: 'typography-weight-800' },
    },
    alpha: {
      low: { opacity: 0.65 },
      medium: { opacity: 0.8 },
      high: { opacity: 0.95 },
    },
    tracking: {
      sm: { letterSpacing: 0.5 },
      md: { letterSpacing: 1 },
      lg: { letterSpacing: 2 },
      xl: { letterSpacing: 3 },
    },
    textCenter: {
      true: { className: 'typography-text-center' },
    },
    textRight: {
      true: { className: 'typography-text-right' },
    },
  } as const,

  defaultVariants: {
    uiSize: 'md',
    variant: 'body',
  },
});

import { filterProps } from '../../utils/filterProps';

export type TypographyProps = GetProps<typeof StyledTypography> & {
  title?: string;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: unknown) => void;
};

export const Typography = StyledTypography.styleable<TypographyProps>(({ onPress, onClick, ...props }, ref) => {
  const filteredProps = filterProps({ ...props, onPress, onClick });

  return (
    <StyledTypography 
      {...filteredProps} 
      ref={ref} 
    />
  );
});
