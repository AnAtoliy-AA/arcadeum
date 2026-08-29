import { describe, it, expect, beforeEach } from 'vitest';
import { AssetPreloader } from './asset-preloader';

describe('AssetPreloader', () => {
  beforeEach(() => {
    AssetPreloader.clearCache();
  });

  it('reports cached status correctly', () => {
    expect(AssetPreloader.isPreloaded('https://example.com/sprite.png')).toBe(
      false,
    );
  });

  it('preloads batch resources gracefully', async () => {
    const results = await AssetPreloader.preloadBatch([
      { url: 'https://example.com/asset1.png', type: 'image' },
      { url: 'https://example.com/asset2.mp3', type: 'audio' },
    ]);

    expect(results).toEqual([true, true]);
  });

  it('clears preloaded cache on demand', () => {
    AssetPreloader.clearCache();
    expect(AssetPreloader.isPreloaded('https://example.com/test.png')).toBe(
      false,
    );
  });
});
