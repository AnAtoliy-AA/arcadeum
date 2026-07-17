import { Test, TestingModule } from '@nestjs/testing';
import { ImplementProcessor } from './implement.processor';
import { Job } from 'bull';
import { ImplementJobData } from '../queue/implement-queue.service';
import { ReviewQueueService } from '../queue/review-queue.service';
import { GitHubService } from '../github/github.service';
import { NotificationService } from '../notification/notification.service';

describe('ImplementProcessor', () => {
  let processor: ImplementProcessor;
  let mockGitHubService: jest.Mocked<GitHubService>;
  let mockReviewQueue: jest.Mocked<ReviewQueueService>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    mockGitHubService = {
      createWorktree: jest.fn().mockReturnValue('/tmp/task-bot/test'),
      removeWorktree: jest.fn(),
      implementLocally: jest.fn().mockResolvedValue({ success: true, message: 'Done', branchName: 'task-123-test' }),
      fixPR: jest.fn().mockResolvedValue({ success: true, message: 'Fixed', branchName: 'pr-branch' }),
      checkAndFixCI: jest.fn().mockResolvedValue({ success: true, message: 'CI fixed', branchName: 'ci-branch' }),
      pushBranch: jest.fn().mockReturnValue({ success: true, message: 'Pushed' }),
      createPR: jest.fn().mockReturnValue({ success: true, prUrl: 'https://github.com/test/pr/1' }),
    } as unknown as jest.Mocked<GitHubService>;

    mockReviewQueue = {
      addJob: jest.fn().mockResolvedValue('1'),
    } as unknown as jest.Mocked<ReviewQueueService>;

    mockNotificationService = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImplementProcessor,
        { provide: GitHubService, useValue: mockGitHubService },
        { provide: ReviewQueueService, useValue: mockReviewQueue },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    processor = module.get<ImplementProcessor>(ImplementProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleJob', () => {
    it('should create worktree, run implement, push, and create PR', async () => {
      const job = {
        id: '1',
        data: {
          issueNum: '123',
          engine: 'mimo',
          chatId: 123456,
          userId: 789,
          type: 'implement' as const,
          issueTitle: 'Test Issue',
          issueBody: '## Requirements\n- [ ] Do something',
        },
        progress: jest.fn().mockResolvedValue(undefined),
      } as unknown as Job<ImplementJobData>;

      const result = await processor.handleJob(job);

      expect(mockGitHubService.createWorktree).toHaveBeenCalledWith('1');
      expect(mockGitHubService.implementLocally).toHaveBeenCalledWith(
        '123',
        'mimo',
        '/tmp/task-bot/test',
        { title: 'Test Issue', body: '## Requirements\n- [ ] Do something' },
      );
      expect(mockGitHubService.pushBranch).toHaveBeenCalledWith('task-123-test', '/tmp/task-bot/test');
      expect(mockGitHubService.createPR).toHaveBeenCalledWith('123', 'task-123-test', '/tmp/task-bot/test');
      expect(mockGitHubService.removeWorktree).toHaveBeenCalledWith('1');
      expect(result.success).toBe(true);
    });

    it('should handle fix job type', async () => {
      const job = {
        id: '2',
        data: {
          issueNum: '456',
          engine: 'mimo',
          chatId: 123456,
          userId: 789,
          type: 'fix' as const,
          prNumber: '10',
          prBranchName: 'fix-branch',
        },
        progress: jest.fn().mockResolvedValue(undefined),
      } as unknown as Job<ImplementJobData>;

      const result = await processor.handleJob(job);

      expect(mockGitHubService.fixPR).toHaveBeenCalledWith(
        '10',
        'mimo',
        '/tmp/task-bot/test',
        { branchName: 'fix-branch', failedChecks: undefined, reviewComments: undefined },
      );
      expect(mockGitHubService.createPR).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle ci-fix job type', async () => {
      const job = {
        id: '3',
        data: {
          issueNum: '789',
          engine: 'mimo',
          chatId: 123456,
          userId: 789,
          type: 'ci-fix' as const,
          prNumber: '20',
          prBranchName: 'ci-branch',
          prFailedChecks: [{ name: 'lint', state: 'FAILURE', link: 'http://example.com' }],
        },
        progress: jest.fn().mockResolvedValue(undefined),
      } as unknown as Job<ImplementJobData>;

      const result = await processor.handleJob(job);

      expect(mockGitHubService.checkAndFixCI).toHaveBeenCalledWith(
        '20',
        'mimo',
        '/tmp/task-bot/test',
        {
          branchName: 'ci-branch',
          failedChecks: [{ name: 'lint', state: 'FAILURE', link: 'http://example.com' }],
        },
      );
      expect(result.success).toBe(true);
    });

    it('should clean up worktree even on failure', async () => {
      mockGitHubService.implementLocally.mockRejectedValueOnce(new Error('Boom'));

      const job = {
        id: '4',
        data: {
          issueNum: '999',
          engine: 'mimo',
          chatId: 123456,
          userId: 789,
          type: 'implement' as const,
          issueTitle: 'Fail Issue',
          issueBody: 'body',
        },
        progress: jest.fn().mockResolvedValue(undefined),
      } as unknown as Job<ImplementJobData>;

      const result = await processor.handleJob(job);

      expect(mockGitHubService.removeWorktree).toHaveBeenCalledWith('4');
      expect(result.success).toBe(false);
    });

    it('should auto-queue review after successful implement', async () => {
      const job = {
        id: '5',
        data: {
          issueNum: '111',
          engine: 'mimo',
          chatId: 123456,
          userId: 789,
          type: 'implement' as const,
          issueTitle: 'Review Test',
          issueBody: 'body',
        },
        progress: jest.fn().mockResolvedValue(undefined),
      } as unknown as Job<ImplementJobData>;

      await processor.handleJob(job);

      expect(mockReviewQueue.addJob).toHaveBeenCalledWith(
        '111',
        'mimo',
        123456,
        789,
        'https://github.com/test/pr/1',
      );
    });
  });
});
