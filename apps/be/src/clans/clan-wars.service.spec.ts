import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ClanWarsService } from './clan-wars.service';

describe('ClanWarsService', () => {
  let service: ClanWarsService;

  const mockClanWarModel = {
    countDocuments: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
  };

  const mockClanModel = {
    findById: jest.fn(),
  };

  const mockClanMemberModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClanWarsService,
        { provide: getModelToken('ClanWar'), useValue: mockClanWarModel },
        { provide: getModelToken('Clan'), useValue: mockClanModel },
        { provide: getModelToken('ClanMember'), useValue: mockClanMemberModel },
      ],
    }).compile();

    service = module.get<ClanWarsService>(ClanWarsService);
    jest.clearAllMocks();
  });

  describe('getActiveWars', () => {
    it('returns active clan wars list', async () => {
      mockClanWarModel.countDocuments.mockResolvedValue(1);
      const warId = new Types.ObjectId();
      const initId = new Types.ObjectId();
      const targetId = new Types.ObjectId();

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          {
            _id: warId,
            initiatorClanId: initId,
            initiatorClanName: 'Knights',
            initiatorClanTag: 'KNG',
            initiatorScore: 3,
            targetClanId: targetId,
            targetClanName: 'Dragons',
            targetClanTag: 'DRG',
            targetClanScore: 2,
            targetScore: 5,
            gameId: 'sea-battle',
            status: 'active',
            winnerClanId: null,
            expiresAt: new Date(),
            createdAt: new Date(),
            matchLogs: [],
          },
        ]),
      };

      mockClanWarModel.find.mockReturnValue(mockQuery);

      const result = await service.getActiveWars();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(warId.toString());
      expect(result[0].initiatorClanName).toBe('Knights');
      expect(result[0].targetClanName).toBe('Dragons');
    });

    it('seeds default wars if empty', async () => {
      mockClanWarModel.countDocuments.mockResolvedValue(0);
      mockClanWarModel.create.mockResolvedValue({});

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      mockClanWarModel.find.mockReturnValue(mockQuery);

      await service.getActiveWars();

      expect(mockClanWarModel.create).toHaveBeenCalled();
    });
  });

  describe('getWarById', () => {
    it('throws BadRequestException on invalid warId', async () => {
      await expect(service.getWarById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException if war does not exist', async () => {
      const validId = new Types.ObjectId().toString();
      mockClanWarModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getWarById(validId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns war view when found', async () => {
      const warId = new Types.ObjectId();
      const initId = new Types.ObjectId();
      const targetId = new Types.ObjectId();

      mockClanWarModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: warId,
          initiatorClanId: initId,
          initiatorClanName: 'Knights',
          initiatorClanTag: 'KNG',
          initiatorScore: 1,
          targetClanId: targetId,
          targetClanName: 'Dragons',
          targetClanTag: 'DRG',
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

      const res = await service.getWarById(warId.toString());
      expect(res.id).toBe(warId.toString());
      expect(res.initiatorClanName).toBe('Knights');
    });
  });

  describe('createWarChallenge', () => {
    it('throws BadRequestException if user tries to declare war on own clan', async () => {
      const clanId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      await expect(
        service.createWarChallenge(userId, clanId, { targetClanId: clanId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if user is only regular member', async () => {
      const userClanId = new Types.ObjectId().toString();
      const targetClanId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      mockClanMemberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ role: 'member' }),
      });

      await expect(
        service.createWarChallenge(userId, userClanId, { targetClanId }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates war successfully when initiated by leader', async () => {
      const userClanId = new Types.ObjectId().toString();
      const targetClanId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const newWarId = new Types.ObjectId();

      mockClanMemberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ role: 'leader' }),
      });

      mockClanModel.findById
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ name: 'Alpha Clan', tag: 'ALP' }),
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ name: 'Beta Clan', tag: 'BET' }),
        });

      mockClanWarModel.findOne.mockResolvedValue(null);
      mockClanWarModel.create.mockResolvedValue({ _id: newWarId });
      mockClanWarModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: newWarId,
          initiatorClanId: new Types.ObjectId(userClanId),
          initiatorClanName: 'Alpha Clan',
          initiatorClanTag: 'ALP',
          initiatorScore: 0,
          targetClanId: new Types.ObjectId(targetClanId),
          targetClanName: 'Beta Clan',
          targetClanTag: 'BET',
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

      const res = await service.createWarChallenge(userId, userClanId, {
        targetClanId,
        targetScore: 5,
      });

      expect(res.initiatorClanName).toBe('Alpha Clan');
      expect(res.targetClanName).toBe('Beta Clan');
      expect(res.status).toBe('active');
    });
  });

  describe('recordWarMatch', () => {
    it('increments score and marks completed if target score reached', async () => {
      const warId = new Types.ObjectId();
      const initId = new Types.ObjectId();
      const targetId = new Types.ObjectId();

      const warDoc = {
        _id: warId,
        initiatorClanId: initId,
        initiatorScore: 4,
        targetClanId: targetId,
        targetClanScore: 2,
        targetScore: 5,
        status: 'active',
        winnerClanId: null,
        gameId: 'chess',
        matchLogs: [],
        save: jest.fn().mockResolvedValue(true),
      };

      mockClanWarModel.findById
        .mockResolvedValueOnce(warDoc)
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({
            _id: warId,
            initiatorClanId: initId,
            initiatorClanName: 'Knights',
            initiatorClanTag: 'KNG',
            initiatorScore: 5,
            targetClanId: targetId,
            targetClanName: 'Dragons',
            targetClanTag: 'DRG',
            targetClanScore: 2,
            targetScore: 5,
            gameId: 'chess',
            status: 'completed',
            winnerClanId: initId,
            expiresAt: new Date(),
            createdAt: new Date(),
            matchLogs: [
              {
                id: 'log-1',
                playerClanId: initId.toString(),
                playerName: 'Champion',
                opponentClanId: targetId.toString(),
                opponentName: 'Contender',
                gameId: 'chess',
                winnerClanId: initId.toString(),
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });

      const result = await service.recordWarMatch(warId.toString(), {
        winningClanId: initId.toString(),
        winnerName: 'Champion',
        loserClanId: targetId.toString(),
        loserName: 'Contender',
        gameId: 'chess',
      });

      expect(warDoc.save).toHaveBeenCalled();
      expect(warDoc.initiatorScore).toBe(5);
      expect(warDoc.status).toBe('completed');
      expect(warDoc.winnerClanId).toEqual(initId);
      expect(result.status).toBe('completed');
    });
  });
});
