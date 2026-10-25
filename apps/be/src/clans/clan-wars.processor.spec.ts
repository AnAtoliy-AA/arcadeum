jest.mock('@nestjs/bullmq', () => ({
  Processor: () => () => {},
  WorkerHost: class {
    process() {}
  },
  InjectQueue: () => () => {},
}));

import { ClanWarsProcessor } from './clan-wars.processor';
import type { Job } from 'bullmq';
import { ClanWarsAutomationService } from './clan-wars-automation.service';
import { ClanWarsQueueService } from './clan-wars-queue.service';

describe('ClanWarsProcessor', () => {
  let processor: ClanWarsProcessor;

  const mockAutomationService = {
    resolveMatchForPlayers: jest.fn(),
    expirePendingAndActiveWars: jest.fn(),
    matchmakeClanWar: jest.fn(),
  };

  const mockQueueService = {
    setupRepeatableExpirationJob: jest.fn(),
  };

  beforeEach(() => {
    processor = new ClanWarsProcessor(
      mockAutomationService as unknown as ClanWarsAutomationService,
      mockQueueService as unknown as ClanWarsQueueService,
    );
    jest.clearAllMocks();
  });

  it('runs onModuleInit and schedules repeatable expiration', async () => {
    let errorHandler: ((err: Error) => void) | undefined;
    const mockWorker = {
      on: jest.fn((event: string, handler: (err: Error) => void) => {
        if (event === 'error') {
          errorHandler = handler;
        }
      }),
    };
    Object.defineProperty(processor, 'worker', {
      value: mockWorker,
      writable: true,
    });

    await processor.onModuleInit();
    expect(mockWorker.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockQueueService.setupRepeatableExpirationJob).toHaveBeenCalled();

    expect(() => {
      errorHandler?.(new Error('connect ECONNREFUSED 127.0.0.1:6379'));
      errorHandler?.(new Error('Connection is closed.'));
      errorHandler?.(new Error('unexpected error'));
    }).not.toThrow();
  });

  it('processes resolve_match job', async () => {
    mockAutomationService.resolveMatchForPlayers.mockResolvedValue({
      id: 'war_123',
    });
    const job = {
      id: 'job_1',
      data: {
        type: 'resolve_match',
        payload: { winnerUserId: 'u1', loserUserId: 'u2', gameId: 'chess' },
      },
    } as unknown as Job;

    const result = await processor.process(job as never);
    expect(mockAutomationService.resolveMatchForPlayers).toHaveBeenCalledWith(
      'u1',
      'u2',
      'chess',
    );
    expect(result).toEqual({ success: true, updatedWarId: 'war_123' });
  });

  it('processes expire_wars job', async () => {
    mockAutomationService.expirePendingAndActiveWars.mockResolvedValue({
      expiredActiveCount: 2,
      expiredPendingCount: 1,
    });
    const job = {
      id: 'job_2',
      data: {
        type: 'expire_wars',
        payload: {},
      },
    } as unknown as Job;

    const result = await processor.process(job as never);
    expect(mockAutomationService.expirePendingAndActiveWars).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      expiredActiveCount: 2,
      expiredPendingCount: 1,
    });
  });

  it('processes matchmake job', async () => {
    mockAutomationService.matchmakeClanWar.mockResolvedValue({ id: 'war_456' });
    const job = {
      id: 'job_3',
      data: {
        type: 'matchmake',
        payload: {
          requesterUserId: 'u1',
          clanId: 'c1',
          preferredGameId: 'chess',
        },
      },
    } as unknown as Job;

    const result = await processor.process(job as never);
    expect(mockAutomationService.matchmakeClanWar).toHaveBeenCalledWith(
      'u1',
      'c1',
      'chess',
    );
    expect(result).toEqual({ success: true, warId: 'war_456' });
  });

  it('handles unknown job type gracefully', async () => {
    const job = {
      id: 'job_4',
      data: {
        type: 'unknown_type',
        payload: {},
      },
    } as unknown as Job;

    const result = await processor.process(job as never);
    expect(result).toEqual({ success: true, unhandled: true });
  });
});
