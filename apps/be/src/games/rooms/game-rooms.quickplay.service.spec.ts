import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GameRoomsQuickplayService } from './game-rooms.quickplay.service';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomsService } from './game-rooms.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { GameEngineRegistry } from '../engines/registry/game-engine.registry';
import { GameRoom } from '../schemas/game-room.schema';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';

interface QuickplayRoomDoc {
  gameId: string;
  name: string;
  hostId: string;
  visibility: string;
  maxPlayers: number;
  participants: Array<{ userId: string; joinedAt: Date }>;
  status: string;
  gameOptions: Record<string, unknown>;
}

const metadataFor = (
  gameId: string,
): { minPlayers: number; maxPlayers: number } =>
  gameId === 'hearts_v1'
    ? { minPlayers: 4, maxPlayers: 4 }
    : { minPlayers: 2, maxPlayers: 2 };

describe('GameRoomsQuickplayService', () => {
  let service: GameRoomsQuickplayService;
  let createDoc: jest.Mock<Promise<QuickplayRoomDoc>, [QuickplayRoomDoc]>;

  const makeModule = async (): Promise<void> => {
    createDoc = jest.fn((doc: QuickplayRoomDoc): Promise<QuickplayRoomDoc> =>
      Promise.resolve(doc),
    );
    const getMetadata = jest
      .fn()
      .mockImplementation((gameId: string) => metadataFor(gameId));

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GameRoomsQuickplayService,
        {
          provide: getModelToken(GameRoom.name, OCI_CONNECTION),
          useValue: { create: createDoc },
        },
        {
          provide: GameRoomsMapper,
          useValue: { prepareRoomSummary: (doc) => Promise.resolve(doc) },
        },
        { provide: GameRoomsService, useValue: { createRoom: jest.fn() } },
        {
          provide: GamesRealtimeService,
          useValue: { emitRoomCreated: jest.fn() },
        },
        { provide: GameEngineRegistry, useValue: { getMetadata } },
      ],
    }).compile();

    service = moduleRef.get(GameRoomsQuickplayService);
  };

  beforeEach(async () => {
    await makeModule();
  });

  describe('createQuickplayRoom', () => {
    it('seeds a full bot table for a 4-player game (Hearts)', async () => {
      const summary = await service.createQuickplayRoom('user-1', 'hearts_v1');

      expect(createDoc).toHaveBeenCalledTimes(1);
      const doc = createDoc.mock.calls[0][0];
      expect(doc.maxPlayers).toBe(4);
      expect(doc.participants).toHaveLength(4);

      const [host, ...bots] = doc.participants;
      expect(host.userId).toBe('user-1');
      for (const bot of bots) {
        expect(bot.userId).toMatch(/^bot-/);
      }
      expect(summary).toEqual(doc);
    });

    it('keeps the classic 1v1 seeding for 2-player games', async () => {
      await service.createQuickplayRoom('user-1', 'tic_tac_toe_v1');

      const doc = createDoc.mock.calls[0][0];
      expect(doc.maxPlayers).toBe(2);
      expect(doc.participants).toHaveLength(2);
      expect(doc.participants[1].userId).toMatch(/^bot-/);
    });
  });
});
