import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchTokenMetadata,
  invalidateTokenMetadataCache,
} from './tokenMetadata';

const GOOD = { name: 'Arcadeum Games', symbol: 'ARC' };
const okResponse = (body: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

describe('fetchTokenMetadata', () => {
  beforeEach(() => invalidateTokenMetadataCache());
  afterEach(() => vi.unstubAllGlobals());

  it('caches a good result', async () => {
    const f = vi.fn(() => okResponse(GOOD));
    vi.stubGlobal('fetch', f);
    await fetchTokenMetadata();
    await fetchTokenMetadata();
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('never caches an API failure: the next call retries', async () => {
    const f = vi
      .fn()
      .mockRejectedValueOnce(new Error('down'))
      .mockImplementation(() => okResponse(GOOD));
    vi.stubGlobal('fetch', f);

    expect(await fetchTokenMetadata()).toBeNull();
    await Promise.resolve(); // let the cache-clearing continuation run
    expect(await fetchTokenMetadata()).toMatchObject(GOOD);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('never caches an empty body (no name/symbol)', async () => {
    const f = vi
      .fn()
      .mockImplementationOnce(() => okResponse({ treasuryBalance: null }))
      .mockImplementation(() => okResponse(GOOD));
    vi.stubGlobal('fetch', f);

    expect(await fetchTokenMetadata()).toBeNull();
    await Promise.resolve();
    expect(await fetchTokenMetadata()).toMatchObject(GOOD);
  });

  it('treats a non-ok response as unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
      ),
    );
    expect(await fetchTokenMetadata()).toBeNull();
  });
});
