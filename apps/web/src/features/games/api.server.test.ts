import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getCatalog, handleError } = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  handleError: vi.fn(),
}));
vi.mock('@/features/games/api', () => ({ gamesApi: { getCatalog } }));
vi.mock('@/shared/config/app-config', () => ({ SSR_TIMEOUT: 1000 }));
vi.mock('@/shared/lib/ssr', () => ({ handleSsrFetchError: handleError }));

import { isGameComingSoon, resetCatalogFetchState } from './api.server';

describe('isGameComingSoon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCatalogFetchState();
  });

  it('reads the flag from the catalog', async () => {
    getCatalog.mockResolvedValue({
      games: [{ gameId: 'chess_v1', comingSoon: true }],
    });
    expect(await isGameComingSoon('chess_v1')).toBe(true);
    expect(await isGameComingSoon('go_v1')).toBe(false);
  });

  it('shares one request between concurrent callers', async () => {
    getCatalog.mockResolvedValue({ games: [] });
    await Promise.all([isGameComingSoon('a'), isGameComingSoon('b')]);
    expect(getCatalog).toHaveBeenCalledTimes(1);
  });

  it('logs a failure once and stays playable while the API is down', async () => {
    getCatalog.mockRejectedValue(new Error('502'));
    const results = await Promise.all(
      ['a', 'b', 'c'].map((id) => isGameComingSoon(id)),
    );
    expect(results).toEqual([false, false, false]);
    await isGameComingSoon('d');
    expect(getCatalog).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledTimes(1);
  });
});
