import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ChessEngine } from './chess.engine';
import { parseFen } from './chess.board';
import { ChessBotService, shouldBotAcceptDraw } from './chess-bot.service';
import { ChessBotSearchPool } from './chess-bot-search.pool';
import type { GameSessionSummary } from '../../sessions/game-sessions.service';
import type { ChessState } from './chess.types';
import {
  MIN_THINK_MS,
  computeBotThinkTimeMs,
} from '@arcadeum/games-core/games/chess/chess-bot-pacing';
import { searchBotMove } from '@arcadeum/games-core/games/chess/chess-bot-search';
import { getLegalMoves } from './chess.move-generator';

const engine = new ChessEngine();

describe('computeBotThinkTimeMs', () => {
  const base = () => engine.initializeState(['bot-1', 'p2']);

  it('never answers instantly', () => {
    expect(computeBotThinkTimeMs(base(), 20, () => 0)).toBeGreaterThanOrEqual(
      MIN_THINK_MS,
    );
  });

  it('is quick for forced moves and varies with randomness', () => {
    const forced = computeBotThinkTimeMs(base(), 1, () => 1);
    expect(forced).toBeLessThanOrEqual(800);
    const s = base();
    s.moveHistory = new Array(20).fill(null) as ChessState['moveHistory'];
    const short = computeBotThinkTimeMs(s, 30, () => 0.1);
    const long = computeBotThinkTimeMs(s, 30, () => 0.95);
    expect(long).toBeGreaterThan(short);
    expect(long).toBeLessThanOrEqual(3_200);
  });

  it('spends only a small slice of a timed clock and rushes when low', () => {
    const s = engine.initializeState(['bot-1', 'p2'], {
      timeControl: { type: 'bullet', initialSeconds: 60, incrementSeconds: 0 },
    });
    s.moveHistory = new Array(20).fill(null) as ChessState['moveHistory'];
    expect(computeBotThinkTimeMs(s, 30, () => 1)).toBeLessThanOrEqual(1_500);
    s.clocks!.white.remainingMs = 5_000;
    expect(computeBotThinkTimeMs(s, 30, () => 1)).toBe(MIN_THINK_MS);
  });
});

describe('shouldBotAcceptDraw', () => {
  it('accepts in a level position', () => {
    const s = engine.initializeState(['bot-1', 'p2']);
    expect(shouldBotAcceptDraw(s, 'white')).toBe(true);
  });

  it('declines when clearly winning and accepts when losing', () => {
    const s = engine.initializeState(['bot-1', 'p2']);
    s.board = parseFen('4k3/8/8/8/8/8/8/QQ2K3');
    expect(shouldBotAcceptDraw(s, 'white')).toBe(false);
    expect(shouldBotAcceptDraw(s, 'black')).toBe(true);
  });
});

describe('ChessBotSearchPool', () => {
  const state = engine.initializeState(['bot-1', 'p2']);
  const isLegal = (
    m: {
      from: { file: string; rank: number };
      to: { file: string; rank: number };
    } | null,
  ) =>
    !!m &&
    getLegalMoves(state, 'white').some(
      (l) =>
        l.from.file === m.from.file &&
        l.from.rank === m.from.rank &&
        l.to.file === m.to.file &&
        l.to.rank === m.to.rank,
    );

  function workerScript(body: string): string {
    const dir = mkdtempSync(join(tmpdir(), 'chess-pool-'));
    const file = join(dir, 'worker.js');
    writeFileSync(
      file,
      `const { parentPort } = require('node:worker_threads');\nparentPort.on('message', (msg) => { ${body} });\n`,
    );
    return file;
  }

  it('searches in-process when no compiled worker exists', async () => {
    const pool = new ChessBotSearchPool(1, null);
    expect(pool.usesWorkers).toBe(false);
    expect(isLegal(await pool.search({ state, timeBudgetMs: 100 }))).toBe(true);
  });

  it('returns the worker reply', async () => {
    const reply = searchBotMove({ state, timeBudgetMs: 50 });
    const pool = new ChessBotSearchPool(
      1,
      workerScript(
        `parentPort.postMessage({ id: msg.id, move: ${JSON.stringify(reply)} });`,
      ),
    );
    try {
      await expect(pool.search({ state, timeBudgetMs: 50 })).resolves.toEqual(
        reply,
      );
    } finally {
      await pool.destroy();
    }
  });

  it('falls back in-process when a worker hangs', async () => {
    const pool = new ChessBotSearchPool(1, workerScript('/* never replies */'));
    try {
      const move = await pool.search({ state, timeBudgetMs: -4_900 });
      expect(isLegal(move)).toBe(true);
    } finally {
      await pool.destroy();
    }
  });

  it('falls back in-process when a worker crashes', async () => {
    const pool = new ChessBotSearchPool(
      1,
      workerScript('throw new Error("boom");'),
    );
    try {
      expect(isLegal(await pool.search({ state, timeBudgetMs: 100 }))).toBe(
        true,
      );
    } finally {
      await pool.destroy();
    }
  });
});

describe('ChessBotService pacing', () => {
  function sessionOf(state: ChessState): GameSessionSummary {
    return {
      id: 's1',
      roomId: 'room-1',
      gameId: 'chess_v1',
      status: 'active',
      state,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as GameSessionSummary;
  }

  function makeBot(sessions: GameSessionSummary[]) {
    const chessService = {
      findSessionByRoom: jest.fn(),
      completeSession: jest.fn(),
      takebackAccept: jest.fn().mockResolvedValue({}),
      drawAccept: jest.fn().mockResolvedValue({}),
      drawDecline: jest.fn().mockResolvedValue({}),
    };
    sessions.forEach((s) =>
      chessService.findSessionByRoom.mockResolvedValueOnce(s),
    );
    const bot = new ChessBotService(chessService as never, null);
    const moveFn = jest.fn().mockResolvedValue({});
    bot.setMoveFn(moveFn);
    const pause = jest
      .fn<Promise<void>, [number]>()
      .mockResolvedValue(undefined);
    bot.pause = pause;
    return { bot, chessService, moveFn, pause };
  }

  it('pauses for a natural think time before moving', async () => {
    const s = sessionOf(engine.initializeState(['bot-1', 'p2']));
    const { bot, moveFn, pause } = makeBot([s, s]);
    await bot.checkAndPlay(s);
    expect(pause).toHaveBeenCalledTimes(1);
    expect(pause.mock.calls[0][0]).toBeGreaterThan(0);
    expect(moveFn).toHaveBeenCalledTimes(1);
  });

  it('does not move if the position changed while thinking', async () => {
    const state = engine.initializeState(['bot-1', 'p2']);
    const s = sessionOf(state);
    const resigned = sessionOf({ ...state, winnerColor: 'black' });
    (resigned as { status: string }).status = 'completed';
    const { bot, moveFn } = makeBot([s, resigned]);
    await bot.checkAndPlay(s);
    expect(moveFn).not.toHaveBeenCalled();
  });

  it('declines a draw offer when clearly better', async () => {
    const state = engine.initializeState(['bot-1', 'p2']);
    state.board = parseFen('4k3/8/8/8/8/8/8/QQ2K3');
    state.currentTurnColor = 'black';
    state.drawOfferedBy = 'p2';
    const s = sessionOf(state);
    const { bot, chessService } = makeBot([s]);
    await bot.checkAndPlay(s);
    expect(chessService.drawDecline).toHaveBeenCalledWith('bot-1', 'room-1');
    expect(chessService.drawAccept).not.toHaveBeenCalled();
  });
});
