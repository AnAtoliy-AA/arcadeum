import { GAME_VARIANT } from '../../../lib/constants';
import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';
import { cyberpunkVariantStyles } from './cyberpunk';
import { underwaterVariantStyles } from './underwater';
import { highAltitudeHikeVariantStyles } from './high-altitude-hike';

export const getVariantStyles = (variant?: string): VariantStyleConfig => {
  switch (variant) {
    case GAME_VARIANT.CYBERPUNK:
      return {
        ...baseVariantStyles,
        ...cyberpunkVariantStyles,
      };
    case GAME_VARIANT.UNDERWATER:
      return {
        ...baseVariantStyles,
        ...underwaterVariantStyles,
      };
    case GAME_VARIANT.HIGH_ALTITUDE_HIKE:
      return {
        ...baseVariantStyles,
        ...highAltitudeHikeVariantStyles,
      };
    default:
      return baseVariantStyles;
  }
};
