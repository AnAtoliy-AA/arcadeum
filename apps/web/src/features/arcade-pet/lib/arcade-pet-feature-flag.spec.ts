import { describe, it, expect } from 'vitest';
import { isPetFeatureDisabled } from './arcade-pet-feature-flag';
import type { CatalogGame } from '@/features/games/api';

describe('isPetFeatureDisabled', () => {
  it('returns false when catalog is null or empty', () => {
    expect(isPetFeatureDisabled(null)).toBe(false);
    expect(isPetFeatureDisabled([])).toBe(false);
  });

  it('returns false when arcade_pet_v1 is active and rules are included', () => {
    const catalog: CatalogGame[] = [
      {
        gameId: 'arcade_pet_v1',
        comingSoon: false,
        variants: [],
        rules: [{ ruleId: 'pets', comingSoon: false }],
      },
    ];
    expect(isPetFeatureDisabled(catalog)).toBe(false);
  });

  it('returns true when arcade_pet_v1 game itself is marked comingSoon by admin', () => {
    const catalog: CatalogGame[] = [
      {
        gameId: 'arcade_pet_v1',
        comingSoon: true,
        variants: [],
        rules: [{ ruleId: 'pets', comingSoon: false }],
      },
    ];
    expect(isPetFeatureDisabled(catalog)).toBe(true);
  });

  it('returns true when pets rule is excluded by admin in game rules', () => {
    const catalog: CatalogGame[] = [
      {
        gameId: 'arcade_pet_v1',
        comingSoon: false,
        variants: [],
        rules: [{ ruleId: 'pets', comingSoon: true }],
      },
    ];
    expect(isPetFeatureDisabled(catalog)).toBe(true);
  });
});
