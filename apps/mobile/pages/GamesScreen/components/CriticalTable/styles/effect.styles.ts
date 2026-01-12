import { StyleSheet, type ViewStyle } from 'react-native';
import type { StyleThemeContext } from './theme';

/**
 * Action effect overlay styles.
 */
export function createEffectStyles(ctx: StyleThemeContext) {
  const {
    isLight,
    shadow,
    roomGlow,
    decorCheck,
    decorPlay,
    heroGlowSecondary,
    destructiveBg,
    primaryTextColor,
  } = ctx;

  return StyleSheet.create({
    effectOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 6,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    effectCircle: {
      width: 110,
      height: 110,
      borderRadius: 64,
      backgroundColor: 'transparent',
      shadowColor: shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isLight ? 0.18 : 0.32,
      shadowRadius: 14,
      elevation: 6,
    },
    effectCircleDefault: {
      backgroundColor: roomGlow,
    },
    effectCircleDraw: {
      backgroundColor: `${decorCheck}33`,
    },
    effectCircleAttack: {
      backgroundColor: `${destructiveBg}cc`,
    },
    effectCircleSkip: {
      backgroundColor: `${decorPlay}33`,
    },
    effectCircleCombo: {
      backgroundColor: `${heroGlowSecondary}33`,
    },
    effectIconWrap: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    effectIcon: {
      color: primaryTextColor,
    },
  });
}

export type EffectStyles = ReturnType<typeof createEffectStyles>;
