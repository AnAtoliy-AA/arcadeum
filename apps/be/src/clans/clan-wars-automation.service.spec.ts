import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClanWarsAutomationService } from './clan-wars-automation.service';
import { ClanWarsService } from './clan-wars.service';

describe('ClanWarsAutomationService', () => {
  let service: ClanWarsAutomationService;

  const mockClanWarModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockClanModel = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  const mockClanMemberModel = {
    findOne: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockClanWarsService = {
    recordWarMatch: jest.fn(),
  };

  const mockClansGateway = {
    emitClanWarUpdated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClanWarsAutomationService,
        { provide: getModelToken('ClanWar'), useValue: mockClanWarModel },
        { provide: getModelToken('Clan'), useValue: mockClanModel },
        { provide: getModelToken('ClanMember'), useValue: mockClanMemberModel },
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: ClanWarsService, useValue: mockClanWarsService },
        { provide: 'ClansGateway', useValue: mockClansGateway },
      ],
    }).compile();

    service = module.get<ClanWarsAutomationService>(ClanWarsAutomationService);
    jest.clearAllMocks();
  });

  describe('resolveMatchForPlayers', () => {
    it('returns null if player IDs are invalid', async () => {
      const result = await service.resolveMatchForPlayers(
        'invalid',
        'invalid2',
        'chess',
      );
      expect(result).toBeNull();
    });

    it('returns null if either player is not in a clan', async () => {
      const winnerId = new Types.ObjectId().toString();
      const loserId = new Types.ObjectId().toString();

      mockClanMemberModel.findOne
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(null),
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(null),
        });

      const result = await service.resolveMatchForPlayers(
        winnerId,
        loserId,
        'chess',
      );
      expect(result).toBeNull();
    });

    it('returns null if both players belong to the same clan', async () => {
      const winnerId = new Types.ObjectId().toString();
      const loserId = new Types.ObjectId().toString();
      const sameClanId = new Types.ObjectId();

      mockClanMemberModel.findOne
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ clanId: sameClanId }),
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ clanId: sameClanId }),
        });

      const result = await service.resolveMatchForPlayers(
        winnerId,
        loserId,
        'chess',
      );
      expect(result).toBeNull();
    });

    it('returns null if no active war exists between the clans', async () => {
      const winnerId = new Types.ObjectId().toString();
      const loserId = new Types.ObjectId().toString();
      const winnerClanId = new Types.ObjectId();
      const loserClanId = new Types.ObjectId();

      mockClanMemberModel.findOne
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ clanId: winnerClanId }),
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ clanId: loserClanId }),
        });

      mockClanWarModel.findOne.mockResolvedValue(null);

      const result = await service.resolveMatchForPlayers(
        winnerId,
        loserId,
        'chess',
      );
      expect(result).toBeNull();
    });

    it('records match and returns updated war when active war exists', async () => {
      const winnerId = new Types.ObjectId();
      const loserId = new Types.ObjectId();
      const winnerClanId = new Types.ObjectId();
      const loserClanId = new Types.ObjectId();
      const warId = new Types.ObjectId();

      mockClanMemberModel.findOne
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ clanId: winnerClanId }),
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ clanId: loserClanId }),
        });

      mockClanWarModel.findOne.mockResolvedValue({
        _id: warId,
        gameId: 'all',
      });

      mockUserModel.findById
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ username: 'WinnerPro' }),
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ username: 'LoserNoob' }),
        });

      mockClanWarsService.recordWarMatch.mockResolvedValue({
        id: warId.toString(),
        initiatorScore: 1,
        targetClanScore: 0,
      });

      const result = await service.resolveMatchForPlayers(
        winnerId.toString(),
        loserId.toString(),
        'sea-battle',
      );

      expect(mockClanWarsService.recordWarMatch).toHaveBeenCalledWith(
        warId.toString(),
        expect.objectContaining({
          winningClanId: winnerClanId.toString(),
          winnerName: 'WinnerPro',
          loserClanId: loserClanId.toString(),
          loserName: 'LoserNoob',
          gameId: 'sea-battle',
        }),
      );
      expect(result).toEqual(expect.objectContaining({ id: warId.toString() }));
    });
  });

  describe('expirePendingAndActiveWars', () => {
    it('completes active wars past expiration date and declines stale pending wars', async () => {
      const initClanId = new Types.ObjectId();
      const targetClanId = new Types.ObjectId();
      const warDoc = {
        _id: new Types.ObjectId(),
        initiatorClanId: initClanId,
        targetClanId: targetClanId,
        initiatorScore: 4,
        targetClanScore: 2,
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };

      const pendingDoc = {
        _id: new Types.ObjectId(),
        initiatorClanId: initClanId,
        targetClanId: targetClanId,
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      mockClanWarModel.find
        .mockResolvedValueOnce([warDoc])
        .mockResolvedValueOnce([pendingDoc]);

      mockClanWarModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: warDoc._id,
          initiatorClanId: initClanId,
          initiatorClanName: 'Init',
          initiatorClanTag: 'INI',
          initiatorScore: 4,
          targetClanId: targetClanId,
          targetClanName: 'Target',
          targetClanTag: 'TRG',
          targetClanScore: 2,
          targetScore: 5,
          gameId: 'all',
          status: 'completed',
          winnerClanId: initClanId,
          expiresAt: new Date(),
          createdAt: new Date(),
          matchLogs: [],
        }),
      });

      const result = await service.expirePendingAndActiveWars();

      expect(warDoc.status).toBe('completed');
      expect(warDoc.winnerClanId).toEqual(initClanId);
      expect(warDoc.save).toHaveBeenCalled();
      expect(pendingDoc.status).toBe('declined');
      expect(pendingDoc.save).toHaveBeenCalled();
      expect(result.expiredActiveCount).toBe(1);
      expect(result.expiredPendingCount).toBe(1);
    });
  });

  describe('matchmakeClanWar', () => {
    it('throws ForbiddenException if user is not clan leader or officer', async () => {
      const clanId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      mockClanMemberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ role: 'member' }),
      });

      await expect(service.matchmakeClanWar(userId, clanId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws BadRequestException if clan already has an active war', async () => {
      const clanId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      mockClanMemberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ role: 'leader' }),
      });

      mockClanModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: 'Alpha', tag: 'ALP' }),
      });

      mockClanWarModel.findOne.mockResolvedValue({ status: 'active' });

      await expect(service.matchmakeClanWar(userId, clanId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates war challenge against top eligible opponent', async () => {
      const clanId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      const oppClanId = new Types.ObjectId();
      const warId = new Types.ObjectId();

      mockClanMemberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ role: 'leader' }),
      });

      mockClanModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: 'Alpha', tag: 'ALP' }),
      });

      mockClanWarModel.findOne.mockResolvedValue(null);

      mockClanModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest
          .fn()
          .mockResolvedValue([{ _id: oppClanId, name: 'Bravo', tag: 'BRV' }]),
      });

      mockClanWarModel.create.mockResolvedValue({ _id: warId });
      mockClanWarModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: warId,
          initiatorClanId: clanId,
          initiatorClanName: 'Alpha',
          initiatorClanTag: 'ALP',
          initiatorScore: 0,
          targetClanId: oppClanId,
          targetClanName: 'Bravo',
          targetClanTag: 'BRV',
          targetClanScore: 0,
          targetScore: 5,
          gameId: 'all',
          status: 'active',
          winnerClanId: null,
          expiresAt: new Date(),
          createdAt: new Date(),
          matchLogs: [],
        }),
      });

      const result = await service.matchmakeClanWar(
        userId.toString(),
        clanId.toString(),
      );

      expect(result.id).toBe(warId.toString());
      expect(result.targetClanName).toBe('Bravo');
      expect(mockClanWarModel.create).toHaveBeenCalled();
    });
  });
});
