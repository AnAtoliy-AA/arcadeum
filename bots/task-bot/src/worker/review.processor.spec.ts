import { Test, TestingModule } from '@nestjs/testing';
import { ReviewProcessor } from './review.processor';
import { getQueueToken } from '@nestjs/bull';
import { Job } from 'bull';
import { ReviewJobData } from '../queue/review-queue.service';

describe('ReviewProcessor', () => {
  let processor: ReviewProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewProcessor,
        { provide: getQueueToken('review'), useValue: {} },
      ],
    }).compile();

    processor = module.get<ReviewProcessor>(ReviewProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleReview', () => {
    it('should fail with invalid PR URL', async () => {
      const job = {
        id: '1',
        data: {
          issueNum: '123',
          engine: 'mimo',
          chatId: 123456,
          userId: 789,
          prUrl: 'invalid-url',
        },
        progress: jest.fn(),
      } as unknown as Job<ReviewJobData>;

      const result = await processor.handleReview(job);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid PR URL');
    });
  });
});
