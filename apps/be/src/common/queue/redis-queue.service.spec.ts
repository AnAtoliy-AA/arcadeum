import { RedisQueueService } from './redis-queue.service';

describe('RedisQueueService', () => {
  let queue: RedisQueueService;

  beforeEach(() => {
    queue = new RedisQueueService();
  });

  afterEach(() => {
    queue.onModuleDestroy();
  });

  it('registers workers and processes jobs', async () => {
    const executed: string[] = [];

    queue.registerWorker<{ matchId: string }>('persist_replay', (job) => {
      executed.push(job.data.matchId);
      return Promise.resolve();
    });

    const jobId = await queue.addJob('persist_replay', { matchId: 'm123' });
    expect(jobId).toBeDefined();
    expect(executed).toContain('m123');
  });

  it('retries failed jobs up to maxAttempts', async () => {
    let attempts = 0;

    queue.registerWorker('flaky_job', () => {
      attempts += 1;
      if (attempts < 2) {
        throw new Error('transient network error');
      }
      return Promise.resolve();
    });

    await queue.addJob('flaky_job', {}, { maxAttempts: 3 });
    expect(attempts).toBe(2);
  });
});
