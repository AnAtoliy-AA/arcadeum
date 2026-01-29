import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gamesApi } from './api';
import { apiClient } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('gamesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRooms', () => {
    it('normalizes paged data correctly', async () => {
      const mockPaged = { rooms: [{ id: '1' }], total: 100 };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockPaged);

      const result = await gamesApi.getRooms({ page: 1 });

      expect(result).toEqual(mockPaged);
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        undefined,
      );
    });

    it('normalizes unpaged rooms object correctly', async () => {
      const mockUnpaged = { rooms: [{ id: '1' }, { id: '2' }] };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockUnpaged);

      const result = await gamesApi.getRooms();

      expect(result).toEqual({ rooms: mockUnpaged.rooms, total: 2 });
    });

    it('normalizes raw array correctly', async () => {
      const mockArray = [{ id: '1' }];
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockArray);

      const result = await gamesApi.getRooms();

      expect(result).toEqual({ rooms: mockArray, total: 1 });
    });

    it('returns empty result for unknown data format', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({});
      const result = await gamesApi.getRooms();
      expect(result).toEqual({ rooms: [], total: 0 });
    });

    it('skips empty or "all" parameters', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ rooms: [] });
      await gamesApi.getRooms({ status: 'all', search: '' });
      expect(apiClient.get).toHaveBeenCalledWith('/games/rooms?', undefined);
    });
  });

  describe('getRoomVisibility', () => {
    it('returns visibility from response', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        room: { visibility: 'private' },
      });
      const result = await gamesApi.getRoomVisibility('r1');
      expect(result).toBe('private');
    });

    it('returns default public visibility if missing in response', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ room: {} });
      const result = await gamesApi.getRoomVisibility('r1');
      expect(result).toBe('public');
    });

    it('throws private_room_error on 403', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        status: HttpStatus.FORBIDDEN,
      });
      await expect(gamesApi.getRoomVisibility('r1')).rejects.toThrow(
        'private_room_error',
      );
    });

    it('throws room_not_found_error on 404', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        status: HttpStatus.NOT_FOUND,
      });
      await expect(gamesApi.getRoomVisibility('r1')).rejects.toThrow(
        'room_not_found_error',
      );
    });

    it('throws room_not_found_error on 500', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({ status: 500 });
      await expect(gamesApi.getRoomVisibility('r1')).rejects.toThrow(
        'room_not_found_error',
      );
    });

    it('throws failed_to_load_error on unknown failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce('unknown');
      await expect(gamesApi.getRoomVisibility('r1')).rejects.toThrow(
        'failed_to_load_error',
      );
    });
  });

  describe('getRoomInfo', () => {
    it('returns full room data', async () => {
      const mockData = { id: 'r1', name: 'Test Room' };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockData);
      const result = await gamesApi.getRoomInfo('r1');
      expect(result).toEqual(mockData);
    });

    it('throws private_room_error on 403 with statusCode', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        statusCode: 403,
        message: 'Cannot view this room',
      });
      await expect(gamesApi.getRoomInfo('r1')).rejects.toThrow(
        'private_room_error',
      );
    });

    it('throws private_room_error on generic 403 status', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        status: HttpStatus.FORBIDDEN,
      });
      await expect(gamesApi.getRoomInfo('r1')).rejects.toThrow(
        'private_room_error',
      );
    });

    it('throws room_not_found_error on 500', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({ status: 500 });
      await expect(gamesApi.getRoomInfo('r1')).rejects.toThrow(
        'room_not_found_error',
      );
    });

    it('throws failed_to_load_error on other errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('raw'));
      await expect(gamesApi.getRoomInfo('r1')).rejects.toThrow(
        'failed_to_load_error',
      );
    });
  });

  it('createRoom sends POST request', async () => {
    const payload = {
      gameId: 'g1',
      name: 'Room',
      visibility: 'public' as const,
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ room: { id: 'r1' } });
    await gamesApi.createRoom(payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/games/rooms',
      payload,
      undefined,
    );
  });
});
