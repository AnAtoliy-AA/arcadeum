import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// isOfflineDownloadSupported — no mock setup needed (reads globals directly)
// ---------------------------------------------------------------------------

describe('isOfflineDownloadSupported', () => {
  afterEach(() => {
    if ('caches' in globalThis) {
      delete (globalThis as Record<string, unknown>).caches;
    }
  });

  it('returns false when no service worker controller is active', async () => {
    Object.defineProperty(globalThis, 'caches', {
      value: {},
      configurable: true,
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { controller: null },
      configurable: true,
    });
    const { isOfflineDownloadSupported } = await import('./cache-warmer');
    expect(isOfflineDownloadSupported()).toBe(false);
  });

  it('returns true when caches API and SW controller exist', async () => {
    Object.defineProperty(globalThis, 'caches', {
      value: { open: vi.fn() },
      configurable: true,
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { controller: { scope: '/' } },
      configurable: true,
    });
    const { isOfflineDownloadSupported } = await import('./cache-warmer');
    expect(isOfflineDownloadSupported()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Cache interaction mocks
// ---------------------------------------------------------------------------

let mockCacheStore: Map<string, Map<string, Response>>;

function stubCaches() {
  mockCacheStore = new Map();
  mockCacheStore.set('arcadeum-pages-v1', new Map());
  mockCacheStore.set('arcadeum-static-v1', new Map());

  const mockCaches = {
    open: vi.fn(async (name: string) => {
      if (!mockCacheStore.has(name)) mockCacheStore.set(name, new Map());
      const store = mockCacheStore.get(name)!;
      return {
        match: vi.fn(async (input: RequestInfo | URL) => {
          const url =
            typeof input === 'string'
              ? input
              : input instanceof URL
                ? input.pathname
                : input.url;
          return store.get(url);
        }),
        put: vi.fn(async (url: string, res: Response) => {
          store.set(url, res);
        }),
        delete: vi.fn(async (input: RequestInfo | URL) => {
          const url =
            typeof input === 'string'
              ? input
              : input instanceof URL
                ? input.pathname
                : new URL(input.url).pathname;
          return store.delete(url);
        }),
        keys: vi.fn(async () =>
          [...store.keys()].map(
            (url) => new Request(new URL(url, window.location.origin)),
          ),
        ),
      };
    }),
    keys: vi.fn(async () => [...mockCacheStore.keys()]),
    match: vi.fn(async (input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.pathname
            : input.url;
      for (const store of mockCacheStore.values()) {
        const hit = store.get(url);
        if (hit) return hit;
      }
      return undefined;
    }),
  };

  Object.defineProperty(globalThis, 'caches', {
    value: mockCaches,
    configurable: true,
  });

  Object.defineProperty(navigator, 'serviceWorker', {
    value: { controller: { scope: '/' } },
    configurable: true,
  });

  return mockCaches;
}

describe('matchInAnyCache', () => {
  beforeEach(() => stubCaches());

  it('returns the response from the first matching cache', async () => {
    const pages = mockCacheStore.get('arcadeum-pages-v1')!;
    pages.set('/en/offline/chess', new Response('html'));

    const { matchInAnyCache } = await import('./cache-warmer');
    const hit = await matchInAnyCache('/en/offline/chess');
    expect(hit).toBeDefined();
    expect(await hit!.text()).toBe('html');
  });

  it('returns undefined when no cache has the URL', async () => {
    const { matchInAnyCache } = await import('./cache-warmer');
    const hit = await matchInAnyCache('/missing');
    expect(hit).toBeUndefined();
  });
});

describe('purgeCachedUrls', () => {
  beforeEach(() => stubCaches());

  it('deletes only the specified URLs across all caches', async () => {
    const pages = mockCacheStore.get('arcadeum-pages-v1')!;
    const staticCache = mockCacheStore.get('arcadeum-static-v1')!;
    pages.set('/en/offline/chess', new Response('doc'));
    pages.set('/en/offline/hearts', new Response('other'));
    staticCache.set('/_next/static/chunk-a.js', new Response('js'));

    const { purgeCachedUrls } = await import('./cache-warmer');
    await purgeCachedUrls(['/en/offline/chess', '/_next/static/chunk-a.js']);

    expect(pages.has('/en/offline/chess')).toBe(false);
    expect(pages.has('/en/offline/hearts')).toBe(true);
    expect(staticCache.has('/_next/static/chunk-a.js')).toBe(false);
  });
});

describe('collectCachedSizes', () => {
  beforeEach(() => stubCaches());

  it('sums content-length headers from matching cached responses', async () => {
    const staticCache = mockCacheStore.get('arcadeum-static-v1')!;
    staticCache.set(
      '/_next/static/chunk-a.js',
      new Response('js', { headers: { 'content-length': '1024' } }),
    );
    staticCache.set(
      '/_next/static/chunk-b.js',
      new Response('js', { headers: { 'content-length': '2048' } }),
    );

    const { matchInAnyCache } = await import('./cache-warmer');
    const urls = ['/_next/static/chunk-a.js', '/_next/static/chunk-b.js'];
    let total = 0;
    for (const url of urls) {
      const res = await matchInAnyCache(url);
      if (res) {
        const len = res.headers.get('content-length');
        if (len) total += Number(len);
      }
    }
    expect(total).toBe(3072);
  });
});
