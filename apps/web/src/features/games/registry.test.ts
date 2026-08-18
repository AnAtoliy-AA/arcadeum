import { describe, it, expect } from 'vitest';
import {
  getVisibleGameCategories,
  getCategoryLabelKey,
  gameMetadata,
} from './registry';

describe('getVisibleGameCategories', () => {
  it('derives categories from non-coming-soon game metadata', () => {
    const categories = getVisibleGameCategories();
    expect(categories.length).toBeGreaterThanOrEqual(4);
    expect(categories).toContain('Card Game');
    expect(categories).toContain('Board Game');
    expect(categories).toContain('Strategy');
    expect(categories).toContain('Action');
  });

  it('excludes categories that only belong to coming-soon games', () => {
    const visible = Object.values(gameMetadata).filter(
      (g) => g.status !== 'coming_soon' && g.status !== 'deprecated',
    );
    const comingSoon = Object.values(gameMetadata).filter(
      (g) => g.status === 'coming_soon' || g.status === 'deprecated',
    );
    const visibleCategories = new Set(visible.map((g) => g.category));
    const comingSoonOnly = comingSoon.filter(
      (g) => !visibleCategories.has(g.category),
    );
    for (const g of comingSoonOnly) {
      expect(getVisibleGameCategories()).not.toContain(g.category);
    }
  });

  it('keeps preferred order and appends novel categories after', () => {
    const categories = getVisibleGameCategories();
    const preferred = ['Card Game', 'Board Game', 'Strategy', 'Action'];
    for (let i = 0; i < preferred.length - 1; i++) {
      expect(categories.indexOf(preferred[i])).toBeLessThan(
        categories.indexOf(preferred[i + 1]),
      );
    }
  });
});

describe('getCategoryLabelKey', () => {
  it('maps known categories to i18n keys', () => {
    expect(getCategoryLabelKey('Card Game')).toBe(
      'games.shared.category.cardGame',
    );
    expect(getCategoryLabelKey('Race')).toBe('games.shared.category.race');
  });

  it('returns undefined for unknown categories', () => {
    expect(getCategoryLabelKey('Unknown')).toBeUndefined();
  });
});
