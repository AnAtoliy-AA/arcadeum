import { styled, YStack } from 'tamagui';

export const SonarRadar = styled(YStack, {
  name: 'SonarRadar',
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '150%',
  height: '150%',
  transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  borderRadius: 1000,
  pointerEvents: 'none',
  zIndex: 1,

  // Animation and conic-gradient handled via props or inline styles for web
});

export const Bubble = styled(YStack, {
  name: 'Bubble',
  position: 'absolute',
  bottom: 0,
  width: 6,
  height: 6,
  backgroundColor: 'rgba(165, 243, 252, 0.4)',
  borderRadius: 100,
  pointerEvents: 'none',
  zIndex: 0,
});

export const FishSilhouette = styled(YStack, {
  name: 'FishSilhouette',
  position: 'absolute',
  width: 12,
  height: 6,
  backgroundColor: 'rgba(34, 211, 238, 0.3)',
  pointerEvents: 'none',
  zIndex: 0,
});

export const SonarSweep = styled(YStack, {
  name: 'SonarSweep',
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '150vmax',
  height: '150vmax',
  transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  pointerEvents: 'none',
  zIndex: 0,
  borderRadius: 1000,
  overflow: 'hidden',
});

export const FloatingDots = styled(YStack, {
  name: 'FloatingDots',
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 1,
});

export const CircuitLines = styled(YStack, {
  name: 'CircuitLines',
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 0,
  opacity: 0.3,
});

export const Snowflake = styled(YStack, {
  name: 'Snowflake',
  position: 'absolute',
  top: '-10vh',
  backgroundColor: 'white',
  borderRadius: 100,
  opacity: 0.6,
  pointerEvents: 'none',
  zIndex: 1,
});

export const IceCrystal = styled(YStack, {
  name: 'IceCrystal',
  position: 'absolute',
  width: 40,
  height: 40,
  pointerEvents: 'none',
  zIndex: 5,
  opacity: 0.5,

  variants: {
    corner: {
      tl: { top: 10, left: 10, rotate: '0deg' },
      tr: { top: 10, right: 10, rotate: '90deg' },
      bl: { bottom: 10, left: 10, rotate: '-90deg' },
      br: { bottom: 10, right: 10, rotate: '180deg' },
    },
  } as const,
});
