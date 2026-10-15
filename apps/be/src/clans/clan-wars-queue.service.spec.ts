import { ClanWarsQueueService } from './clan-wars-queue.service';
import type { Queue } from 'bullmq';

describe('ClanWarsQueueService', () => {
  let serviceWithQueue: ClanWarsQueueService;
  let serviceWithoutQueue: ClanWarsQueueService;

  const mockQueue = {
    add: jest.fn(),
    upsertJobScheduler: jest.fn(),
  } as unknown as Queue;

  beforeEach(() => {
    serviceWithQueue = new ClanWarsQueueService(mockQueue);
    serviceWithoutQueue = new ClanWarsQueueService(undefined);
    jest.clearAllMocks();
  });

  describe('dispatchMatchResolution', () => {
    it('returns false when queue is not provided', async () => {
      const result = await serviceWithoutQueue.dispatchMatchResolution(
        'u1',
        'u2',
        'chess',
      );
      expect(result).toBe(false);
    });

    it('enqueues job and returns true when queue is available', async () => {
      (mockQueue.add as jest.Mock).mockResolvedValue({});
      const result = await serviceWithQueue.dispatchMatchResolution(
        'u1',
        'u2',
        'chess',
      );
      expect(result).toBe(true);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'resolve_match',
        {
          type: 'resolve_match',
          payload: { winnerUserId: 'u1', loserUserId: 'u2', gameId: 'chess' },
        },
        expect.any(Object),
      );
    });

    it('returns false when queue.add throws an error', async () => {
      (mockQueue.add as jest.Mock).mockRejectedValue(
        new Error('Redis connection lost'),
      );
      const result = await serviceWithQueue.dispatchMatchResolution(
        'u1',
        'u2',
        'chess',
      );
      expect(result).toBe(false);
    });
  });

  describe('dispatchExpirationCheck', () => {
    it('returns false when queue is not provided', async () => {
      const result = await serviceWithoutQueue.dispatchExpirationCheck();
      expect(result).toBe(false);
    });

    it('enqueues job and returns true when queue is available', async () => {
      (mockQueue.add as jest.Mock).mockResolvedValue({});
      const result = await serviceWithQueue.dispatchExpirationCheck();
      expect(result).toBe(true);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'expire_wars',
        { type: 'expire_wars', payload: {} },
        expect.any(Object),
      );
    });
  });

  describe('dispatchMatchmaking', () => {
    it('returns false when queue is not provided', async () => {
      const result = await serviceWithoutQueue.dispatchMatchmaking(
        'u1',
        'c1',
        'chess',
      );
      expect(result).toBe(false);
    });

    it('enqueues job and returns true when queue is available', async () => {
      (mockQueue.add as jest.Mock).mockResolvedValue({});
      const result = await serviceWithQueue.dispatchMatchmaking(
        'u1',
        'c1',
        'chess',
      );
      expect(result).toBe(true);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'matchmake',
        {
          type: 'matchmake',
          payload: {
            requesterUserId: 'u1',
            clanId: 'c1',
            preferredGameId: 'chess',
          },
        },
        expect.any(Object),
      );
    });
  });

  describe('setupRepeatableExpirationJob', () => {
    it('does nothing when queue is not available', async () => {
      await expect(
        serviceWithoutQueue.setupRepeatableExpirationJob(),
      ).resolves.toBeUndefined();
      expect(mockQueue.upsertJobScheduler).not.toHaveBeenCalled();
    });

    it('upserts job scheduler when queue is available', async () => {
      (mockQueue.upsertJobScheduler as jest.Mock).mockResolvedValue({});
      await serviceWithQueue.setupRepeatableExpirationJob();
      expect(mockQueue.upsertJobScheduler).toHaveBeenCalledWith(
        'repeatable-clan-wars-expiration',
        { pattern: '*/15 * * * *' },
        expect.objectContaining({ name: 'expire_wars' }),
      );
    });
  });
});
