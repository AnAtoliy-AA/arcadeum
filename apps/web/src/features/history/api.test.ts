import { describe, it, expect, vi, beforeEach } from 'vitest';
import { historyApi } from './api';
import { apiClient } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import { PAGINATION } from '@/shared/config/constants';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('historyApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getHistory appends query parameters correctly', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ entries: [], total: 0 });

    await historyApi.getHistory({ status: 'completed', page: 2 });

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('status=completed'),
      undefined,
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      undefined,
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining(`limit=${PAGINATION.DEFAULT_PAGE_SIZE}`),
      undefined,
    );
  });

  it('getStats calls the correct endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({});
    await historyApi.getStats();
    expect(apiClient.get).toHaveBeenCalledWith('/games/stats', undefined);
  });

  it('getDetail handles NOT_FOUND error correctly', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce({
      status: HttpStatus.NOT_FOUND,
    });

    await expect(historyApi.getDetail('room-123')).rejects.toThrow(
      'history_detail_removed_error',
    );
  });

  it('getHistory skips "all" or empty parameters', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ entries: [], total: 0 });
    await historyApi.getHistory({ status: 'all', search: '' });
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('limit='),
      undefined,
    );
    expect(apiClient.get).not.toHaveBeenCalledWith(
      expect.stringContaining('status=all'),
      undefined,
    );
  });

  it('getLeaderboard builds query string correctly', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ entries: [] });

    // No params
    await historyApi.getLeaderboard();
    expect(apiClient.get).toHaveBeenCalledWith('/games/leaderboard');

    // With params
    await historyApi.getLeaderboard(10, 20, 'game-1');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/games/leaderboard?limit=10&offset=20&gameId=game-1',
    );
  });

  it('getDetail handles non-404 errors', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
    await expect(historyApi.getDetail('room-123')).rejects.toMatchObject({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it('getDetail handles unknown error types', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce('raw string error');
    await expect(historyApi.getDetail('room-123')).rejects.toBe(
      'raw string error',
    );
  });

  it('rematch sends POST request', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      room: { id: 'new-room' },
    });
    await historyApi.rematch('old-room', ['p1', 'p2']);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/games/history/old-room/rematch',
      { participantIds: ['p1', 'p2'] },
      undefined,
    );
  });

  it('remove sends DELETE request', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});
    await historyApi.remove('room-123');
    expect(apiClient.delete).toHaveBeenCalledWith(
      '/games/history/room-123',
      undefined,
    );
  });
});
