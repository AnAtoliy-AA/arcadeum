import { GAME_VARIANT } from '../../../lib/constants';
import { VariantStyleConfig } from './types';
import { baseVariantStyles } from './base';
import { cyberpunkVariantStyles } from './cyberpunk';
import { underwaterVariantStyles } from './underwater';
import { highAltitudeHikeVariantStyles } from './high-altitude-hike';
import { crimeFullVariantStyles } from './crime';
import { horrorFullVariantStyles } from './horror';
import { adventureFullVariantStyles } from './adventure';
import { galaxyVariantStyles } from './galaxy';
import { fantasyVariantStyles } from './fantasy';
import { westernVariantStyles } from './western';
import { egyptVariantStyles } from './egypt';
import { steampunkVariantStyles } from './steampunk';
import { zenVariantStyles } from './zen';

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
    case GAME_VARIANT.GALAXY:
      return {
        ...baseVariantStyles,
        ...galaxyVariantStyles,
      };
    case GAME_VARIANT.FANTASY:
      return {
        ...baseVariantStyles,
        ...fantasyVariantStyles,
      };
    case GAME_VARIANT.WESTERN:
      return {
        ...baseVariantStyles,
        ...westernVariantStyles,
      };
    case GAME_VARIANT.EGYPT:
      return {
        ...baseVariantStyles,
        ...egyptVariantStyles,
      };
    case GAME_VARIANT.STEAMPUNK:
      return {
        ...baseVariantStyles,
        ...steampunkVariantStyles,
      };
    case GAME_VARIANT.ZEN:
      return {
        ...baseVariantStyles,
        ...zenVariantStyles,
      };
    default:
      return baseVariantStyles;
  }
};
// Invariant: every returned config has a fully-populated `scene` palette,
// because variants use `...baseVariantStyles.scene` as their starting point.
