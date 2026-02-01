import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';

export const getBackgroundStyles = (palette: Palette) => {
  const {
    isLight,
    gameRoom: { backgroundGlow, decorPlay, decorCheck, backgroundGradient },
  } = palette;
  const fill = StyleSheet.absoluteFillObject;

  return {
    backgroundDecor: {
      ...fill,
      zIndex: 0,
    },
    backgroundGradientLayer: {
      ...fill,
      opacity: isLight ? 0.9 : 0.75,
    },
    backgroundGlowLayer: {
      position: 'absolute',
      top: -120,
      right: -80,
      width: 280,
      height: 280,
      borderRadius: 160,
      backgroundColor: backgroundGlow,
    },
    backgroundSparkTop: {
      position: 'absolute',
      top: 140,
      left: -40,
      width: 220,
      height: 220,
      borderRadius: 160,
      backgroundColor: `${decorPlay}1a`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}4d`,
      transform: [{ rotate: '-22deg' }],
    },
    backgroundSparkBottom: {
      position: 'absolute',
      bottom: -80,
      right: -60,
      width: 240,
      height: 240,
      borderRadius: 160,
      backgroundColor: `${decorCheck}12`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}4d`,
      transform: [{ rotate: '18deg' }],
    },
    backgroundGradientSwatchA: {
      backgroundColor: backgroundGradient[0],
    },
    backgroundGradientSwatchB: {
      backgroundColor: backgroundGradient[1],
    },
    backgroundGradientSwatchC: {
      backgroundColor: backgroundGradient[2],
    },
  };
};
