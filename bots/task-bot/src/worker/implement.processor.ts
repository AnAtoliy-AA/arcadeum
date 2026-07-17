import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { GitHubService } from '../github/github.service';
import { ImplementJobData } from '../queue/implement-queue.service';
import { ReviewQueueService } from '../queue/review-queue.service';
import { NotificationService } from '../notification/notification.service';

const concurrency = parseInt(process.env.WORKER_CONCURRENCY ?? '5', 10);

@Processor('implementation')
export class ImplementProcessor {
  private readonly logger = new Logger(ImplementProcessor.name);

  constructor(
    private readonly githubService: GitHubService,
    private readonly reviewQueue: ReviewQueueService,
    private readonly notificationService: NotificationService,
  ) {}

  @Process({ concurrency })
  async handleJob(job: Job<ImplementJobData>): Promise<{
    success: boolean;
    message: string;
    branchName?: string;
  }> {
    const { issueNum, engine, type } = job.data;
    this.logger.log(
      `Processing job ${job.id}: ${type} on #${issueNum} with ${engine}`,
    );

    await job.progress(5);

    const jobId = String(job.id);
    let cwd: string | null = null;

    try {
      cwd = this.githubService.createWorktree(jobId);
      await job.progress(10);

      let result: { success: boolean; message: string; branchName?: string };

      switch (type) {
        case 'implement':
          result = await this.handleImplement(job, cwd);
          break;
        case 'fix':
          result = await this.handleFix(job, cwd);
          break;
        case 'ci-fix':
          result = await this.handleCIFix(job, cwd);
          break;
        default:
          result = { success: false, message: `Unknown job type: ${type}` };
      }

      await job.progress(80);

      if (result.branchName && result.success) {
        await this.postProcess(job, result.branchName, cwd);
      }

      await job.progress(100);

      this.logger.log(
        `Job ${job.id} completed: ${result.success ? 'success' : 'failed'} - ${result.message}`,
      );

      return result;
    } catch (err) {
      this.logger.error(`Job ${job.id} failed: ${(err as Error).message}`);
      return { success: false, message: (err as Error).message };
    } finally {
      if (cwd) {
        this.githubService.removeWorktree(jobId);
      }
    }
  }

  private async handleImplement(
    job: Job<ImplementJobData>,
    cwd: string,
  ): Promise<{ success: boolean; message: string; branchName?: string }> {
    const { issueNum, engine, issueTitle, issueBody } = job.data;

    if (!issueTitle || !issueBody) {
      return { success: false, message: 'Missing issue data in job payload' };
    }

    return this.githubService.implementLocally(issueNum, engine, cwd, {
      title: issueTitle,
      body: issueBody,
    });
  }

  private async handleFix(
    job: Job<ImplementJobData>,
    cwd: string,
  ): Promise<{ success: boolean; message: string; branchName?: string }> {
    const { prNumber, engine, prBranchName, prFailedChecks, prReviewComments } = job.data;

    if (!prNumber || !prBranchName) {
      return { success: false, message: 'Missing PR data in job payload' };
    }

    return this.githubService.fixPR(prNumber, engine, cwd, {
      branchName: prBranchName,
      failedChecks: prFailedChecks,
      reviewComments: prReviewComments,
    });
  }

  private async handleCIFix(
    job: Job<ImplementJobData>,
    cwd: string,
  ): Promise<{ success: boolean; message: string; branchName?: string }> {
    const { prNumber, engine, prBranchName, prFailedChecks } = job.data;

    if (!prNumber || !prBranchName || !prFailedChecks) {
      return { success: false, message: 'Missing CI fix data in job payload' };
    }

    return this.githubService.checkAndFixCI(prNumber, engine, cwd, {
      branchName: prBranchName,
      failedChecks: prFailedChecks,
    });
  }

  private async postProcess(
    job: Job<ImplementJobData>,
    branchName: string,
    cwd: string,
  ): Promise<void> {
    const { type, issueNum } = job.data;

    this.logger.log(`Pushing branch ${branchName} from worktree`);
    const pushResult = this.githubService.pushBranch(branchName, cwd);
    if (!pushResult.success) {
      this.logger.error(`Push failed: ${pushResult.message}`);
      return;
    }

    let prUrl = '';

    if (type === 'implement') {
      this.logger.log(`Creating PR for branch: ${branchName}`);
      try {
        const prResult = this.githubService.createPR(issueNum, branchName, cwd);
        if (prResult.success && prResult.prUrl) {
          prUrl = prResult.prUrl;
          this.logger.log(`PR created: ${prUrl}`);
        } else {
          this.logger.warn(`PR creation failed: ${prResult.message}`);
        }
      } catch (err) {
        this.logger.error(`Failed to create PR: ${(err as Error).message}`);
      }
    }

    await this.notificationService.publish({
      jobId: String(job.id),
      issueNum,
      engine: job.data.engine,
      success: true,
      message: prUrl ? `PR created: ${prUrl}` : `Branch pushed: ${branchName}`,
      timestamp: Date.now(),
      type: prUrl ? 'pr-opened' : 'task-completed',
      prUrl: prUrl || undefined,
    });

    if (prUrl) {
      this.logger.log(`Auto-queueing review for PR: ${prUrl}`);
      try {
        await this.reviewQueue.addJob(
          issueNum,
          job.data.engine,
          job.data.chatId,
          job.data.userId,
          prUrl,
        );
      } catch (err) {
        this.logger.error(`Failed to queue review: ${(err as Error).message}`);
      }
    }
  }

  @OnQueueActive()
  onActive(job: Job<ImplementJobData>) {
    this.logger.log(
      `Job ${job.id} started: ${job.data.type} on #${job.data.issueNum} with ${job.data.engine}`,
    );
  }

  @OnQueueCompleted()
  onCompleted(
    job: Job<ImplementJobData>,
    result: { success: boolean; message: string },
  ) {
    this.logger.log(
      `Job ${job.id} finished: ${result.success ? 'success' : 'failed'} - ${result.message}`,
    );
  }

  @OnQueueFailed()
  async onFailed(job: Job<ImplementJobData>, err: Error) {
    this.logger.error(
      `Job ${job.id} failed: ${err.message}`,
      err.stack,
    );

    await this.notificationService.publish({
      jobId: String(job.id),
      issueNum: job.data.issueNum,
      engine: job.data.engine,
      success: false,
      message: err.message,
      timestamp: Date.now(),
    });
  }
}
