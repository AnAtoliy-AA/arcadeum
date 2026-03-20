'use client';

import { styled, YStack, XStack, Text, H1 } from 'tamagui';

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
  maxWidth: 500,
  height: 400,
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  perspective: 1000,

  $gtMd: {
    display: 'flex',
  },
});

export const CardStack = styled(YStack, {
  name: 'CardStack',
  position: 'relative',
  width: 240,
  height: 340,
});

// HeroCard is a plain styled YStack — per-card transforms applied via style prop at render time
export const HeroCard = styled(YStack, {
  name: 'HeroCard',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 18,
  backgroundColor: '$glassBg',
  borderWidth: 4,
  borderColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '$5',
  overflow: 'hidden',
  transition: 'all 0.5s ease' as any,

  hoverStyle: {
    scale: 1.05,
    zIndex: 10,
  },
});

export const Kicker = styled(Text, {
  name: 'Kicker',
  fontSize: '$3',
  fontWeight: '700',
  letterSpacing: 3,
  textTransform: 'uppercase',
  color: 'white',
  borderRadius: 999,
  paddingHorizontal: '$5',
  paddingVertical: '$2',
  marginBottom: '$2',
  display: 'inline-block' as any,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
});

export const HeroTitle = styled(H1, {
  name: 'HeroTitle',
  margin: 0,
  fontWeight: '800',
  lineHeight: 1.1 as any,
});

export const Tagline = styled(Text, {
  name: 'Tagline',
  margin: 0,
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

export const HeroDescription = styled(Text, {
  name: 'HeroDescription',
  margin: 0,
  maxWidth: 500,
  fontSize: '$4',
  lineHeight: '$5' as any,
  color: '$color',
  opacity: 0.7,
});

export const HeroActions = styled(XStack, {
  name: 'HeroActions',
  marginTop: '$4',
  flexWrap: 'wrap',
  gap: '$4',
  justifyContent: 'center',

  $gtMd: {
    justifyContent: 'flex-start',
  },
});
