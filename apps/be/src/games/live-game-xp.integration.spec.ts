import { GameSessionsService } from './sessions/game-sessions.service';
import { GamePostMatchService } from './game-post-match.service';
import { createRealXpSettings, type FakeUsers } from '../xp/xp-test-fakes';

/**
 * Integration-style (no DB): a live game finishing through the REAL
 * GameSessionsService.executeAction must reach the REAL GamePostMatchService
 * and write XP via the REAL XpSettingsService. Guards the regression where
 * the post-match path was unreachable and nobody ever received XP.
 */
describe('live game completion awards XP', () => {
  interface FakeSessionDoc {
    _id: { toString(): string };
    roomId: string;
    gameId: string;
    engine: string;
    status: 'active' | 'completed';
    state: Record<string, unknown>;
    postMatchProcessedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    markModified: () => void;
    save: () => Promise<void>;
  }

  let doc: FakeSessionDoc;
  let users: FakeUsers;
  let sessions: GameSessionsService;
  let postMatch: GamePostMatchService;
  let gameOver: boolean;

  const move = () =>
    sessions.executeAction({
      sessionId: 'sess-1',
      action: 'move',
      userId: 'alice',
    });

  beforeEach(() => {
    gameOver = false;
    users = { alice: { xp: 0 }, bob: { xp: 0 } };
    doc = {
      _id: { toString: () => 'sess-1' },
      roomId: 'room-1',
      gameId: 'tic_tac_toe_v1',
      engine: 'tic_tac_toe_v1',
      status: 'active',
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      markModified: () => undefined,
      save: () => Promise.resolve(),
    };

    const sessionModel = {
      findById: () => {
        const query = {
          exec: () => Promise.resolve(doc),
          select: () => query,
          lean: () => query,
        };
        return query;
      },
      findOneAndUpdate: () => ({
        exec: () => {
          if (doc.postMatchProcessedAt) return Promise.resolve(null);
          doc.postMatchProcessedAt = new Date();
          return Promise.resolve(doc);
        },
      }),
    };
    const engine = {
      executeAction: () => ({ success: true, state: { moved: true } }),
      isGameOver: () => gameOver,
      getResult: () => ({ winnerIds: ['alice'] }),
      getWinners: () => ['alice'],
    };
    sessions = new GameSessionsService(
      sessionModel as never,
      {
        getEngine: () => engine,
      } as never,
    );

    const noop = jest.fn().mockResolvedValue(undefined);
    postMatch = new GamePostMatchService(
      { onGameCompleted: noop } as never,
      {
        getDefinitions: jest.fn().mockResolvedValue([]),
        checkAndUnlockWithDefinitions: noop,
      } as never,
      sessions,
      {} as never,
      { getNumber: jest.fn().mockResolvedValue(0) } as never,
      {
        recordGameResult: noop,
        getRecentForms: jest.fn().mockResolvedValue(new Map()),
      } as never,
      {} as never,
      createRealXpSettings(users),
      {
        recordEvent: noop,
        recordMatch: noop,
        recordLevelUp: noop,
        recordAchievements: noop,
        recordWinStreak: noop,
      } as never,
      {
        getRoomParticipants: jest.fn().mockResolvedValue(['alice', 'bob']),
        updateRoomStatus: noop,
        getRoomRaw: jest.fn().mockResolvedValue(null),
        getRoom: jest.fn().mockResolvedValue({ gameOptions: {} }),
      } as never,
      { syncInMatch: noop } as never,
      { archiveSessionToAtlas: noop } as never,
      { createReplay: noop } as never,
      { recordRankedResult: noop } as never,
    );
    postMatch.onModuleInit();
  });

  it('does not award XP while the game is still running', async () => {
    await move();
    expect(users.alice?.xp).toBe(0);
    expect(users.bob?.xp).toBe(0);
  });

  it('awards winner and loser XP when the final move completes the game', async () => {
    gameOver = true;
    const result = await move();
    expect(result.status).toBe('completed');
    expect(users.alice?.xp).toBe(100);
    expect(users.bob?.xp).toBe(40);
  });

  it('never double-awards when the same session completes twice', async () => {
    gameOver = true;
    await move();
    doc.status = 'active'; // simulate a retried/duplicated completion signal
    await move();
    expect(users.alice?.xp).toBe(100);
    expect(users.bob?.xp).toBe(40);
  });

  it('a failing XP write never breaks the action result', async () => {
    gameOver = true;
    users.alice = undefined;
    users.bob = undefined;
    await expect(move()).resolves.toMatchObject({ status: 'completed' });
  });
});
