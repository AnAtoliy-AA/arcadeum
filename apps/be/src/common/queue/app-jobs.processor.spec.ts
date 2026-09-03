jest.mock('@nestjs/bullmq', () => ({
  Processor: () => () => {},
  WorkerHost: class {
    process() {}
  },
}));

import { AppJobsProcessor } from './app-jobs.processor';
import type { Job } from 'bullmq';

describe('AppJobsProcessor', () => {
  let processor: AppJobsProcessor;

  beforeEach(() => {
    processor = new AppJobsProcessor();
  });

  it('processes persist_replay job', async () => {
    const job = {
      id: 'job_1',
      data: {
        type: 'persist_replay',
        payload: { matchId: 'm999' },
      },
    } as unknown as Job<{ type: string; payload: Record<string, unknown> }>;

    const result = await processor.process(job as never);
    expect(result).toEqual({ success: true, matchId: 'm999' });
  });

  it('handles default job gracefully', async () => {
    const job = {
      id: 'job_2',
      data: {
        type: 'unknown_task',
        payload: {},
      },
    } as unknown as Job<{ type: string; payload: Record<string, unknown> }>;

    const result = await processor.process(job as never);
    expect(result).toEqual({ success: true, handled: true });
  });
});
