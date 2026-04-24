'use client';

import { styled, YStack, XStack, Text, H1 } from 'tamagui';

export const HeroSection = styled(YStack, {
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '90vh',
  padding: '$6',
  position: 'relative',
  overflow: 'visible',
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
  // Subtle theme-aware overlay for the hero section
  background:
    'radial-gradient(circle at 50% 50%, $backgroundRadialStart 0%, transparent 70%)',
  opacity: 0.6,
});

export const HeroContent = styled(YStack, {
  position: 'relative',
  zIndex: 2,
  gap: '$6',
  maxWidth: 650,
});

export const HeroVisual = styled(YStack, {
  position: 'relative',
  width: '100%',
  maxWidth: 600,
  height: 540,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,

  $md: {
    display: 'none',
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
  borderColor: 'rgba(255, 255, 255, 0.2)', // More visible border
  borderWidth: 1.5,
  borderRadius: 24,
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

export const HeroCard = styled(StyledHeroCard, {
  name: 'HeroCard',
});

export const Kicker = styled(Text, {
  name: 'Kicker',
  fontSize: '$3',
  fontWeight: '700',
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '$accent',
  borderRadius: 999,
  paddingHorizontal: '$5',
  paddingVertical: '$2',
  marginBottom: '$2',
  display: 'inline-flex',
  borderWidth: 1,
  borderColor: '$accent',
  opacity: 0.8,
  position: 'relative',
  overflow: 'hidden',
});

export const HeroTitle = styled(H1, {
  name: 'HeroTitle',
  display: 'block',
  fontSize: 100,
  fontWeight: '900',
  lineHeight: 120,
  letterSpacing: -2,
  $md: {
    fontSize: '$10',
    lineHeight: 60,
  },
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
  color: '$color',
  opacity: 0.75,
});

export const HeroActions = styled(XStack, {
  marginTop: '$4',
  flexWrap: 'wrap',
  gap: '$4',
});
