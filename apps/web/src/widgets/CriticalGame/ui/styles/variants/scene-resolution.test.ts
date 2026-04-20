import { describe, it, expect } from 'vitest';
import { getVariantStyles } from './index';

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
