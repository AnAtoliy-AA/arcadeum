import type { Request } from 'express';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { CriticalService } from './critical/critical.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';
import { GamesCatalogService } from './games-catalog.service';
import { AiVsAiService } from './ai-vs-ai/ai-vs-ai.service';

function buildController(games: Partial<GamesService>): GamesController {
  return new GamesController(
    games as unknown as GamesService,
    {} as unknown as GamesCatalogService,
    {} as unknown as CriticalService,
    {} as unknown as TexasHoldemService,
    {} as unknown as AiVsAiService,
  );
}

describe('GamesController anonymous room operations', () => {
  it('allows anonymous host to reorder participants', async () => {
    const reorderParticipants = jest.fn().mockResolvedValue({ id: 'room-1' });
    const controller = buildController({ reorderParticipants });

    const req = {
      user: {
        userId: 'anon_12345678',
        role: 'guest',
        anonymous: true,
      },
    } as unknown as Request;

    const result = await controller.reorderParticipants(req, 'room-1', {
      userIds: ['player-2', 'anon_12345678'],
    });

    expect(reorderParticipants).toHaveBeenCalledWith(
      'room-1',
      'anon_12345678',
      ['player-2', 'anon_12345678'],
    );
    expect(result).toEqual({ room: { id: 'room-1' } });
  });

  it('allows anonymous host to add and remove bots', async () => {
    const addBotToRoom = jest.fn().mockResolvedValue({ id: 'room-1' });
    const removeBotFromRoom = jest.fn().mockResolvedValue({ id: 'room-1' });
    const controller = buildController({ addBotToRoom, removeBotFromRoom });

    const req = {
      user: {
        userId: 'anon_12345678',
        role: 'guest',
        anonymous: true,
      },
    } as unknown as Request;

    await controller.addBotToRoom(req, 'room-1');
    expect(addBotToRoom).toHaveBeenCalledWith('room-1', 'anon_12345678');

    await controller.removeBotFromRoom(req, 'room-1', { botId: 'bot-123' });
    expect(removeBotFromRoom).toHaveBeenCalledWith(
      'room-1',
      'anon_12345678',
      'bot-123',
    );
  });
});
