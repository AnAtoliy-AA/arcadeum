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
  group: true,
  ...floatAnimation,
});

const quickAnimation = { animation: 'quick' };

import { StyledGlassCard } from '@arcadeum/ui';

export const HeroCard = styled(StyledGlassCard, {
  name: 'HeroCard',
  borderWidth: 2,
  borderRadius: 20,
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  backdropFilter: 'blur(8px)',
  ...quickAnimation,

  // When ANY card in the stack is hovered, apply this to all cards
  '$group-hover': {
    filter: 'blur(2px)',
    scale: 0.98,
  },

  // When THIS specific card is hovered, override the group hover
  hoverStyle: {
    opacity: 1,
    zIndex: 20,
    marginTop: -15, // Use marginTop for additive displacement to avoid conflict with 'y' prop
    borderColor: '$glassBorderHover',
  },
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
  lineHeight: '$tight',
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
