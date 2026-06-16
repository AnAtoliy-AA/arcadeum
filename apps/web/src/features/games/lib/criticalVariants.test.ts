import { describe, it, expect } from 'vitest';
import { CARD_VARIANTS } from './criticalVariants';

describe('CARD_VARIANTS bgImage field', () => {
  const expectImage = (id: string, file: string) => {
    const v = CARD_VARIANTS.find((c) => c.id === id);
    expect(v, `variant ${id} should exist`).toBeDefined();
    expect(v?.bgImage).toBe(`/images/variants/${file}`);
  };

  it('populates bgImage for the 6 variants with shipped artwork', () => {
    expectImage('egypt', 'egypt_bg.webp');
    expectImage('fantasy', 'fantasy_bg.webp');
    expectImage('galaxy', 'galaxy_bg.webp');
    expectImage('steampunk', 'steampunk_bg.webp');
    expectImage('western', 'western_bg.webp');
    expectImage('zen', 'zen_bg.webp');
  });

  it('leaves bgImage undefined for variants without shipped artwork', () => {
    const noArtIds = [
      'cyberpunk',
      'underwater',
      'crime',
      'horror',
      'adventure',
      'high-altitude-hike',
      'random',
    ];
    for (const id of noArtIds) {
      const v = CARD_VARIANTS.find((c) => c.id === id);
      expect(
        v?.bgImage,
        `variant ${id} should not have bgImage`,
      ).toBeUndefined();
    }
  });
});
