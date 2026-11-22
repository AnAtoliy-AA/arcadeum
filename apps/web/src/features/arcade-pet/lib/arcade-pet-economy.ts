import type { PetGiftPresentPayload } from '@arcadeum/games-core';

/** Same shape the server stores and sends; single definition in games-core. */
export type PetGiftPresent = PetGiftPresentPayload;

export {
  DEFAULT_HOME_CAPACITY,
  GAME_THEME_IDS,
  PET_FOOD_COSTS,
  SELECT_PET_COST,
  THEME_PET_ROSTER,
  getHomeUpgradeCost,
  getPetAdoptionCost,
  getPetByThemeAndSpecies,
  getPetFoodCost,
  getRandomPetSpec,
  getSignaturePet,
  getThemePets,
  type ThemePetDefinition,
} from '@arcadeum/games-core';
