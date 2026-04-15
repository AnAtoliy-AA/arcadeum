'use client';

import type { FC, ReactNode } from 'react';
import {
  styled,
  YStack,
  XStack,
  Text,
  H1,
  type GetThemeValueForKey,
  type GetProps,
} from 'tamagui';

export const HeroSection = styled(YStack, {
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '90vh',
  padding: '$6',
  position: 'relative',
  overflow: 'hidden',
  gap: '$10',
});

export const HeroBackground = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 0,
  overflow: 'hidden',
});

export const HeroContent = styled(YStack, {
  position: 'relative',
  zIndex: 2,
  gap: '$6',
  alignItems: 'center',
  maxWidth: 650,

  $gtMd: {
    alignItems: 'flex-start',
  },
});

export const HeroVisual = styled(YStack, {
  position: 'relative',
  width: '100%',
  maxWidth: 540,
  height: 460,
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,

  $gtMd: {
    display: 'flex',
  },
});

export const CardStack = styled(YStack, {
  position: 'relative',
  width: 280,
  height: 380,
});

const StyledHeroCard = styled(YStack, {
  name: 'HeroCard',
  backgroundColor: '$glassBg',
  borderColor: '$glassBorder',
  borderWidth: 2,
  borderRadius: 20,
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',

  hoverStyle: {
    opacity: 1,
    zIndex: 20,
    borderColor: '$glassBorderHover',
  },
});

export const HeroCard: FC<
  GetProps<typeof StyledHeroCard> & {
    children?: ReactNode;
    rotate?: string | number;
    x?: string | number;
    y?: string | number;
    scale?: number;
    opacity?: number;
    zIndex?: number;
    className?: string;
    hoverStyle?: GetProps<typeof StyledHeroCard>['hoverStyle'];
  }
> = (props) => <StyledHeroCard {...props} />;

export const Kicker = styled(Text, {
  fontSize: '$3',
  fontWeight: '700',
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '$primary',
  borderRadius: 999,
  paddingHorizontal: '$5',
  paddingVertical: '$2',
  marginBottom: '$2',
  display: 'inline-flex',
  borderWidth: 1,
  borderColor: '$primary',
  opacity: 0.8,
  animation: 'lazy', // For tamagui internal
  style: {
    animation: 'fadeInUp 0.6s ease-out 0.15s both, shimmer 3s linear infinite',
  },
} as never);

const StyledHeroTitle = styled(H1, {
  display: 'block',
  fontWeight: '$8',
  fontSize:
    'clamp(3.5rem, 8vw, 6rem)' as unknown as GetThemeValueForKey<'fontSize'>,
  lineHeight: '1.1' as unknown as GetThemeValueForKey<'lineHeight'>,
});

export const HeroTitle: FC<
  GetProps<typeof StyledHeroTitle> & {
    children?: ReactNode;
    id?: string;
    className?: string;
  }
> = (props) => <StyledHeroTitle {...props} />;

export const Tagline = styled(Text, {
  margin: 0,
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
  style: {
    animation: 'fadeInUp 0.6s ease-out 0.2s both',
  },
} as never);

export const HeroDescription = styled(Text, {
  margin: 0,
  maxWidth: 500,
  fontSize: '$4',
  color: '$color',
  opacity: 0.75,
  style: {
    animation: 'fadeInUp 0.6s ease-out 0.3s both',
  },
} as never);

export const HeroActions = styled(XStack, {
  marginTop: '$4',
  flexWrap: 'wrap',
  gap: '$4',
  justifyContent: 'center',
  style: {
    animation: 'fadeInUp 0.6s ease-out 0.4s both',
  },

  $gtMd: {
    justifyContent: 'flex-start',
  },
} as never);
