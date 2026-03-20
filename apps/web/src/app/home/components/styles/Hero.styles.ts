'use client';

import { styled, YStack, XStack, Text, H1 } from 'tamagui';
import { GlassCard } from '@/shared/ui';

export const HeroSection = styled(YStack, {
  name: 'HeroSection',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '90vh',
  padding: '$6',
  position: 'relative',
  overflow: 'hidden',
  gap: '$10',

  $gtMd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '$8',
  },
});

export const HeroBackground = styled(YStack, {
  name: 'HeroBackground',
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
  name: 'HeroContent',
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
  name: 'HeroVisual',
  position: 'relative',
  width: '100%',
  maxWidth: 540,
  height: 460,
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  perspective: 1000,

  $gtMd: {
    display: 'flex',
  },
});

const floatAnimation = { animation: 'float 6s ease-in-out infinite' };

export const CardStack = styled(YStack, {
  name: 'CardStack',
  position: 'relative',
  width: 280,
  height: 380,
  ...floatAnimation,
});

const quickAnimation = { animation: 'quick' };

export const HeroCard = styled(GlassCard, {
  name: 'HeroCard',
  position: 'absolute',
  inset: 0,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: '$glassBorderHover',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '$6',
  overflow: 'hidden',
  ...quickAnimation,
});

export const Kicker = styled(Text, {
  fontSize: '$3',
  fontWeight: '700',
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: 'white',
  borderRadius: 999,
  paddingHorizontal: '$5',
  paddingVertical: '$2',
  marginBottom: '$2',
  display: 'inline-flex',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
});

export const HeroTitle = styled(H1, {
  fontWeight: '800',
  lineHeight: '1.1' as unknown as number,
});

export const Tagline = styled(Text, {
  margin: 0,
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

export const HeroDescription = styled(Text, {
  margin: 0,
  maxWidth: 500,
  fontSize: '$4',
  lineHeight: '$5',
  color: '$color',
  opacity: 0.75,
});

export const HeroActions = styled(XStack, {
  marginTop: '$4',
  flexWrap: 'wrap',
  gap: '$4',
  justifyContent: 'center',

  $gtMd: {
    justifyContent: 'flex-start',
  },
});
