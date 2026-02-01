import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from './api';
import { apiClient } from '@/shared/lib/api-client';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getBlockedUsers calls correctly', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([]);
    await authApi.getBlockedUsers();
    expect(apiClient.get).toHaveBeenCalledWith('/auth/blocked', undefined);
  });

  it('unblockUser calls correctly', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});
    await authApi.unblockUser('user-123');
    expect(apiClient.delete).toHaveBeenCalledWith(
      '/auth/block/user-123',
      undefined,
    );
  });
});
