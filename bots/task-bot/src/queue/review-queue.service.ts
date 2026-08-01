import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface ReviewJobData {
  issueNum: string;
  engine: 'opencode';
  chatId: number;
  userId: number;
  prUrl: string;
}

@Injectable()
export class ReviewQueueService {
  private readonly logger = new Logger(ReviewQueueService.name);

  constructor(
    @InjectQueue('review')
    private readonly reviewQueue: Queue<ReviewJobData>,
  ) {}

  async addJob(
    issueNum: string,
    engine: 'opencode',
    chatId: number,
    userId: number,
    prUrl: string,
  ): Promise<string> {
    const job = await this.reviewQueue.add(
      { issueNum, engine, chatId, userId, prUrl },
      {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );
    this.logger.log(
      `Review job ${job.id} queued: issue #${issueNum} for ${prUrl}`,
    );
    return String(job.id);
  }

  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.reviewQueue.getWaitingCount(),
      this.reviewQueue.getActiveCount(),
      this.reviewQueue.getCompletedCount(),
      this.reviewQueue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed };
  }
}
