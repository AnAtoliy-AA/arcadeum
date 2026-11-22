import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendBulkRewardsAction } from './admin-bulk-rewards.actions';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';

vi.mock('@/shared/lib/server-auth-fetch', () => ({
  serverAuthFetch: vi.fn(),
}));

const mockFetch = vi.mocked(serverAuthFetch);

describe('sendBulkRewardsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates pet type requires an itemId species', async () => {
    const result = await sendBulkRewardsAction({
      type: 'pet',
      amount: 1,
      itemId: '',
    });

    expect(result).toEqual({ ok: false, error: 'validation' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('successfully submits pet bulk reward with selected species', async () => {
    const mockData = {
      totalUsers: 10,
      successfulRewards: 10,
      failedRewards: 0,
      errors: [],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockData),
    } as unknown as Response);

    const result = await sendBulkRewardsAction({
      type: 'pet',
      amount: 1,
      itemId: 'cyber_cat',
      reason: 'Special holiday giveaway',
    });

    expect(result).toEqual({ ok: true, data: mockData });
    expect(mockFetch).toHaveBeenCalledWith(
      '/admin/bulk-rewards',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          type: 'pet',
          amount: 1,
          itemId: 'cyber_cat',
          reason: 'Special holiday giveaway',
        }),
      }),
    );
  });
});
