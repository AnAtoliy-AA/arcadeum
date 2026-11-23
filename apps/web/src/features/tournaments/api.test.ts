import { describe, it, expect, vi, beforeEach } from 'vitest';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: (...args: unknown[]) => get(...args) },
}));

import { fetchWeeklyCup } from './api';

describe('fetchWeeklyCup', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ tournament: null });
  });

  it('calls the weekly cup route for the game with locale', async () => {
    await fetchWeeklyCup('checkers', { locale: 'fr' });
    expect(get).toHaveBeenCalledWith(
      '/tournaments/weekly-cups/checkers?locale=fr',
      undefined,
    );
  });

  it('omits the query string without a locale and forwards the token', async () => {
    await fetchWeeklyCup('sea-battle', { accessToken: 'abc' });
    expect(get).toHaveBeenCalledWith('/tournaments/weekly-cups/sea-battle', {
      token: 'abc',
    });
  });
});
