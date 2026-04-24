import { describe, it, expect } from 'vitest';
import { getVariantStyles } from './index';
import { GAME_VARIANT } from '../../../lib/constants';

describe('getVariantStyles — scene palette', () => {
  it('returns the base scene palette when variant is undefined', () => {
    const { scene } = getVariantStyles(undefined);
    expect(scene).toBeDefined();
    expect(scene.sceneBgGradient).toContain('radial-gradient');
    expect(scene.gridLineColorA).toMatch(/^rgba?\(/);
    expect(scene.handColorByRole.special).toBeTruthy();
  });

  it('falls back to base palette for unknown variants', () => {
    const { scene } = getVariantStyles('not-a-real-variant');
    expect(scene.sceneBgGradient).toEqual(
      getVariantStyles(undefined).scene.sceneBgGradient,
    );
  });
});

describe('getVariantStyles — per-variant scene palette', () => {
  const variants = [
    GAME_VARIANT.CYBERPUNK,
    GAME_VARIANT.UNDERWATER,
    GAME_VARIANT.CRIME,
    GAME_VARIANT.HORROR,
    GAME_VARIANT.ADVENTURE,
    GAME_VARIANT.HIGH_ALTITUDE_HIKE,
  ];

  it.each(variants)('%s has a scene palette distinct from base', (variant) => {
    const { scene: baseScene } = getVariantStyles(undefined);
    const { scene } = getVariantStyles(variant);
    expect(scene).toBeDefined();
    expect(scene.sceneBgGradient).not.toEqual(baseScene.sceneBgGradient);
    // Each required handColorByRole slot is present
    (
      ['attack', 'defuse', 'skip', 'nope', 'favor', 'see', 'combo', 'special'] as const
    ).forEach((role) => {
      expect(scene.handColorByRole[role]).toBeTruthy();
    });
  });
});
