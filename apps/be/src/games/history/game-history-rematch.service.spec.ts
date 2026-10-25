import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { GameHistoryRematchService } from './game-history-rematch.service';
import { GameRoom } from '../schemas/game-room.schema';

describe('GameHistoryRematchService', () => {
  let service: GameHistoryRematchService;
  let primaryModel: Partial<Model<GameRoom>>;

  beforeEach(() => {
    primaryModel = {
      findOneAndUpdate: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn().mockReturnValue({
        catch: jest.fn().mockResolvedValue(true),
      }),
    };
    service = new GameHistoryRematchService(
      primaryModel as unknown as Model<GameRoom>,
    );
  });

  it('creates a new rematch room and locks original room', async () => {
    const originalRoom = {
      _id: 'room-1',
      gameId: 'chess_v1',
      name: 'Match 1',
      hostId: 'user-1',
      visibility: 'public',
      maxPlayers: 2,
      participants: [
        { userId: 'user-1', joinedAt: new Date() },
        { userId: 'user-2', joinedAt: new Date() },
      ],
      gameOptions: {},
    };

    (primaryModel.findOneAndUpdate as jest.Mock).mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(originalRoom),
      }),
    });

    (primaryModel.find as jest.Mock).mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    (primaryModel.create as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'room-2' },
      toObject: () => ({ _id: 'room-2' }),
    });

    (primaryModel.updateOne as jest.Mock).mockReturnValue({
      catch: jest.fn(),
    });

    const result = await service.createRematchFromHistory(
      { roomId: 'room-1', participantIds: ['user-2'] },
      'user-1',
    );

    expect(result.id).toBe('room-2');
    expect(result.invitedIds).toEqual(['user-2']);
    expect(primaryModel.updateOne).toHaveBeenCalledWith(
      { _id: 'room-1' },
      {
        $set: {
          'gameOptions.rematchRoomId': 'room-2',
          rematchPending: true,
        },
      },
    );
  });

  it('reuses existing active rematch room when rematch is already in progress', async () => {
    (primaryModel.findOneAndUpdate as jest.Mock).mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    (primaryModel.findById as jest.Mock).mockReturnValueOnce({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({
          _id: 'room-1',
          gameOptions: { rematchRoomId: 'room-2' },
        }),
      }),
    });

    const mockSave = jest.fn().mockResolvedValue(true);
    const existingRematchRoom = {
      _id: { toString: () => 'room-2' },
      status: 'lobby',
      participants: [{ userId: 'user-1', joinedAt: new Date() }],
      gameOptions: { rematchInvitedIds: ['user-2'] },
      markModified: jest.fn(),
      save: mockSave,
    };

    (primaryModel.findById as jest.Mock).mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(existingRematchRoom),
    });

    const result = await service.createRematchFromHistory(
      { roomId: 'room-1', participantIds: ['user-1'] },
      'user-2',
    );

    expect(result.id).toBe('room-2');
    expect(existingRematchRoom.participants).toHaveLength(2);
    expect(existingRematchRoom.participants[1].userId).toBe('user-2');
    expect(mockSave).toHaveBeenCalled();
  });

  it('throws NotFoundException when original room does not exist', async () => {
    (primaryModel.findOneAndUpdate as jest.Mock).mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    (primaryModel.findById as jest.Mock).mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      service.createRematchFromHistory(
        { roomId: 'missing-room', participantIds: [] },
        'user-1',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when user was not a participant in original room', async () => {
    const originalRoom = {
      _id: 'room-1',
      hostId: 'user-host',
      participants: [{ userId: 'user-host', joinedAt: new Date() }],
      gameOptions: {},
    };

    (primaryModel.findOneAndUpdate as jest.Mock).mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(originalRoom),
      }),
    });

    await expect(
      service.createRematchFromHistory(
        { roomId: 'room-1', participantIds: [] },
        'stranger',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('preserves bots in participants and does not invite bots when rematching a bot game', async () => {
    const originalRoom = {
      _id: 'room-1',
      gameId: 'tic_tac_toe_v1',
      name: 'Quick Match',
      hostId: 'user-1',
      visibility: 'public',
      maxPlayers: 2,
      participants: [
        { userId: 'user-1', joinedAt: new Date() },
        { userId: 'bot-12345', joinedAt: new Date() },
      ],
      gameOptions: {},
    };

    (primaryModel.findOneAndUpdate as jest.Mock).mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(originalRoom),
      }),
    });

    (primaryModel.find as jest.Mock).mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    let createdRoomData: Record<string, unknown> | null = null;
    (primaryModel.create as jest.Mock).mockImplementation(
      (data: Record<string, unknown>) => {
        createdRoomData = data;
        return Promise.resolve({
          _id: { toString: () => 'room-2' },
          toObject: () => ({ _id: 'room-2' }),
        });
      },
    );

    (primaryModel.updateOne as jest.Mock).mockReturnValue({
      catch: jest.fn(),
    });

    const result = await service.createRematchFromHistory(
      { roomId: 'room-1', participantIds: ['bot-12345'] },
      'user-1',
    );

    expect(result.id).toBe('room-2');
    expect(result.invitedIds).toEqual([]);
    expect(createdRoomData).not.toBeNull();
    const createdParticipants = (
      createdRoomData as unknown as { participants: { userId: string }[] }
    ).participants;
    expect(createdParticipants).toHaveLength(2);
    expect(createdParticipants[0].userId).toBe('user-1');
    expect(createdParticipants[1].userId).toBe('bot-12345');
    const createdOptions = (
      createdRoomData as unknown as {
        gameOptions: { rematchInvitedIds: string[] };
      }
    ).gameOptions;
    expect(createdOptions.rematchInvitedIds).toEqual([]);
  });
});
