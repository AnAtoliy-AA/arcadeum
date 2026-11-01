import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { GameRoomsRematchService } from './game-rooms.rematch.service';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoom } from '../schemas/game-room.schema';

describe('GameRoomsRematchService', () => {
  let service: GameRoomsRematchService;
  let roomModel: Partial<Model<GameRoom>>;
  let mapper: Partial<GameRoomsMapper>;

  beforeEach(() => {
    roomModel = {
      findById: jest.fn(),
    };
    mapper = {
      prepareRoomSummary: jest.fn((room: GameRoom) =>
        Promise.resolve({
          id: 'room-1',
          status: room.status,
          name: room.name,
          gameId: room.gameId,
          hostId: room.hostId,
          visibility: room.visibility,
          maxPlayers: room.maxPlayers,
          playerCount: room.participants?.length ?? 1,
          members: [],
          participants: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ),
    };
    service = new GameRoomsRematchService(
      roomModel as unknown as Model<GameRoom>,
      mapper as unknown as GameRoomsMapper,
    );
  });

  it('declines rematch invitation and triggers bot fallback when no invited players remain', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const room = {
      _id: 'rematch-room-1',
      status: 'lobby',
      maxPlayers: 2,
      participants: [{ userId: 'host-1', joinedAt: new Date() }],
      gameOptions: {
        rematchInvitedIds: ['invited-1'],
        rematchDeclinedIds: [],
      },
      markModified: jest.fn(),
      save: mockSave,
    };

    (roomModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(room),
    });

    await service.declineRematchInvitation('rematch-room-1', 'invited-1');

    expect(room.gameOptions.rematchInvitedIds).toEqual([]);
    expect(room.gameOptions.rematchDeclinedIds).toEqual(['invited-1']);
    expect(room.participants).toHaveLength(2);
    expect(room.participants[1].userId).toMatch(/^bot-/);
    expect(mockSave).toHaveBeenCalled();
  });

  it('blocks rematch room and triggers bot fallback when all invitees are removed', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const room = {
      _id: 'rematch-room-1',
      status: 'lobby',
      maxPlayers: 2,
      participants: [{ userId: 'host-1', joinedAt: new Date() }],
      gameOptions: {
        rematchInvitedIds: ['invited-1'],
        rematchDeclinedIds: [],
        rematchBlockedIds: [],
      },
      markModified: jest.fn(),
      save: mockSave,
    };

    (roomModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(room),
    });

    await service.blockRematchRoom('rematch-room-1', 'invited-1');

    expect(room.gameOptions.rematchInvitedIds).toEqual([]);
    expect(room.gameOptions.rematchBlockedIds).toEqual(['invited-1']);
    expect(room.participants).toHaveLength(2);
    expect(room.participants[1].userId).toMatch(/^bot-/);
    expect(mockSave).toHaveBeenCalled();
  });

  it('throws NotFoundException when room does not exist', async () => {
    (roomModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.declineRematchInvitation('missing', 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('accepts an invitation and joins the rematch lobby', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const room = {
      _id: 'rematch-room-1',
      status: 'lobby',
      participants: [{ userId: 'host-1', joinedAt: new Date() }],
      gameOptions: {
        rematchInvitedIds: ['invited-1'],
        rematchAcceptedIds: ['host-1'],
      },
      markModified: jest.fn(),
      save: mockSave,
    };

    (roomModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(room),
    });

    await service.acceptRematchInvitation('rematch-room-1', 'invited-1');

    expect(room.participants).toHaveLength(2);
    expect(room.participants[1].userId).toBe('invited-1');
    expect(room.gameOptions.rematchInvitedIds).toEqual([]);
    expect(room.gameOptions.rematchAcceptedIds).toEqual([
      'host-1',
      'invited-1',
    ]);
    expect(mockSave).toHaveBeenCalled();
  });
});
