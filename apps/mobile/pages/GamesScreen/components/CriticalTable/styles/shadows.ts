import { Platform, type TextStyle } from 'react-native';
import { platformShadow } from '@/lib/platformShadow';
import type { StyleThemeContext } from './theme';

/**
 * Shadow presets for the CriticalTable component.
 */
export function createShadows(ctx: StyleThemeContext) {
  const { shadow, overlayShadow, isLight } = ctx;

  const cardShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 1 : 0.6,
    radius: 12,
  });

  const tableRingShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.25 : 0.45,
    radius: 18,
    offset: { width: 0, height: 6 },
    elevation: 4,
  });

  const tableStatShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.25 : 0.45,
    radius: 12,
    offset: { width: 0, height: 4 },
    elevation: 3,
  });

  const handCardShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.12 : 0.25,
    radius: 4,
    offset: { width: 0, height: 2 },
    elevation: 2,
  });

  const handCardPlayableShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.18 : 0.35,
    radius: 6,
    offset: { width: 0, height: 2 },
    elevation: 2,
  });

  const handCardOverlayShadow = platformShadow({
    color: overlayShadow,
    opacity: isLight ? 0.9 : 0.8,
    radius: 12,
    offset: { width: 0, height: 8 },
  });

  const comboModalShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.4 : 0.8,
    radius: 10,
    offset: { width: 0, height: 6 },
    elevation: 3,
  });

  const handCardCountBadgeShadow = platformShadow({
    color: shadow,
    opacity: 0.6,
    radius: 4,
    offset: { width: 0, height: 2 },
    elevation: 3,
  });

  const noShadow = platformShadow({
    color: shadow,
    opacity: 0,
    radius: 0,
    offset: { width: 0, height: 0 },
    elevation: 0,
  });

  const handCardTitleShadow: TextStyle =
    Platform.OS === 'web'
      ? {}
      : {
          textShadowColor: 'rgba(15, 23, 42, 0.55)',
          textShadowOffset: { width: 0, height: 4 },
          textShadowRadius: 8,
        };

  const handCardDescriptionShadow: TextStyle =
    Platform.OS === 'web'
      ? {}
      : {
          textShadowColor: 'rgba(15, 23, 42, 0.45)',
          textShadowOffset: { width: 0, height: 3 },
          textShadowRadius: 6,
        };

  return {
    cardShadow,
    tableRingShadow,
    tableStatShadow,
    handCardShadow,
    handCardPlayableShadow,
    handCardOverlayShadow,
    comboModalShadow,
    handCardCountBadgeShadow,
    noShadow,
    handCardTitleShadow,
    handCardDescriptionShadow,
  };
}

export type ShadowPresets = ReturnType<typeof createShadows>;
