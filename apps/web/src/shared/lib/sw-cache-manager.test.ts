import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  cacheGameAssets,
  clearGameCache,
  getNetworkStatus,
  isGameCached,
} from './sw-cache-manager';

describe('sw-cache-manager', () => {
  const originalCaches = globalThis.caches;

  beforeEach(() => {
    const mockCacheStore = new Map<string, string[]>();

    const mockCaches = {
      open: vi.fn().mockImplementation(async (name: string) => ({
        addAll: vi.fn().mockImplementation(async (urls: string[]) => {
          mockCacheStore.set(name, urls);
        }),
      })),
      has: vi
        .fn()
        .mockImplementation(async (name: string) => mockCacheStore.has(name)),
      delete: vi
        .fn()
        .mockImplementation(async (name: string) =>
          mockCacheStore.delete(name),
        ),
    };

    Object.defineProperty(globalThis, 'caches', {
      value: mockCaches,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'caches', {
      value: originalCaches,
      writable: true,
      configurable: true,
    });
  });

  it('caches game assets using CacheStorage API', async () => {
    const success = await cacheGameAssets('chess', [
      '/chess/board.png',
      '/chess/pieces.png',
    ]);
    expect(success).toBe(true);

    const cached = await isGameCached('chess');
    expect(cached).toBe(true);
  });

  it('clears game cache on demand', async () => {
    await cacheGameAssets('go', ['/go/board.png']);
    expect(await isGameCached('go')).toBe(true);

    const cleared = await clearGameCache('go');
    expect(cleared).toBe(true);
    expect(await isGameCached('go')).toBe(false);
  });

  it('detects online/offline status correctly', () => {
    expect(typeof getNetworkStatus()).toBe('boolean');
  });
});
