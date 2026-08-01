import { Test, TestingModule } from '@nestjs/testing';
import { ReviewQueueService } from './review-queue.service';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';

describe('ReviewQueueService', () => {
  let service: ReviewQueueService;
  let mockQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: '1' }),
      getWaitingCount: jest.fn().mockResolvedValue(0),
      getActiveCount: jest.fn().mockResolvedValue(0),
      getCompletedCount: jest.fn().mockResolvedValue(0),
      getFailedCount: jest.fn().mockResolvedValue(0),
    } as unknown as jest.Mocked<Queue>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewQueueService,
        { provide: getQueueToken('review'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ReviewQueueService>(ReviewQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addJob', () => {
    it('should add a review job to the queue', async () => {
      const result = await service.addJob(
        '123',
        'opencode',
        123456,
        789,
        'https://github.com/test/pr/1',
      );

      expect(mockQueue.add).toHaveBeenCalledWith(
        {
          issueNum: '123',
          engine: 'opencode',
          chatId: 123456,
          userId: 789,
          prUrl: 'https://github.com/test/pr/1',
        },
        expect.objectContaining({
          attempts: 2,
          removeOnComplete: 50,
          removeOnFail: 20,
        }),
      );
      expect(result).toBe('1');
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      const stats = await service.getQueueStats();

      expect(stats).toEqual({
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      });
      expect(mockQueue.getWaitingCount).toHaveBeenCalled();
      expect(mockQueue.getActiveCount).toHaveBeenCalled();
      expect(mockQueue.getCompletedCount).toHaveBeenCalled();
      expect(mockQueue.getFailedCount).toHaveBeenCalled();
    });
  });
});
