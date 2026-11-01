import { NotFoundException, BadRequestException } from '@nestjs/common';
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

  it('throws BadRequestException when user has already accepted the rematch', async () => {
    const room = {
      _id: 'rematch-room-1',
      status: 'lobby',
      participants: [{ userId: 'host-1', joinedAt: new Date() }],
      gameOptions: {
        rematchInvitedIds: ['invited-1'],
        rematchAcceptedIds: ['host-1', 'invited-1'],
      },
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    (roomModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(room),
    });

    await expect(
      service.acceptRematchInvitation('rematch-room-1', 'invited-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when rematch invitation has expired', async () => {
    const pastIso = new Date(Date.now() - 60000).toISOString();
    const room = {
      _id: 'rematch-room-1',
      status: 'lobby',
      participants: [{ userId: 'host-1', joinedAt: new Date() }],
      gameOptions: {
        rematchInvitedIds: ['invited-1'],
        rematchAcceptedIds: ['host-1'],
        rematchExpiresAt: pastIso,
      },
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    (roomModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(room),
    });

    await expect(
      service.acceptRematchInvitation('rematch-room-1', 'invited-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when rematch invitation was cancelled', async () => {
    const room = {
      _id: 'rematch-room-1',
      status: 'lobby',
      participants: [{ userId: 'host-1', joinedAt: new Date() }],
      gameOptions: {
        rematchInvitedIds: ['invited-1'],
        rematchAcceptedIds: ['host-1'],
        rematchCancelledAt: new Date().toISOString(),
      },
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    (roomModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(room),
    });

    await expect(
      service.acceptRematchInvitation('rematch-room-1', 'invited-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('cancels rematch invitation and clears pending flag on previous room', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const mockFindByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(true),
    });
    roomModel.findByIdAndUpdate = mockFindByIdAndUpdate;

    const room = {
      _id: 'rematch-room-1',
      hostId: 'host-1',
      status: 'lobby',
      participants: [{ userId: 'host-1', joinedAt: new Date() }],
      gameOptions: {
        rematchPreviousRoomId: 'old-room-1',
        rematchInvitedIds: ['invited-1'],
      },
      markModified: jest.fn(),
      save: mockSave,
    };

    (roomModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(room),
    });

    const result = await service.cancelRematchInvitation(
      'rematch-room-1',
      'host-1',
    );

    expect(result).toEqual({ oldRoomId: 'old-room-1' });
    expect(room.status).toBe('completed');
    expect(room.gameOptions.rematchInvitedIds).toEqual([]);
    expect(typeof room.gameOptions.rematchCancelledAt).toBe('string');
    expect(mockSave).toHaveBeenCalled();
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('old-room-1', {
      $set: { rematchPending: false },
    });
  });

  it('expires stale rematches and clears pending flag on previous rooms', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const mockFindByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(true),
    });
    roomModel.findByIdAndUpdate = mockFindByIdAndUpdate;

    const staleRoom = {
      _id: 'stale-room-1',
      status: 'lobby',
      gameOptions: {
        rematchPreviousRoomId: 'old-room-99',
        rematchExpiresAt: new Date(Date.now() - 10000).toISOString(),
        rematchInvitedIds: ['player-2'],
      },
      markModified: jest.fn(),
      save: mockSave,
    };

    roomModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([staleRoom]),
    });

    const expiredCount = await service.expireStaleRematches();

    expect(expiredCount).toBe(1);
    expect(staleRoom.status).toBe('completed');
    expect(staleRoom.gameOptions.rematchInvitedIds).toEqual([]);
    expect(typeof staleRoom.gameOptions.rematchCancelledAt).toBe('string');
    expect(mockSave).toHaveBeenCalled();
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('old-room-99', {
      $set: { rematchPending: false },
    });
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
