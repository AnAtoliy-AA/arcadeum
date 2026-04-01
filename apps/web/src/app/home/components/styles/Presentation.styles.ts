'use client';

import { styled, YStack } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const PresentationSection = styled(SectionContainer, {
  name: 'PresentationSection',
  alignItems: 'center',
  gap: '$8',
});

export const VideoContainer = styled(YStack, {
  name: 'VideoContainer',
  width: '100%',
  maxWidth: 1000,
  position: 'relative',
  borderRadius: 24,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '#000',
  paddingBottom: '56.25%',
});

export const VideoPlaceholder = styled(YStack, {
  name: 'VideoPlaceholder',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#000',
});

export const PlaceholderOverlay = styled(YStack, {
  name: 'PlaceholderOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  background:
    'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)' as never,
});

export const PulseRing = styled(YStack, {
  name: 'PulseRing',
  position: 'absolute',
  width: 90,
  height: 90,
  borderRadius: 999,
  borderWidth: 2.5,
  borderColor: 'rgba(255,255,255,0.5)',
  zIndex: 1,
  pointerEvents: 'none',
});

export const VideoIframe = styled(YStack, {
  name: 'VideoIframe',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderWidth: 0,
});

export const PlayButton = styled(YStack, {
  name: 'PlayButton',
  width: 90,
  height: 90,
  borderRadius: 999,
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.4)',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  position: 'absolute',
  zIndex: 2,

  hoverStyle: {
    scale: 1.15,
    backgroundColor: '$primary',
    borderColor: 'rgba(255,255,255,0.5)',
  },

  pressStyle: {
    scale: 0.95,
  },
});
