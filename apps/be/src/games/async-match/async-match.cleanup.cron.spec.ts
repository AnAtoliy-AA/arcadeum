import { Test, TestingModule } from '@nestjs/testing';
import { AsyncMatchCleanupCron } from './async-match.cleanup.cron';
import { AsyncMatchService } from './async-match.service';

describe('AsyncMatchCleanupCron', () => {
  let cron: AsyncMatchCleanupCron;
  let service: {
    sweepExpiredMatches: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      sweepExpiredMatches: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsyncMatchCleanupCron,
        {
          provide: AsyncMatchService,
          useValue: service,
        },
      ],
    }).compile();

    cron = module.get<AsyncMatchCleanupCron>(AsyncMatchCleanupCron);
  });

  it('runs sweep and handles zero expired matches gracefully', async () => {
    service.sweepExpiredMatches.mockResolvedValue(0);
    await expect(cron.handleExpiredMatchesSweep()).resolves.toBeUndefined();
    expect(service.sweepExpiredMatches).toHaveBeenCalledTimes(1);
  });

  it('runs sweep and logs when expired matches were forfeited', async () => {
    service.sweepExpiredMatches.mockResolvedValue(3);
    await expect(cron.handleExpiredMatchesSweep()).resolves.toBeUndefined();
    expect(service.sweepExpiredMatches).toHaveBeenCalledTimes(1);
  });

  it('catches and handles exceptions without crashing', async () => {
    service.sweepExpiredMatches.mockRejectedValue(new Error('DB failure'));
    await expect(cron.handleExpiredMatchesSweep()).resolves.toBeUndefined();
  });
});
