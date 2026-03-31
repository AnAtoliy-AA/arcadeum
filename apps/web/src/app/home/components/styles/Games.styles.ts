'use client';

import { styled, YStack, XStack, Text, H3 } from 'tamagui';

export const SliderSection = styled(YStack, {
  name: 'SliderSection',
  width: '100%',
  maxWidth: 1400,
  marginHorizontal: 'auto',
  gap: '$12',
  paddingVertical: '$10',
  position: 'relative',
});

export const SliderContainer = styled(YStack, {
  name: 'SliderContainer',
  position: 'relative',
  width: '100%',
  paddingHorizontal: '$6',
});

// SliderTrack: layout via tamagui, scroll behaviour via style prop in HomeGames.tsx
export const SliderTrack = styled(XStack, {
  name: 'SliderTrack',
  gap: '$8',
});

export const SliderItem = styled(YStack, {
  name: 'SliderItem',
  flexShrink: 0,
  width: 360,
  height: 420,
});

export const SliderControls = styled(XStack, {
  name: 'SliderControls',
  justifyContent: 'center',
  gap: '$6',
  marginTop: '$4',
});

export const SliderButton = styled(YStack, {
  name: 'SliderButton',
  width: 54,
  height: 54,
  borderRadius: 999,
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$glassBorder',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',

  hoverStyle: {
    backgroundColor: '$primary',
    borderColor: 'transparent',
    scale: 1.1,
  },

  pressStyle: {
    scale: 0.95,
  },
});

import { GlassCard } from '@/shared/ui';
export const MainGameCard = styled(GlassCard, {
  name: 'MainGameCard',
});

export const MainGameInfo = styled(YStack, {
  name: 'MainGameInfo',
  flex: 1,
  gap: '$3',
  position: 'relative',
  zIndex: 2,
});

export const GameHeaderWrapper = styled(XStack, {
  name: 'GameHeaderWrapper',
  alignItems: 'center',
  gap: '$4',
});

export const StyledGameIcon = styled(Text, {
  name: 'StyledGameIcon',
  fontSize: 40,
  lineHeight: 1 as never,
});

export const GameTitle = styled(H3, {
  name: 'GameTitle',
  margin: 0,
  fontSize: '$6',
  fontWeight: '800',
  flex: 1,
  letterSpacing: -0.02 as never,
});

export const HelpIcon = styled(YStack, {
  name: 'HelpIcon',
  width: 28,
  height: 28,
  borderRadius: 999,
  backgroundColor: '$glassBorder',
  borderWidth: 1,
  borderColor: '$glassBorder',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  position: 'relative',
  zIndex: 3,

  hoverStyle: {
    backgroundColor: '$primary',
    borderColor: 'transparent',
    scale: 1.1,
  },
});

export const GameDescription = styled(Text, {
  name: 'GameDescription',
  margin: 0,
  fontSize: '$4',
  lineHeight: '$5' as never,
  color: '$color',
  opacity: 0.7,
  maxWidth: 650,
});

export const StyledGameTags = styled(XStack, {
  name: 'StyledGameTags',
  flexWrap: 'wrap',
  gap: '$2',
});

export const GameTag = styled(Text, {
  name: 'GameTag',
  fontSize: 12,
  fontWeight: '600',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: 999,
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$glassBorder',
  color: '$color',
  opacity: 0.8,
});

export const CardFooter = styled(YStack, {
  name: 'CardFooter',
  marginTop: 'auto',
  paddingTop: '$4',
});
