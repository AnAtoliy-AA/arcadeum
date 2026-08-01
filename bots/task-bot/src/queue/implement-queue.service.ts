import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export type JobType = 'implement' | 'fix' | 'ci-fix';

export interface ImplementJobData {
  issueNum: string;
  engine: 'opencode';
  chatId: number;
  userId: number;
  type: JobType;
  prNumber?: string;
  issueTitle?: string;
  issueBody?: string;
  issueLabels?: Array<{ name: string }>;
  prBranchName?: string;
  prFailedChecks?: Array<{ name: string; state: string; link: string }>;
  prReviewComments?: string;
  existingWorktree?: string;
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
    engine: 'opencode',
    chatId: number,
    userId: number,
    data?: Partial<ImplementJobData>,
  ): Promise<string> {
    const job = await this.implementQueue.add(
      { issueNum, engine, chatId, userId, type: 'implement', ...data },
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

  async setJobData(
    jobId: string,
    data: Partial<ImplementJobData>,
  ): Promise<void> {
    const job = await this.implementQueue.getJob(jobId);
    if (job) {
      await job.update({ ...job.data, ...data });
    }
  }

  async addFixJob(
    prNumber: string,
    engine: 'opencode',
    chatId: number,
    userId: number,
    data: {
      issueNum: string;
      prBranchName: string;
      prFailedChecks?: Array<{ name: string; state: string; link: string }>;
      prReviewComments?: string;
      existingWorktree?: string;
    },
  ): Promise<string> {
    const job = await this.implementQueue.add(
      {
        issueNum: data.issueNum,
        engine,
        chatId,
        userId,
        type: 'fix',
        prNumber,
        prBranchName: data.prBranchName,
        prFailedChecks: data.prFailedChecks,
        prReviewComments: data.prReviewComments,
        existingWorktree: data.existingWorktree,
      },
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

  async addCIFixJob(
    prNumber: string,
    engine: 'opencode',
    chatId: number,
    userId: number,
    data: {
      issueNum: string;
      prBranchName: string;
      prFailedChecks: Array<{ name: string; state: string; link: string }>;
    },
  ): Promise<string> {
    const job = await this.implementQueue.add(
      {
        issueNum: data.issueNum,
        engine,
        chatId,
        userId,
        type: 'ci-fix',
        prNumber,
        prBranchName: data.prBranchName,
        prFailedChecks: data.prFailedChecks,
      },
      {
        attempts: 1,
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );
    this.logger.log(
      `Job ${job.id} queued: CI fix for PR #${prNumber} with ${engine}`,
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
