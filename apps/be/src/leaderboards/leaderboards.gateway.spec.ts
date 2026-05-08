import { LeaderboardsGateway } from './leaderboards.gateway';

describe('LeaderboardsGateway', () => {
  let gateway: LeaderboardsGateway;
  let server: { emit: jest.Mock };

  beforeEach(() => {
    gateway = new LeaderboardsGateway();
    server = { emit: jest.fn() };
    Object.assign(gateway, { server });
  });

  it('emitCaptured broadcasts capturedAt + results', () => {
    gateway.emitCaptured([{ mode: 'all', season: '2026Q2', updated: 200 }]);
    expect(server.emit).toHaveBeenCalledWith(
      'leaderboards.captured',
      expect.objectContaining({
        capturedAt: expect.any(String) as string,
        results: [{ mode: 'all', season: '2026Q2', updated: 200 }],
      }),
    );
  });

  it('emitEntryUpdated forwards the payload as-is', () => {
    gateway.emitEntryUpdated({
      userId: 'u1',
      mode: 'mafia',
      season: '2026Q2',
      isInMatch: true,
    });
    expect(server.emit).toHaveBeenCalledWith('leaderboards.entry.updated', {
      userId: 'u1',
      mode: 'mafia',
      season: '2026Q2',
      isInMatch: true,
    });
  });

  it('is a no-op when the server is not yet attached', () => {
    Object.assign(gateway, { server: undefined });
    expect(() => gateway.emitCaptured([])).not.toThrow();
    expect(() =>
      gateway.emitEntryUpdated({ userId: 'u', mode: 'all', season: 's' }),
    ).not.toThrow();
  });
});
