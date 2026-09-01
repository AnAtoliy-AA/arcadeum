import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import type { Job } from 'bullmq';

export interface AppJobData {
  type: string;
  payload: Record<string, unknown>;
}

@Processor('app-jobs')
export class AppJobsProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(AppJobsProcessor.name);

  onModuleInit(): void {
    if (this.worker) {
      this.worker.on('error', (err: Error) => {
        this.logger.warn(`BullMQ worker connection error: ${err.message}`);
      });
    }
  }

  process(job: Job<AppJobData, unknown, string>): Promise<unknown> {
    this.logger.log(`Processing job ${job.id} of type ${job.data.type}`);
    switch (job.data.type) {
      case 'persist_replay':
        return Promise.resolve({
          success: true,
          matchId: job.data.payload.matchId,
        });
      case 'sync_leaderboard':
        return Promise.resolve({ success: true, mode: job.data.payload.mode });
      default:
        return Promise.resolve({ success: true, handled: true });
    }
  }
}
