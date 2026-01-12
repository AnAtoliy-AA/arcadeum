import { StyleSheet } from 'react-native';
import type { StyleThemeContext } from './theme';
import type { ShadowPresets } from './shadows';

/**
 * Card container styles.
 */
export function createCardStyles(
  ctx: StyleThemeContext,
  shadows: ShadowPresets,
) {
  const {
    surface,
    cardBorder,
    heroGlowPrimary,
    heroGlowSecondary,
    decorPlay,
    decorAlert,
  } = ctx;
  const { cardShadow, noShadow } = shadows;

  return StyleSheet.create({
    card: {
      ...cardShadow,
      borderRadius: 28,
      backgroundColor: surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: cardBorder,
      position: 'relative',
      overflow: 'hidden',
    },
    cardFullScreen: {
      ...noShadow,
      flex: 1,
      borderRadius: 28,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: cardBorder,
      backgroundColor: surface,
    },
    cardScroll: {
      width: '100%',
      flexGrow: 0,
      flexShrink: 0,
    },
    cardScrollContent: {
      paddingBottom: 32,
    },
    fullScreenScroll: {
      flexGrow: 1,
    },
    fullScreenInner: {
      gap: 24,
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingBottom: 40,
    },
    cardBackdrop: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    cardGradientLayer: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.85,
    },
    cardGlowPrimary: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 180,
      backgroundColor: `${heroGlowPrimary}33`,
      top: -140,
      right: -100,
    },
    cardGlowSecondary: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 160,
      backgroundColor: `${heroGlowSecondary}29`,
      bottom: -140,
      left: -120,
    },
    cardAccentTop: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 140,
      top: -80,
      left: -70,
      backgroundColor: `${decorPlay}20`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}60`,
    },
    cardAccentBottom: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 150,
      bottom: -90,
      right: -60,
      backgroundColor: `${decorAlert}1f`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorAlert}55`,
    },
    cardGradientSwatchA: {
      backgroundColor: `${heroGlowSecondary}29`,
    },
    cardGradientSwatchB: {
      backgroundColor: surface,
    },
    cardGradientSwatchC: {
      backgroundColor: `${heroGlowPrimary}2f`,
    },
  });
}

export type CardStyles = ReturnType<typeof createCardStyles>;
