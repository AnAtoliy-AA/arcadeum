import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface ImplementJobData {
  issueNum: string;
  engine: 'opencode' | 'mimo';
  chatId: number;
  userId: number;
  type?: 'implement' | 'fix';
}

@Injectable()
export class ImplementQueueService {
  private readonly logger = new Logger(ImplementQueueService.name);

  constructor(
    @InjectQueue('implementation')
    private readonly implementQueue: Queue<ImplementJobData>,
  ) {}

  async addJob(
    issueNum: string,
    engine: 'opencode' | 'mimo',
    chatId: number,
    userId: number,
  ): Promise<string> {
    const job = await this.implementQueue.add(
      { issueNum, engine, chatId, userId, type: 'implement' },
      {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );
    this.logger.log(
      `Job ${job.id} queued: issue #${issueNum} with ${engine}`,
    );
    return String(job.id);
  }

  async addFixJob(
    prNumber: string,
    engine: 'opencode' | 'mimo',
    chatId: number,
    userId: number,
  ): Promise<string> {
    const job = await this.implementQueue.add(
      { issueNum: prNumber, engine, chatId, userId, type: 'fix' },
      {
        attempts: 1,
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );
    this.logger.log(
      `Job ${job.id} queued: fix PR #${prNumber} with ${engine}`,
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
      this.implementQueue.getWaitingCount(),
      this.implementQueue.getActiveCount(),
      this.implementQueue.getCompletedCount(),
      this.implementQueue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed };
  }

  async getActiveJobs(): Promise<
    Array<{ jobId: string; issueNum: string; engine: string; progress: number }>
  > {
    const jobs = await this.implementQueue.getActive();
    return jobs.map((j) => ({
      jobId: String(j.id),
      issueNum: j.data.issueNum,
      engine: j.data.engine,
      progress: j.progress() as number,
    }));
  }
}
