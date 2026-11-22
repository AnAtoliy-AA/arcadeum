import type { PetState } from '@arcadeum/games-core';

export type PetAttentionReason = 'sick' | 'hungry' | 'dirty';

export const ATTENTION_HUNGER_THRESHOLD = 25;
export const ATTENTION_HYGIENE_THRESHOLD = 30;

/**
 * What the pet needs right now, most urgent first. Eggs, sleeping pets and
 * pets resting at home need nothing, so they never ask for attention.
 */
export function getPetAttention(
  pet: PetState,
  isAtHome: boolean,
): PetAttentionReason[] {
  if (isAtHome || pet.stage === 'egg' || pet.isSleeping) return [];
  const reasons: PetAttentionReason[] = [];
  if (pet.isSick) reasons.push('sick');
  if (pet.stats.hunger < ATTENTION_HUNGER_THRESHOLD) reasons.push('hungry');
  if (pet.poopCount > 0 || pet.stats.hygiene < ATTENTION_HYGIENE_THRESHOLD) {
    reasons.push('dirty');
  }
  return reasons;
}
