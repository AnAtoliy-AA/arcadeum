import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  reorderRoomParticipants,
  startGameRoom,
  addBotToRoom,
  removeBotFromRoom,
  getGameRoomSession,
} from './gamesApi';
import { apiClient } from '../lib/api-client';

vi.mock('../lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

describe('gamesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reorders room participants via apiClient with optional token', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      room: { id: 'room-1' },
    });

    const result = await reorderRoomParticipants(
      'room-1',
      ['p-1', 'p-2'],
      'my-token',
    );

    expect(apiClient.post).toHaveBeenCalledWith(
      '/games/rooms/room-1/participants',
      { userIds: ['p-1', 'p-2'] },
      { token: 'my-token' },
    );
    expect(result).toEqual({ room: { id: 'room-1' } });
  });

  it('reorders room participants when anonymous (no token provided)', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      room: { id: 'room-1' },
    });

    await reorderRoomParticipants('room-1', ['p-2', 'p-1']);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/games/rooms/room-1/participants',
      { userIds: ['p-2', 'p-1'] },
      { token: undefined },
    );
  });

  it('starts game room via apiClient', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      room: { id: 'room-1' },
      session: { id: 'sess-1' },
    });

    await startGameRoom('room-1', 'default', 'token-123');

    expect(apiClient.post).toHaveBeenCalledWith(
      '/games/rooms/room-1/start',
      { engine: 'default' },
      { token: 'token-123' },
    );
  });

  it('adds and removes bot via apiClient', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ room: { id: 'room-1' } });
    await addBotToRoom('room-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/games/rooms/room-1/add-bot',
      undefined,
      { token: undefined },
    );

    vi.mocked(apiClient.post).mockResolvedValueOnce({ room: { id: 'room-1' } });
    await removeBotFromRoom('room-1', 'bot-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/games/rooms/room-1/remove-bot',
      { botId: 'bot-1' },
      { token: undefined },
    );
  });

  it('gets game room session via apiClient', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      session: { id: 'sess-1' },
    });

    const result = await getGameRoomSession('room-1');
    expect(apiClient.get).toHaveBeenCalledWith('/games/rooms/room-1/session', {
      token: undefined,
    });
    expect(result).toEqual({ session: { id: 'sess-1' } });
  });
});
