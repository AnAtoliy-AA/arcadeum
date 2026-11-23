import {
  SeaBattleBlitzService,
  computeNextBlitzCupDate,
} from './sea-battle-blitz.service';
import type { WeeklyCupsService } from '../weekly-cups/weekly-cups.service';

describe('SeaBattleBlitzService facade', () => {
  const cups = {
    getConfig: jest.fn(),
    isEnabled: jest.fn(),
    updateConfig: jest.fn(),
    ensureUpcomingCup: jest.fn(),
    startCupIfDue: jest.fn(),
    getCup: jest.fn(),
    reportMatchResult: jest.fn(),
  };
  const service = new SeaBattleBlitzService(
    cups as unknown as WeeklyCupsService, // partial mock of the shared service
  );

  beforeEach(() => jest.clearAllMocks());

  it('delegates every call to the shared service with the sea-battle key', async () => {
    await service.getBlitzCupConfig();
    await service.isBlitzCupEnabled();
    await service.updateBlitzCupConfig({ prizePoolCoins: 5 }, 'u1');
    await service.setBlitzCupEnabled(false, 'u1');
    await service.ensureUpcomingBlitzCup();
    await service.startBlitzCupIfDue();
    await service.getSeaBattleBlitzCup('en', true, 'u1');
    await service.reportMatchResult('t', 1, 0, 'w');

    expect(cups.getConfig).toHaveBeenCalledWith('sea-battle');
    expect(cups.isEnabled).toHaveBeenCalledWith('sea-battle');
    expect(cups.updateConfig).toHaveBeenCalledWith(
      'sea-battle',
      { prizePoolCoins: 5 },
      'u1',
    );
    expect(cups.updateConfig).toHaveBeenCalledWith(
      'sea-battle',
      { enabled: false },
      'u1',
    );
    expect(cups.ensureUpcomingCup).toHaveBeenCalledWith('sea-battle');
    expect(cups.startCupIfDue).toHaveBeenCalledWith('sea-battle');
    expect(cups.getCup).toHaveBeenCalledWith('sea-battle', 'en', true, 'u1');
    expect(cups.reportMatchResult).toHaveBeenCalledWith('t', 1, 0, 'w');
  });

  it('computeNextBlitzCupDate still targets Saturday 18:00 UTC', () => {
    const target = computeNextBlitzCupDate(new Date('2026-10-07T12:00:00Z'));
    expect(target.getUTCDay()).toBe(6);
    expect(target.getUTCHours()).toBe(18);
    expect(target.getUTCDate()).toBe(10);
  });
});
