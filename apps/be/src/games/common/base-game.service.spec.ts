import { Logger } from '@nestjs/common';
import { BaseGameService } from './base-game.service';
import type { GameRoomsService } from '../rooms/game-rooms.service';
import type { GameSessionsService } from '../sessions/game-sessions.service';
import type { GamesRealtimeService } from '../games.realtime.service';
import type { Connection } from 'mongoose';

class TestGameService extends BaseGameService<Record<string, unknown>> {
  protected readonly logger = new Logger(TestGameService.name);
  readonly gameId = 'test_v1';
  readonly gameName = 'Test';
  readonly minPlayers = 2;
  readonly maxPlayers = 2;

  protected resolveOptions(raw: unknown): Record<string, unknown> {
    return (raw ?? {}) as Record<string, unknown>;
  }
}

function buildService() {
  const sessionsService = {
    findSessionByRoom: jest.fn(),
  };
  const botService = { checkAndPlay: jest.fn() };
  const service = new TestGameService(
    {} as unknown as GameRoomsService,
    sessionsService as unknown as GameSessionsService,
    {} as unknown as GamesRealtimeService,
    botService,
    { readyState: 1 } as unknown as Connection,
  );
  return { service, sessionsService, botService };
}

describe('BaseGameService.findSessionByRoom', () => {
  it('returns the session without triggering bot turns', async () => {
    const { service, sessionsService, botService } = buildService();
    const session = {
      id: 's-1',
      roomId: 'r-1',
      status: 'active',
      state: {},
    };
    sessionsService.findSessionByRoom.mockResolvedValue(session);

    const result = await service.findSessionByRoom('r-1');

    expect(result).toBe(session);
    expect(botService.checkAndPlay).not.toHaveBeenCalled();
  });

  it('returns null when no session exists', async () => {
    const { service, sessionsService } = buildService();
    sessionsService.findSessionByRoom.mockResolvedValue(null);

    await expect(service.findSessionByRoom('r-1')).resolves.toBeNull();
  });
});
