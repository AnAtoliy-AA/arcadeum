import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAdminStatisticsData,
  DEFAULT_ADMIN_STATISTICS,
} from './admin-statistics.server';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'mock-token' }),
  }),
}));

vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: vi.fn((path: string) => `http://localhost:3000${path}`),
}));

describe('admin-statistics.server', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns data when backend returns 200', async () => {
    const mockData = {
      ...DEFAULT_ADMIN_STATISTICS,
      users: { ...DEFAULT_ADMIN_STATISTICS.users, totalUsers: 150 },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    });

    const result = await getAdminStatisticsData();
    expect(result.users.totalUsers).toBe(150);
  });

  it('returns default fallback when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await getAdminStatisticsData();
    expect(result).toEqual(DEFAULT_ADMIN_STATISTICS);
  });
});
