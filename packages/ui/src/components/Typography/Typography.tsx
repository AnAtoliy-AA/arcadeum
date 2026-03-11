import { Text, styled, GetProps } from 'tamagui';

const StyledTypography = styled(Text, {
  name: 'Typography',
  color: '$color',
  fontFamily: '$body', // Explicitly use body font

  variants: {
    uiSize: {
      xs: { fontSize: 12, lineHeight: 16 },
      sm: { fontSize: 14, lineHeight: 18 },
      md: { fontSize: 16, lineHeight: 24 },
      lg: { fontSize: 18, lineHeight: 28 },
      xl: { fontSize: 20, lineHeight: 30 },
      '2xl': { fontSize: 24, lineHeight: 32 },
      '3xl': { fontSize: 32, lineHeight: 40 },
    },
    variant: {
      heading: { fontWeight: '800', letterSpacing: -0.5 },
      subheading: { fontWeight: '700', letterSpacing: -0.2 },
      body: { fontWeight: '400' },
      label: { fontWeight: '600', letterSpacing: 1 },
      caption: { fontWeight: '400', opacity: 0.6 },
    },
    gradient: {
      primary: {
        color: 'transparent',
        background: 'linear-gradient(135deg, $color 0%, $primary 100%)',
        backgroundClip: 'text',
      },
      gold: {
        color: 'transparent',
        background: '$goldGradient',
        backgroundClip: 'text',
      },
      silver: {
        color: 'transparent',
        background: '$silverGradient',
        backgroundClip: 'text',
      },
    },
    weight: {
      '400': { fontWeight: '400' },
      '500': { fontWeight: '500' },
      '600': { fontWeight: '600' },
      '700': { fontWeight: '700' },
      '800': { fontWeight: '800' },
    },
    alpha: {
      low: { opacity: 0.3 },
      medium: { opacity: 0.5 },
      high: { opacity: 0.8 },
    },
    tracking: {
      sm: { letterSpacing: 0.5 },
      md: { letterSpacing: 1 },
      lg: { letterSpacing: 2 },
      xl: { letterSpacing: 3 },
    },
    textCenter: {
      true: { textAlign: 'center' },
    },
    textRight: {
      true: { textAlign: 'right' },
    },
  } as const,

  defaultVariants: {
    uiSize: 'md',
    variant: 'body',
  },
});

export type TypographyProps = GetProps<typeof StyledTypography>;

export const Typography = StyledTypography;
