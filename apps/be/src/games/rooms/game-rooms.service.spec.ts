import { GameRoomsService } from './game-rooms.service';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomsRematchService } from './game-rooms.rematch.service';
import { GameRoomsChatService } from './game-rooms.chat.service';
import { GameEngineRegistry } from '../engines/registry/game-engine.registry';
import { CreateGameRoomDto } from '../dtos/create-game-room.dto';
import type { Model } from 'mongoose';
import type { GameRoom } from '../schemas/game-room.schema';
import type { GameRoomSummary } from './game-rooms.types';

describe('GameRoomsService notes & security', () => {
  let service: GameRoomsService;
  let ociRoomModel: Partial<Record<keyof Model<GameRoom>, jest.Mock>>;
  let mapper: Partial<Record<keyof GameRoomsMapper, jest.Mock>>;

  beforeEach(() => {
    ociRoomModel = {
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      create: jest.fn().mockImplementation((doc: Record<string, unknown>) => ({
        _id: 'room-123',
        ...doc,
        toObject: (): Record<string, unknown> => doc,
      })),
    };

    mapper = {
      prepareRoomSummary: jest
        .fn()
        .mockImplementation(
          (room: GameRoom, viewerId?: string): Partial<GameRoomSummary> => ({
            id: 'room-123',
            notes: room.notes ?? null,
            hostId: viewerId ?? 'user-1',
          }),
        ),
    };

    service = new GameRoomsService(
      ociRoomModel as unknown as Model<GameRoom>,
      mapper as unknown as GameRoomsMapper,
      {} as unknown as GameRoomsRematchService,
      {} as unknown as GameRoomsChatService,
      {} as unknown as GameEngineRegistry,
    );
  });

  it('sanitizes and stores notes on room creation', async () => {
    const dto: CreateGameRoomDto = {
      gameId: 'critical_v1',
      name: 'Secure Room',
      visibility: 'public',
      notes: '<script>alert("hack")</script>Friendly matches only!',
    };

    await service.createRoom('user-1', dto);

    expect(ociRoomModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Secure Room',
        notes: 'scriptalert("hack")/scriptFriendly matches only!',
      }),
    );
  });

  it('handles missing notes cleanly', async () => {
    const dto: CreateGameRoomDto = {
      gameId: 'critical_v1',
      name: 'No Notes Room',
      visibility: 'public',
    };

    await service.createRoom('user-1', dto);

    expect(ociRoomModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'No Notes Room',
        notes: undefined,
      }),
    );
  });

  it('counts host rooms correctly', async () => {
    ociRoomModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(4),
    });

    const count = await service.countHostRooms('user-1');
    expect(count).toBe(4);
    expect(ociRoomModel.countDocuments).toHaveBeenCalledWith({
      hostId: 'user-1',
    });
  });
});
