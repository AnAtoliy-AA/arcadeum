import { describe, expect, it } from 'vitest';
import {
  getPetAdoptionCost,
  getRandomPetSpec,
  SELECT_PET_COST,
  THEME_PET_PALETTES,
} from './arcade-pet-economy';

describe('arcade-pet-economy', () => {
  it('has zero cost for first mount and escalating costs for subsequent mounts', () => {
    expect(getPetAdoptionCost(0)).toBe(0);
    expect(getPetAdoptionCost(1)).toBe(50);
    expect(getPetAdoptionCost(2)).toBe(150);
    expect(getPetAdoptionCost(3)).toBe(300);
    expect(getPetAdoptionCost(4)).toBe(500);
    expect(getPetAdoptionCost(5)).toBe(750);
    expect(getPetAdoptionCost(6)).toBe(1000);
  });

  it('defines 750 gems for expensive VIP pet selection', () => {
    expect(SELECT_PET_COST).toBe(750);
  });

  it('includes palettes for all 12 platform themes', () => {
    const requiredThemes = [
      'adventure',
      'cyberpunk',
      'underwater',
      'crime',
      'horror',
      'high-altitude-hike',
      'galaxy',
      'fantasy',
      'western',
      'egypt',
      'steampunk',
      'zen',
    ];

    for (const theme of requiredThemes) {
      expect(THEME_PET_PALETTES[theme]).toBeDefined();
      expect(THEME_PET_PALETTES[theme]?.primary).toBeDefined();
      expect(THEME_PET_PALETTES[theme]?.emoji).toBeDefined();
    }
  });

  it('prioritizes queued bought theme in getRandomPetSpec', () => {
    const spec = getRandomPetSpec('underwater');
    expect(spec.theme).toBe('underwater');
    expect(spec.species).toBeDefined();
    expect(spec.name).toContain('Underwater');
  });

  it('generates random species and theme when no queued theme is provided', () => {
    const spec = getRandomPetSpec();
    expect(spec.theme).toBeDefined();
    expect(spec.species).toBeDefined();
    expect(spec.name).toBeDefined();
  });
});
