import { GAME_VARIANT } from '../../../lib/constants';
import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';
import { cyberpunkVariantStyles } from './cyberpunk';
import { underwaterVariantStyles } from './underwater';
import { highAltitudeHikeVariantStyles } from './high-altitude-hike';
import { crimeFullVariantStyles } from './crime';
import { horrorFullVariantStyles } from './horror';
import { adventureFullVariantStyles } from './adventure';

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
    case GAME_VARIANT.CRIME:
      return {
        ...baseVariantStyles,
        ...crimeFullVariantStyles,
      };
    case GAME_VARIANT.HORROR:
      return {
        ...baseVariantStyles,
        ...horrorFullVariantStyles,
      };
    case GAME_VARIANT.ADVENTURE:
      return {
        ...baseVariantStyles,
        ...adventureFullVariantStyles,
      };
    default:
      return baseVariantStyles;
  }
};
