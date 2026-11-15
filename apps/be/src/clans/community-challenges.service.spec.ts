import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CommunityChallengesService } from './community-challenges.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CommunityChallengesService', () => {
  let service: CommunityChallengesService;

  const mockChallengeModel = {
    countDocuments: jest.fn(),
    insertMany: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityChallengesService,
        {
          provide: getModelToken('CommunityChallenge'),
          useValue: mockChallengeModel,
        },
      ],
    }).compile();

    service = module.get<CommunityChallengesService>(
      CommunityChallengesService,
    );
    jest.clearAllMocks();
  });

  describe('getActiveChallenges', () => {
    it('should seed default challenges if empty', async () => {
      mockChallengeModel.countDocuments.mockResolvedValue(0);
      mockChallengeModel.insertMany.mockResolvedValue([]);

      const mockChallenge = {
        _id: new Types.ObjectId(),
        title: 'Armada Vanguard',
        description: 'Sink ships',
        gameId: 'sea-battle',
        target: 5000,
        currentProgress: 2500,
        participantsCount: 50,
        rewardTitle: 'Fleet Admiral',
        rewardBadge: 'badge_admiral',
        startDate: new Date(),
        endDate: new Date(),
        status: 'active',
      };

      mockChallengeModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockChallenge]),
      });

      const result = await service.getActiveChallenges();

      expect(mockChallengeModel.insertMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].progressPercent).toBe(50);
      expect(result[0].title).toBe('Armada Vanguard');
    });
  });

  describe('contributeToChallenge', () => {
    it('should throw NotFoundException for invalid id', async () => {
      await expect(
        service.contributeToChallenge('invalid-id', 5),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if challenge is not active', async () => {
      const challengeId = new Types.ObjectId();
      mockChallengeModel.findById.mockResolvedValue({
        status: 'completed',
      });

      await expect(
        service.contributeToChallenge(challengeId.toString(), 5),
      ).rejects.toThrow(BadRequestException);
    });

    it('should increment progress and participants', async () => {
      const challengeId = new Types.ObjectId();
      const mockDoc = {
        _id: challengeId,
        title: 'Armada Vanguard',
        description: 'Sink ships',
        gameId: 'sea-battle',
        target: 100,
        currentProgress: 90,
        participantsCount: 10,
        rewardTitle: 'Fleet Admiral',
        rewardBadge: 'badge_admiral',
        startDate: new Date(),
        endDate: new Date(),
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };

      mockChallengeModel.findById.mockResolvedValue(mockDoc);

      const result = await service.contributeToChallenge(
        challengeId.toString(),
        10,
      );

      expect(mockDoc.currentProgress).toBe(100);
      expect(mockDoc.participantsCount).toBe(11);
      expect(mockDoc.status).toBe('completed');
      expect(mockDoc.save).toHaveBeenCalled();
      expect(result.progressPercent).toBe(100);
    });
  });
});
