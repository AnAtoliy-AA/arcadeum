import { Test, type TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import type { PipelineStage } from 'mongoose';
import { SoloScoresService } from './solo-scores.service';
import { SoloRatingService } from './solo-rating.service';
import { XpSettingsService } from '../xp/xp-settings.service';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';

describe('SoloScoresService', () => {
  let service: SoloScoresService;
  let capturedPipeline: PipelineStage[];

  const mockScoreModel = {
    aggregate: jest.fn().mockImplementation((pipeline: PipelineStage[]) => {
      capturedPipeline = pipeline;
      return {
        exec: jest
          .fn()
          .mockResolvedValue([{ entries: [], total: [{ count: 0 }] }]),
      };
    }),
  };

  beforeEach(async () => {
    capturedPipeline = [];
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoloScoresService,
        {
          provide: getModelToken('SoloScore', OCI_CONNECTION),
          useValue: mockScoreModel,
        },
        {
          provide: getModelToken('User', OCI_CONNECTION),
          useValue: {},
        },
        { provide: SoloRatingService, useValue: { recordResult: jest.fn() } },
        {
          provide: XpSettingsService,
          useValue: { getXpReward: jest.fn(), awardXp: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SoloScoresService>(SoloScoresService);
  });

  const sortStages = () =>
    capturedPipeline.filter(
      (stage): stage is PipelineStage.Sort => '$sort' in stage,
    );

  describe('getLeaderboard', () => {
    it('ranks by score and breaks ties by fastest time', async () => {
      await service.getLeaderboard('solitaire_v1', 'default', 'score', 'desc');

      const [recordSort, rankingSort] = sortStages();
      expect(recordSort.$sort).toEqual({ score: -1, durationMs: 1 });
      expect(rankingSort.$sort).toEqual({ bestScore: -1, bestDurationMs: 1 });
    });

    it('honours sortBy=durationMs with fastest first', async () => {
      await service.getLeaderboard(
        'minesweeper_v1',
        'beginner',
        'durationMs',
        'asc',
      );

      const [recordSort, rankingSort] = sortStages();
      expect(recordSort.$sort).toEqual({ durationMs: 1, score: -1 });
      expect(rankingSort.$sort).toEqual({
        bestDurationMs: 1,
        bestScore: -1,
      });
    });

    it('honours sortBy=durationMs with slowest first', async () => {
      await service.getLeaderboard(
        'minesweeper_v1',
        'beginner',
        'durationMs',
        'desc',
      );

      const [recordSort, rankingSort] = sortStages();
      expect(recordSort.$sort).toEqual({ durationMs: -1, score: -1 });
      expect(rankingSort.$sort).toEqual({
        bestDurationMs: -1,
        bestScore: -1,
      });
    });

    it('only matches won games', async () => {
      await service.getLeaderboard('sudoku_v1', 'easy', 'durationMs', 'asc');

      const [match] = capturedPipeline;
      expect(match).toEqual({
        $match: { gameId: 'sudoku_v1', difficulty: 'easy', result: 'won' },
      });
    });
  });
});
