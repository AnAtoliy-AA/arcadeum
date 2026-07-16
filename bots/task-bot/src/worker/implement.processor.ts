import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { GitHubService } from '../github/github.service';
import { ImplementJobData } from '../queue/implement-queue.service';
import { ReviewQueueService } from '../queue/review-queue.service';
import { NotificationService } from '../notification/notification.service';

@Processor('implementation')
export class ImplementProcessor {
  private readonly logger = new Logger(ImplementProcessor.name);

  constructor(
    private readonly githubService: GitHubService,
    private readonly reviewQueue: ReviewQueueService,
    private readonly notificationService: NotificationService,
  ) {}

  @Process()
  async handleImplement(job: Job<ImplementJobData>): Promise<{
    success: boolean;
    message: string;
  }> {
    const { issueNum, engine } = job.data;
    this.logger.log(
      `Processing job ${job.id}: implementing issue #${issueNum} with ${engine}`,
    );

    await job.progress(10);

    const result = await this.githubService.implementLocally(issueNum, engine);

    await job.progress(100);

    this.logger.log(
      `Job ${job.id} completed: ${result.success ? 'success' : 'failed'} - ${result.message}`,
    );

    return result;
  }

  @OnQueueActive()
  onActive(job: Job<ImplementJobData>) {
    this.logger.log(
      `Job ${job.id} started: issue #${job.data.issueNum} with ${job.data.engine}`,
    );
  }

  @OnQueueCompleted()
  async onCompleted(
    job: Job<ImplementJobData>,
    result: { success: boolean; message: string; branchName?: string },
  ) {
    this.logger.log(
      `Job ${job.id} finished: ${result.success ? 'success' : 'failed'}`,
    );

    let prUrl = '';
    if (result.message.includes('PR created:')) {
      prUrl = result.message.replace('PR created: ', '');
    } else if (result.branchName) {
      this.logger.log(`Creating PR from main instance for branch: ${result.branchName}`);
      try {
        const prResult = this.githubService.createPR(job.data.issueNum, result.branchName);
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
      issueNum: job.data.issueNum,
      engine: job.data.engine,
      success: result.success,
      message: prUrl ? `PR created: ${prUrl}` : result.message,
      timestamp: Date.now(),
      type: prUrl ? 'pr-opened' : (result.success ? 'task-completed' : 'task-failed'),
      prUrl: prUrl || undefined,
    });

    if (prUrl) {
      const { issueNum, engine, chatId, userId } = job.data;

      this.logger.log(`Auto-queueing review for PR: ${prUrl}`);
      try {
        await this.reviewQueue.addJob(issueNum, engine, chatId, userId, prUrl);
      } catch (err) {
        this.logger.error(`Failed to queue review: ${(err as Error).message}`);
      }
    }
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
