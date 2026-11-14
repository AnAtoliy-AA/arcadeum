import { describe, it, expect } from 'vitest';
import {
  SPECIES_BEHAVIORS,
  getSpeciesBehavior,
  pickSpeciesTarget,
  computeNextStep,
  pickRandomSpeciesEmote,
} from './arcade-pet-behavior';

describe('arcade-pet-behavior', () => {
  it('defines distinct profiles for all 5 species', () => {
    expect(SPECIES_BEHAVIORS.cyber_cat.cadenceMs).toBe(1800);
    expect(SPECIES_BEHAVIORS.dragon.cadenceMs).toBe(2200);
    expect(SPECIES_BEHAVIORS.dino.cadenceMs).toBe(3200);
    expect(SPECIES_BEHAVIORS.blob.cadenceMs).toBe(1600);
    expect(SPECIES_BEHAVIORS.slime.cadenceMs).toBe(2600);
  });

  it('restricts species target selection to species preferred elevation band', () => {
    const dragonTarget = pickSpeciesTarget('dragon', 5, 2);
    expect(dragonTarget.targetRow).toBeGreaterThanOrEqual(3);
    expect(dragonTarget.targetRow).toBeLessThanOrEqual(7);

    const slimeTarget = pickSpeciesTarget('slime', 5, 6);
    expect(slimeTarget.targetRow).toBeGreaterThanOrEqual(0);
    expect(slimeTarget.targetRow).toBeLessThanOrEqual(3);

    const dinoTarget = pickSpeciesTarget('dino', 2, 2);
    expect(dinoTarget.targetRow).toBeGreaterThanOrEqual(0);
    expect(dinoTarget.targetRow).toBeLessThanOrEqual(4);
  });

  it('computes next step respecting maximum step distance for agile vs steady species', () => {
    const catStep = computeNextStep('cyber_cat', 1, 1, 8, 5, 'right');
    expect(catStep.nextCol).toBe(3);
    expect(catStep.dir).toBe('right');

    const dinoStep = computeNextStep('dino', 1, 1, 8, 5, 'right');
    expect(dinoStep.nextCol).toBe(2);
    expect(dinoStep.dir).toBe('right');
  });

  it('provides distinct species-specific emotes', () => {
    const catEmote = pickRandomSpeciesEmote('cyber_cat', 'ambient');
    expect(SPECIES_BEHAVIORS.cyber_cat.emotes).toContain(catEmote);

    const dragonFriendEmote = pickRandomSpeciesEmote('dragon', 'friend');
    expect(SPECIES_BEHAVIORS.dragon.friendGreetingEmotes).toContain(
      dragonFriendEmote,
    );

    const dinoKnockEmote = pickRandomSpeciesEmote('dino', 'knock');
    expect(SPECIES_BEHAVIORS.dino.knockEmotes).toContain(dinoKnockEmote);
  });

  it('falls back to cyber_cat for unknown species safely', () => {
    const profile = getSpeciesBehavior('unknown' as never);
    expect(profile.species).toBe('cyber_cat');
  });
});
