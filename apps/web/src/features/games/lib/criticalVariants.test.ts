import { describe, it, expect } from 'vitest';
import { CARD_VARIANTS } from './criticalVariants';

describe('CARD_VARIANTS bgImage field', () => {
  const expectImage = (id: string, file: string) => {
    const v = CARD_VARIANTS.find((c) => c.id === id);
    expect(v, `variant ${id} should exist`).toBeDefined();
    expect(v?.bgImage).toBe(`/images/variants/${file}`);
  };

  it('populates bgImage for all 12 variants with shipped artwork', () => {
    expectImage('cyberpunk', 'cyberpunk_bg.webp');
    expectImage('underwater', 'underwater_bg.webp');
    expectImage('crime', 'crime_bg.webp');
    expectImage('horror', 'horror_bg.webp');
    expectImage('adventure', 'adventure_bg.webp');
    expectImage('high-altitude-hike', 'high-altitude-hike_bg.webp');
    expectImage('egypt', 'egypt_bg.webp');
    expectImage('fantasy', 'fantasy_bg.webp');
    expectImage('galaxy', 'galaxy_bg.webp');
    expectImage('steampunk', 'steampunk_bg.webp');
    expectImage('western', 'western_bg.webp');
    expectImage('zen', 'zen_bg.webp');
  });

  it('leaves bgImage undefined for random', () => {
    const v = CARD_VARIANTS.find((c) => c.id === 'random');
    expect(v?.bgImage).toBeUndefined();
  });
});
