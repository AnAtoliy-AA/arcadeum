import { GamePostMatchService } from './game-post-match.service';
import { createRealXpSettings, type FakeUsers } from '../xp/xp-test-fakes';

describe('GamePostMatchService', () => {
  let service: GamePostMatchService;

  const mockDailyChallenges = {
    onGameCompleted: jest.fn().mockResolvedValue(undefined),
  };
  const mockAchievements = {
    getDefinitions: jest.fn().mockResolvedValue([]),
    checkAndUnlockWithDefinitions: jest.fn().mockResolvedValue(undefined),
  };
  const mockSessionsService = {
    onSessionCompleted: jest.fn(),
    claimPostMatchProcessing: jest.fn(),
    getWinners: jest.fn(),
  };
  const mockWallet = {};
  const mockEconomy = { getNumber: jest.fn().mockResolvedValue(0) };
  const mockPlayerStats = {
    recordGameResult: jest.fn().mockResolvedValue(undefined),
    getRecentForms: jest.fn().mockResolvedValue(new Map()),
  };
  const mockChessProfiles = {};
  let users: FakeUsers;
  const mockActivityFeed = {
    recordEvent: jest.fn().mockResolvedValue(undefined),
    recordMatch: jest.fn().mockResolvedValue(undefined),
    recordLevelUp: jest.fn().mockResolvedValue(undefined),
    recordAchievements: jest.fn().mockResolvedValue(undefined),
    recordWinStreak: jest.fn().mockResolvedValue(undefined),
  };
  const mockClanWarsQueue = {
    dispatchMatchResolution: jest.fn(),
  };
  const mockClanWarsAutomation = {
    resolveMatchForPlayers: jest.fn(),
  };

  const mockPetTreats = {
    awardWinTreats: jest.fn().mockResolvedValue(undefined),
  };

  const mockRooms = {
    getRoomParticipants: jest.fn(),
    updateRoomStatus: jest.fn().mockResolvedValue(undefined),
    getRoomRaw: jest.fn().mockResolvedValue(null),
    getRoom: jest.fn().mockResolvedValue({ gameOptions: {} }),
  };
  const mockLeaderboardSync = {
    syncInMatch: jest.fn().mockResolvedValue(undefined),
  };
  const mockArchive = {
    archiveSessionToAtlas: jest.fn().mockResolvedValue(undefined),
  };
  const mockReplay = { createReplay: jest.fn().mockResolvedValue(null) };
  const mockRanking = {
    recordRankedResult: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    users = {
      user_1: { xp: 0 },
      user_2: { xp: 0 },
    };
    service = new GamePostMatchService(
      mockDailyChallenges as never,
      mockAchievements as never,
      mockSessionsService as never,
      mockWallet as never,
      mockEconomy as never,
      mockPlayerStats as never,
      mockChessProfiles as never,
      createRealXpSettings(users),
      mockActivityFeed as never,
      mockRooms as never,
      mockLeaderboardSync as never,
      mockArchive as never,
      mockReplay as never,
      mockRanking as never,
      mockClanWarsQueue as never,
      mockClanWarsAutomation as never,
      mockPetTreats as never,
    );
    jest.clearAllMocks();
    mockRooms.updateRoomStatus.mockResolvedValue(undefined);
    mockRooms.getRoomRaw.mockResolvedValue(null);
    mockRooms.getRoom.mockResolvedValue({ gameOptions: {} });
  });

  describe('XP awards (real XpSettingsService)', () => {
    it('awards PvP win/loss XP to human players', async () => {
      await service.onGameCompleted(
        ['user_1', 'user_2'],
        'chess_v1',
        ['user_1'],
        {},
        's1',
      );
      expect(users.user_1?.xp).toBe(100);
      expect(users.user_2?.xp).toBe(40);
    });

    it('awards draw XP to everyone on a draw', async () => {
      await service.onGameCompleted(['user_1', 'user_2'], 'hearts', [], {});
      expect(users.user_1?.xp).toBe(60);
      expect(users.user_2?.xp).toBe(60);
    });

    it('uses the bot coefficient and never awards bots', async () => {
      await service.onGameCompleted(
        ['user_1', 'bot-abc'],
        'checkers',
        ['user_1'],
        {},
      );
      expect(users.user_1?.xp).toBe(20);
      expect(Object.keys(users)).not.toContain('bot-abc');
    });

    it('one failing user does not block the others', async () => {
      delete users.user_1;
      await service.onGameCompleted(
        ['user_1', 'user_2'],
        'chess_v1',
        ['user_1'],
        {},
      );
      expect(users.user_2?.xp).toBe(40);
    });
  });

  describe('processCompletedSession', () => {
    const session = {
      id: 'sess-1',
      roomId: 'room-1',
      gameId: 'chess_v1',
      status: 'completed',
      state: {},
    } as never;

    beforeEach(() => {
      mockRooms.getRoomParticipants.mockResolvedValue(['user_1', 'user_2']);
      mockSessionsService.getWinners.mockResolvedValue(['user_1']);
    });

    it('registers itself as the session completion listener', () => {
      service.onModuleInit();
      expect(mockSessionsService.onSessionCompleted).toHaveBeenCalledTimes(1);
    });

    it('awards XP and records stats when the claim succeeds', async () => {
      mockSessionsService.claimPostMatchProcessing.mockResolvedValue(true);
      await service.processCompletedSession(session);
      expect(users.user_1?.xp).toBe(100);
      expect(users.user_2?.xp).toBe(40);
      expect(mockPlayerStats.recordGameResult).toHaveBeenCalledTimes(1);
      expect(mockDailyChallenges.onGameCompleted).toHaveBeenCalledTimes(1);
    });

    it('records one activity feed match with the replay id', async () => {
      mockSessionsService.claimPostMatchProcessing.mockResolvedValue(true);
      mockRooms.getRoomRaw.mockResolvedValue({ participants: [] });
      mockReplay.createReplay.mockResolvedValueOnce({ replayId: 'rp-1' });
      await service.processCompletedSession(session);
      expect(mockActivityFeed.recordMatch).toHaveBeenCalledTimes(1);
      expect(mockActivityFeed.recordMatch).toHaveBeenCalledWith({
        playerIds: ['user_1', 'user_2'],
        winners: ['user_1'],
        gameId: 'chess_v1',
        state: {},
        replayId: 'rp-1',
      });
    });

    it('records feed rows for newly unlocked achievements', async () => {
      mockAchievements.getDefinitions.mockResolvedValueOnce([
        { achievementId: 'first_win', name: 'First Win' },
      ]);
      mockAchievements.checkAndUnlockWithDefinitions
        .mockResolvedValueOnce(['first_win'])
        .mockResolvedValueOnce([]);
      await service.onGameCompleted(
        ['user_1', 'user_2'],
        'chess_v1',
        ['user_1'],
        {},
      );
      expect(mockActivityFeed.recordAchievements).toHaveBeenCalledWith(
        'user_1',
        [{ id: 'first_win', name: 'First Win' }],
      );
    });

    it('records a win streak milestone for the winner', async () => {
      mockPlayerStats.getRecentForms.mockResolvedValueOnce(
        new Map([['user_1', { currentStreak: 3 }]]),
      );
      await service.onGameCompleted(
        ['user_1', 'user_2'],
        'chess_v1',
        ['user_1'],
        {},
      );
      expect(mockActivityFeed.recordWinStreak).toHaveBeenCalledWith(
        'user_1',
        'chess_v1',
        3,
      );
    });

    it('is idempotent: a second completion signal awards nothing', async () => {
      mockSessionsService.claimPostMatchProcessing
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      await service.processCompletedSession(session);
      await service.processCompletedSession(session);
      expect(users.user_1?.xp).toBe(100);
      expect(mockPlayerStats.recordGameResult).toHaveBeenCalledTimes(1);
    });

    it('skips ratings, rewards and stats for an aborted game', async () => {
      mockSessionsService.claimPostMatchProcessing.mockResolvedValue(true);
      mockSessionsService.getWinners.mockResolvedValue([]);
      const aborted = {
        id: 'sess-2',
        roomId: 'room-1',
        gameId: 'chess_v1',
        status: 'completed',
        state: { gameResult: { winnerIds: [], isDraw: false, aborted: true } },
      } as never;
      await service.processCompletedSession(aborted);
      expect(users.user_1?.xp).toBe(0);
      expect(users.user_2?.xp).toBe(0);
      expect(mockRanking.recordRankedResult).not.toHaveBeenCalled();
      expect(mockPlayerStats.recordGameResult).not.toHaveBeenCalled();
      expect(mockDailyChallenges.onGameCompleted).not.toHaveBeenCalled();
      expect(mockRooms.updateRoomStatus).toHaveBeenCalledWith(
        'room-1',
        'completed',
      );
      expect(mockArchive.archiveSessionToAtlas).toHaveBeenCalledWith(aborted);
    });
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

  it('awards pet treats from the verified session winners', async () => {
    await service.onGameCompleted(
      ['user_1', 'user_2'],
      'chess_v1',
      ['user_1'],
      {},
      'session-1',
    );
    expect(mockPetTreats.awardWinTreats).toHaveBeenCalledWith(
      'chess_v1',
      ['user_1'],
      'session-1',
    );
  });

  it('keeps post-match processing going when the treat award fails', async () => {
    mockPetTreats.awardWinTreats.mockRejectedValueOnce(new Error('boom'));
    await expect(
      service.onGameCompleted(['user_1'], 'chess_v1', ['user_1'], {}, 's2'),
    ).resolves.toBeUndefined();
  });
});
