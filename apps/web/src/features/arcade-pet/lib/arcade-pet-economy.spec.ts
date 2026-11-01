import { describe, expect, it } from 'vitest';
import {
  getHomeUpgradeCost,
  getPetAdoptionCost,
  getPetFoodCost,
  getRandomPetSpec,
  SELECT_PET_COST,
  THEME_PET_PALETTES,
  getThemePets,
  getSignaturePet,
} from './arcade-pet-economy';

describe('arcade-pet-economy', () => {
  it('calculates home upgrade costs in coins and gems', () => {
    expect(getHomeUpgradeCost(1)).toEqual({ coinCost: 50, gemCost: 100 });
    expect(getHomeUpgradeCost(2)).toEqual({ coinCost: 150, gemCost: 250 });
    expect(getHomeUpgradeCost(3)).toEqual({ coinCost: 300, gemCost: 450 });
    expect(getHomeUpgradeCost(4)).toEqual({ coinCost: 500, gemCost: 700 });
    expect(getHomeUpgradeCost(5)).toEqual({ coinCost: 750, gemCost: 1000 });
  });

  it('escalates food cost for subsequent pets: 1, 5, 20, 50, 100 coins', () => {
    expect(getPetFoodCost(0)).toBe(1);
    expect(getPetFoodCost(1)).toBe(5);
    expect(getPetFoodCost(2)).toBe(20);
    expect(getPetFoodCost(3)).toBe(50);
    expect(getPetFoodCost(4)).toBe(100);
    expect(getPetFoodCost(5)).toBe(150);
  });

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

  it('guarantees each game theme has at least one signature pet and 5 pets in roster', () => {
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
      const pets = getThemePets(theme);
      expect(pets.length).toBeGreaterThanOrEqual(3);
      expect(pets.length).toBe(5);
      const signature = getSignaturePet(theme);
      expect(signature).toBeDefined();
      expect(signature.isSignature).toBe(true);
      expect(signature.theme).toBe(theme);
    }
  });

  it('prioritizes queued bought theme in getRandomPetSpec and pulls from that theme roster', () => {
    const spec = getRandomPetSpec('underwater');
    expect(spec.theme).toBe('underwater');
    expect(spec.species).toBeDefined();
    const underwaterPets = getThemePets('underwater');
    expect(underwaterPets.some((p) => p.name === spec.name)).toBe(true);
  });

  it('generates random species and theme from game themes when no queued theme is provided', () => {
    const spec = getRandomPetSpec();
    expect(spec.theme).toBeDefined();
    expect(spec.species).toBeDefined();
    expect(spec.name).toBeDefined();
  });
});
