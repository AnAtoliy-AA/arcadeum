import { GamePostMatchService } from './game-post-match.service';

describe('GamePostMatchService', () => {
  let service: GamePostMatchService;

  const mockDailyChallenges = {
    onGameCompleted: jest.fn().mockResolvedValue(undefined),
  };
  const mockAchievements = {
    getDefinitions: jest.fn().mockResolvedValue([]),
    checkAndUnlockWithDefinitions: jest.fn().mockResolvedValue(undefined),
  };
  const mockSessionsService = {};
  const mockWallet = {};
  const mockEconomy = {};
  const mockPlayerStats = {
    recordGameResult: jest.fn().mockResolvedValue(undefined),
  };
  const mockChessProfiles = {};
  const mockXpSettings = {};
  const mockUserModel = {};
  const mockActivityFeed = {
    recordEvent: jest.fn().mockResolvedValue(undefined),
  };
  const mockClanWarsQueue = {
    dispatchMatchResolution: jest.fn(),
  };
  const mockClanWarsAutomation = {
    resolveMatchForPlayers: jest.fn(),
  };

  beforeEach(() => {
    service = new GamePostMatchService(
      mockDailyChallenges as never,
      mockAchievements as never,
      mockSessionsService as never,
      mockWallet as never,
      mockEconomy as never,
      mockPlayerStats as never,
      mockChessProfiles as never,
      mockXpSettings as never,
      mockUserModel as never,
      mockActivityFeed as never,
      mockClanWarsQueue as never,
      mockClanWarsAutomation as never,
    );
    jest.clearAllMocks();
  });

  it('dispatches clan war resolution to queue when two human players compete and one wins', async () => {
    mockClanWarsQueue.dispatchMatchResolution.mockResolvedValue(true);

    await service.onGameCompleted(
      ['user_1', 'user_2'],
      'chess',
      ['user_1'],
      {},
    );

    expect(mockClanWarsQueue.dispatchMatchResolution).toHaveBeenCalledWith(
      'user_1',
      'user_2',
      'chess',
    );
    expect(
      mockClanWarsAutomation.resolveMatchForPlayers,
    ).not.toHaveBeenCalled();
  });

  it('falls back to clanWarsAutomation if queue dispatch returns false', async () => {
    mockClanWarsQueue.dispatchMatchResolution.mockResolvedValue(false);
    mockClanWarsAutomation.resolveMatchForPlayers.mockResolvedValue(null);

    await service.onGameCompleted(
      ['user_1', 'user_2'],
      'sea-battle',
      ['user_1'],
      {},
    );

    expect(mockClanWarsQueue.dispatchMatchResolution).toHaveBeenCalledWith(
      'user_1',
      'user_2',
      'sea-battle',
    );
    expect(mockClanWarsAutomation.resolveMatchForPlayers).toHaveBeenCalledWith(
      'user_1',
      'user_2',
      'sea-battle',
    );
  });

  it('skips clan war resolution if players include bots', async () => {
    await service.onGameCompleted(
      ['user_1', 'bot-medium'],
      'checkers',
      ['user_1'],
      {},
    );

    expect(mockClanWarsQueue.dispatchMatchResolution).not.toHaveBeenCalled();
    expect(
      mockClanWarsAutomation.resolveMatchForPlayers,
    ).not.toHaveBeenCalled();
  });

  it('skips clan war resolution on a draw', async () => {
    await service.onGameCompleted(['user_1', 'user_2'], 'tic-tac-toe', [], {});

    expect(mockClanWarsQueue.dispatchMatchResolution).not.toHaveBeenCalled();
    expect(
      mockClanWarsAutomation.resolveMatchForPlayers,
    ).not.toHaveBeenCalled();
  });
});
