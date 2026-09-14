import { Test, type TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SoloRatingService } from './solo-rating.service';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';

describe('SoloRatingService', () => {
  let service: SoloRatingService;
  let mockRatingModel: Record<string, jest.Mock>;
  let mockUserModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRatingModel = {
      findOne: jest.fn().mockReturnValue({
        lean: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      }),
      findOneAndUpdate: jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ rating: 1210, tier: 'bronze', _id: '1' }),
      }),
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
      updateOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(undefined) }),
    };

    mockUserModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoloRatingService,
        {
          provide: getModelToken('SoloRating', OCI_CONNECTION),
          useValue: mockRatingModel,
        },
        {
          provide: getModelToken('User', OCI_CONNECTION),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<SoloRatingService>(SoloRatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordResult', () => {
    it('should calculate positive delta for win without undo', async () => {
      const result = await service.recordResult({
        userId: 'user1',
        difficulty: 'default',
        won: true,
        usedUndo: false,
      });

      expect(result.delta).toBe(10);
      expect(result.rating).toBe(1210);
    });

    it('should calculate half delta for win with undo', async () => {
      mockRatingModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ rating: 1205, tier: 'bronze', _id: '1' }),
      });

      const result = await service.recordResult({
        userId: 'user1',
        difficulty: 'default',
        won: true,
        usedUndo: true,
      });

      expect(result.delta).toBe(5);
    });

    it('should calculate negative delta for loss', async () => {
      mockRatingModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ rating: 1190, tier: 'bronze', _id: '1' }),
      });

      const result = await service.recordResult({
        userId: 'user1',
        difficulty: 'hard',
        won: false,
        usedUndo: false,
      });

      expect(result.delta).toBe(-16);
    });

    it('should use difficulty-based scaling', async () => {
      const easy = await service.recordResult({
        userId: 'user1',
        difficulty: 'easy',
        won: true,
        usedUndo: false,
      });
      expect(easy.delta).toBe(6);

      mockRatingModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ rating: 1216, tier: 'bronze', _id: '1' }),
      });

      const hard = await service.recordResult({
        userId: 'user1',
        difficulty: 'hard',
        won: true,
        usedUndo: false,
      });
      expect(hard.delta).toBe(16);
    });
  });

  describe('getRating', () => {
    it('should return default rating for new user', async () => {
      const rating = await service.getRating('new-user');
      expect(rating).toEqual({
        rating: 1200,
        tier: 'bronze',
        peakRating: 1200,
        wins: 0,
        losses: 0,
        winsWithUndo: 0,
        lossesWithUndo: 0,
        totalGames: 0,
      });
    });

    it('should return existing rating', async () => {
      mockRatingModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            rating: 1350,
            tier: 'gold',
            peakRating: 1400,
            wins: 20,
            losses: 10,
            winsWithUndo: 5,
            lossesWithUndo: 3,
            totalGames: 30,
          }),
        }),
      });

      const rating = await service.getRating('user1');
      expect(rating?.rating).toBe(1350);
      expect(rating?.tier).toBe('gold');
    });
  });
});
