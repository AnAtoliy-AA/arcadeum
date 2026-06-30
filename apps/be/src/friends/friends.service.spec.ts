import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Friendship } from './schemas/friendship.schema';
import { User } from '../auth/schemas/user.schema';
import { FriendsGateway } from './friends.gateway';

function makeLean<T>(value: T) {
  return jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(value),
  });
}

function makeFindChain<T>(value: T[]) {
  return {
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(value),
    }),
  };
}

describe('FriendsService', () => {
  const userId = '64a000000000000000000001';
  const targetId = '64a000000000000000000002';
  const friendshipId = '64a000000000000000000099';

  let service: FriendsService;
  let friendshipModel: Record<string, jest.Mock>;
  let userModel: Record<string, jest.Mock>;
  let gateway: { emitFriendRequest: jest.Mock; emitFriendAccepted: jest.Mock; emitFriendRemoved: jest.Mock };

  beforeEach(async () => {
    friendshipModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      deleteOne: jest.fn(),
    };
    userModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
    };
    gateway = {
      emitFriendRequest: jest.fn(),
      emitFriendAccepted: jest.fn(),
      emitFriendRemoved: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: getModelToken(Friendship.name), useValue: friendshipModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: FriendsGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get(FriendsService);
  });

  describe('sendRequest', () => {
    it('creates a pending friendship and emits friend:request', async () => {
      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(targetId), isBlocked: false }),
      });
      friendshipModel.findOne.mockResolvedValue(null);
      userModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(userId), blockedUsers: [] }),
      });
      friendshipModel.create.mockResolvedValue({ _id: new Types.ObjectId(friendshipId) });
      userModel.findById.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(userId), blockedUsers: [] }),
      }).mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(targetId), blockedUsers: [] }),
      }).mockReturnValue({
        lean: jest.fn().mockResolvedValue({ username: 'requester', displayName: 'Req' }),
      });

      const result = await service.sendRequest(userId, 'targetuser');

      expect(result.id).toBe(friendshipId);
      expect(friendshipModel.create).toHaveBeenCalled();
      expect(gateway.emitFriendRequest).toHaveBeenCalledWith(targetId, expect.objectContaining({
        friendshipId,
        requesterId: userId,
      }));
    });

    it('throws NotFoundException if target user not found', async () => {
      userModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await expect(service.sendRequest(userId, 'nobody')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for self-request', async () => {
      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(userId), isBlocked: false }),
      });

      await expect(service.sendRequest(userId, 'myself')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if target is blocked', async () => {
      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(targetId), isBlocked: true }),
      });

      await expect(service.sendRequest(userId, 'blocked')).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException if already friends', async () => {
      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(targetId), isBlocked: false }),
      });
      friendshipModel.findOne.mockResolvedValue({ status: 'accepted' });

      await expect(service.sendRequest(userId, 'friend')).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if request already pending', async () => {
      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(targetId), isBlocked: false }),
      });
      friendshipModel.findOne.mockResolvedValue({ status: 'pending' });

      await expect(service.sendRequest(userId, 'pending')).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException if either user has blocked the other', async () => {
      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(targetId), isBlocked: false }),
      });
      friendshipModel.findOne.mockResolvedValue(null);
      userModel.findById.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(userId), blockedUsers: [targetId] }),
      }).mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(targetId), blockedUsers: [] }),
      });

      await expect(service.sendRequest(userId, ' blocker')).rejects.toThrow(BadRequestException);
    });
  });

  describe('acceptRequest', () => {
    it('accepts a pending request and emits friend:accepted', async () => {
      const mockFriendship = {
        _id: new Types.ObjectId(friendshipId),
        addresseeId: new Types.ObjectId(userId),
        requesterId: new Types.ObjectId(targetId),
        status: 'pending',
        save: jest.fn(),
      };
      friendshipModel.findById.mockResolvedValue(mockFriendship);
      userModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ username: 'accepter', displayName: 'Acc' }),
      });

      await service.acceptRequest(userId, friendshipId);

      expect(mockFriendship.save).toHaveBeenCalled();
      expect(gateway.emitFriendAccepted).toHaveBeenCalledWith(targetId, expect.objectContaining({
        friendshipId,
        userId,
      }));
    });

    it('throws NotFoundException if friendship not found', async () => {
      friendshipModel.findById.mockResolvedValue(null);

      await expect(service.acceptRequest(userId, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if user is not the recipient', async () => {
      friendshipModel.findById.mockResolvedValue({
        _id: new Types.ObjectId(friendshipId),
        addresseeId: new Types.ObjectId('000000000000000000000099'),
        status: 'pending',
      });

      await expect(service.acceptRequest(userId, friendshipId)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if request is not pending', async () => {
      friendshipModel.findById.mockResolvedValue({
        _id: new Types.ObjectId(friendshipId),
        addresseeId: new Types.ObjectId(userId),
        status: 'accepted',
      });

      await expect(service.acceptRequest(userId, friendshipId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('declineRequest', () => {
    it('deletes a pending request', async () => {
      friendshipModel.findById.mockResolvedValue({
        _id: new Types.ObjectId(friendshipId),
        addresseeId: new Types.ObjectId(userId),
        status: 'pending',
      });
      friendshipModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await service.declineRequest(userId, friendshipId);

      expect(friendshipModel.deleteOne).toHaveBeenCalledWith({ _id: expect.anything() });
    });

    it('throws NotFoundException if friendship not found', async () => {
      friendshipModel.findById.mockResolvedValue(null);

      await expect(service.declineRequest(userId, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if user is not the recipient', async () => {
      friendshipModel.findById.mockResolvedValue({
        _id: new Types.ObjectId(friendshipId),
        addresseeId: new Types.ObjectId('000000000000000000000099'),
        status: 'pending',
      });

      await expect(service.declineRequest(userId, friendshipId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFriend', () => {
    it('deletes the friendship and emits friend:removed', async () => {
      friendshipModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await service.removeFriend(userId, targetId);

      expect(friendshipModel.deleteOne).toHaveBeenCalledWith(expect.objectContaining({
        status: 'accepted',
      }));
      expect(gateway.emitFriendRemoved).toHaveBeenCalledWith(targetId, userId);
    });

    it('throws NotFoundException if not friends', async () => {
      friendshipModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(service.removeFriend(userId, targetId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFriends', () => {
    it('returns friends with online status', async () => {
      friendshipModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { requesterId: new Types.ObjectId(userId), addresseeId: new Types.ObjectId(targetId) },
        ]),
      });
      userModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: new Types.ObjectId(targetId), username: 'friend1', displayName: 'Friend', equippedAvatarId: 'av1' },
        ]),
      });

      service.setUserOnline(targetId);
      const result = await service.getFriends(userId);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(targetId);
      expect(result[0].online).toBe(true);
      expect(result[0].username).toBe('friend1');
    });

    it('returns empty array when no friends', async () => {
      friendshipModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getFriends(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getPendingRequests', () => {
    it('returns incoming and outgoing requests', async () => {
      const incomingQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { _id: new Types.ObjectId(friendshipId), requesterId: new Types.ObjectId(targetId), addresseeId: new Types.ObjectId(userId), status: 'pending', createdAt: new Date() },
        ]),
      };
      const outgoingQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      friendshipModel.find.mockReturnValueOnce(incomingQuery).mockReturnValueOnce(outgoingQuery);
      userModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: new Types.ObjectId(targetId), username: 'sender', displayName: 'Sender', equippedAvatarId: null },
        ]),
      });

      const result = await service.getPendingRequests(userId);

      expect(result.incoming).toHaveLength(1);
      expect(result.outgoing).toHaveLength(0);
      expect(result.incoming[0].username).toBe('sender');
    });
  });

  describe('getOnlineFriendIds', () => {
    it('returns only online friend IDs', async () => {
      friendshipModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { requesterId: new Types.ObjectId(userId), addresseeId: new Types.ObjectId(targetId) },
        ]),
      });

      service.setUserOnline(targetId);
      const result = await service.getOnlineFriendIds(userId);

      expect(result).toEqual([targetId]);
    });

    it('returns empty when no friends online', async () => {
      friendshipModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { requesterId: new Types.ObjectId(userId), addresseeId: new Types.ObjectId(targetId) },
        ]),
      });

      const result = await service.getOnlineFriendIds(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getFriendIds', () => {
    it('returns all friend IDs', async () => {
      friendshipModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { requesterId: new Types.ObjectId(userId), addresseeId: new Types.ObjectId(targetId) },
        ]),
      });

      const result = await service.getFriendIds(userId);

      expect(result).toEqual([targetId]);
    });
  });

  describe('online tracking', () => {
    it('tracks online/offline status', () => {
      expect(service.isUserOnline(userId)).toBe(false);
      service.setUserOnline(userId);
      expect(service.isUserOnline(userId)).toBe(true);
      service.setUserOffline(userId);
      expect(service.isUserOnline(userId)).toBe(false);
    });
  });
});
