import { Test, TestingModule } from '@nestjs/testing';
import { ImplementProcessor } from './implement.processor';
import { getQueueToken } from '@nestjs/bull';
import { Job } from 'bull';
import { ImplementJobData } from '../queue/implement-queue.service';
import { ReviewQueueService } from '../queue/review-queue.service';
import { GitHubService } from '../github/github.service';

describe('ImplementProcessor', () => {
  let processor: ImplementProcessor;
  let mockReviewQueue: jest.Mocked<ReviewQueueService>;

  beforeEach(async () => {
    mockReviewQueue = {
      addJob: jest.fn().mockResolvedValue('1'),
      getQueueStats: jest.fn(),
    } as unknown as jest.Mocked<ReviewQueueService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImplementProcessor,
        { provide: getQueueToken('implementation'), useValue: {} },
        { provide: ReviewQueueService, useValue: mockReviewQueue },
        { provide: GitHubService, useValue: { implementLocally: jest.fn() } },
      ],
    }).compile();

    processor = module.get<ImplementProcessor>(ImplementProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('onCompleted', () => {
    it('should auto-queue review when implementation succeeds with PR', async () => {
      const job = {
        id: '1',
        data: {
          issueNum: '123',
          engine: 'mimo',
          chatId: 123456,
          userId: 789,
        },
      } as unknown as Job<ImplementJobData>;

      const result = {
        success: true,
        message: 'PR created: https://github.com/test/pr/1',
      };

      await processor.onCompleted(job, result);

      expect(mockReviewQueue.addJob).toHaveBeenCalledWith(
        '123',
        'mimo',
        123456,
        789,
        'https://github.com/test/pr/1',
      );
    });

    it('should not queue review when implementation fails', async () => {
      const job = {
        id: '1',
        data: {
          issueNum: '123',
          engine: 'mimo',
          chatId: 123456,
          userId: 789,
        },
      } as unknown as Job<ImplementJobData>;

      const result = {
        success: false,
        message: 'Implementation failed: error',
      };

      await processor.onCompleted(job, result);

      expect(mockReviewQueue.addJob).not.toHaveBeenCalled();
    });

    it('should not queue review when no PR created', async () => {
      const job = {
        id: '1',
        data: {
          issueNum: '123',
          engine: 'mimo',
          chatId: 123456,
          userId: 789,
        },
      } as unknown as Job<ImplementJobData>;

      const result = {
        success: true,
        message: 'No changes to commit',
      };

      await processor.onCompleted(job, result);

      expect(mockReviewQueue.addJob).not.toHaveBeenCalled();
    });
  });
});
