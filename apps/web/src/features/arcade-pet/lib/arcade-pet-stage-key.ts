import type { PetStage } from '@arcadeum/games-core';

export type PetStageTranslationKey =
  `arcadePetCompanion.stage.${'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'senior'}`;

/** Translation key for a pet stage, e.g. 'arcadePetCompanion.stage.baby'. */
export function stageTranslationKey(stage: PetStage): PetStageTranslationKey {
  return `arcadePetCompanion.stage.${stage}` as PetStageTranslationKey;
}
