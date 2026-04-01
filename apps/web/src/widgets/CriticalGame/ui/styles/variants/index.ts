import { GAME_VARIANT } from '../../../lib/constants';
import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';
import { cyberpunkVariantStyles } from './cyberpunk';
import { underwaterVariantStyles } from './underwater';
import { highAltitudeHikeVariantStyles } from './high-altitude-hike';
import { crimeVariantStyles } from './crime';
import { horrorVariantStyles } from './horror';
import { adventureVariantStyles } from './adventure';

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
        cards: { ...baseVariantStyles.cards, ...crimeVariantStyles.cards! },
      };
    case GAME_VARIANT.HORROR:
      return {
        ...baseVariantStyles,
        cards: { ...baseVariantStyles.cards, ...horrorVariantStyles.cards! },
      };
    case GAME_VARIANT.ADVENTURE:
      return {
        ...baseVariantStyles,
        cards: { ...baseVariantStyles.cards, ...adventureVariantStyles.cards! },
      };
    default:
      return baseVariantStyles;
  }
};
