'use client';

import { styled, YStack, XStack, Text } from 'tamagui';

export const PresentationContainer = styled(YStack, {
  name: 'PresentationContainer',
  width: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
});

// SlideContent: opacity and visibility controlled via style prop at render time
export const SlideContent = styled(YStack, {
  name: 'SlideContent',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

export const ControlsOverlay = styled(YStack, {
  name: 'ControlsOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 10,
  justifyContent: 'space-between',
});

export const TopBar = styled(XStack, {
  name: 'TopBar',
  padding: '$4',
  justifyContent: 'center',
  pointerEvents: 'auto',
  width: '100%',
});

export const ProgressBar = styled(XStack, {
  name: 'ProgressBar',
  gap: '$1',
  maxWidth: 600,
  height: 4,
  alignItems: 'center',
  width: '100%',
});

export const ProgressSegment = styled(YStack, {
  name: 'ProgressSegment',
  flex: 1,
  height: '100%',
  borderRadius: 2,
  cursor: 'pointer',
  // @ts-expect-error tamagui animation token
  animation: 'fast',

  hoverStyle: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});

export const BottomBar = styled(XStack, {
  name: 'BottomBar',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$4',
  pointerEvents: 'auto',
});

export const SlideCounter = styled(Text, {
  name: 'SlideCounter',
  fontSize: '$3',
  fontWeight: '500',
  color: 'rgba(255,255,255,0.9)',
  borderRadius: 20,
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  backgroundColor: 'rgba(0,0,0,0.3)',
});

export const NavButtonContainer = styled(YStack, {
  name: 'NavButtonContainer',
  position: 'absolute',
  top: '50%',
  zIndex: 20,
  pointerEvents: 'auto',
  // @ts-expect-error tamagui animation token
  animation: 'medium',
});

export const FullscreenButtonContainer = styled(YStack, {
  name: 'FullscreenButtonContainer',
  pointerEvents: 'auto',
});
