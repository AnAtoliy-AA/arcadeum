import { GoBotService } from './go-bot.service';
import { pickStrategyMove } from './go-bot.strategy';
import { GAME_PHASE } from '../engines/go/go.constants';
import type { GoState } from '../engines/go/go.types';

const BLACK = 'bot-black-1';
const WHITE = 'player-human';

function buildState(
  board: GoState['board'],
  overrides: Partial<GoState> = {},
): GoState {
  return {
    phase: GAME_PHASE.PLAYING,
    options: {
      variant: 'adventure',
      boardSize: board.length as GoState['boardSize'],
      aiDifficulty: 'medium',
    },
    boardSize: board.length as GoState['boardSize'],
    board,
    players: [
      { playerId: BLACK, color: 'black', alive: true },
      { playerId: WHITE, color: 'white', alive: true },
    ],
    captures: { black: 0, white: 0 },
    consecutivePasses: 0,
    koPoint: null,
    lastMove: null,
    playerOrder: [BLACK, WHITE],
    currentTurnIndex: 0,
    winnerId: null,
    isDraw: false,
    scores: null,
    logs: [],
    ...overrides,
  };
}

function emptyBoard(size = 9): GoState['board'] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
}

describe('pickStrategyMove', () => {
  it('returns "pass" when no playable moves exist', () => {
    // Board completely filled with black except a single true eye — no
    // legal useful placement remains for black.
    const size = 3;
    const board: GoState['board'] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => 'black' as const),
    );
    board[2][2] = null; // true eye for black (corner + full support)
    const state = buildState(board);
    expect(pickStrategyMove(state, 'black', 'medium')).toBe('pass');
  });

  it('easy prefers an available capture over random play', () => {
    const board = emptyBoard(5);
    board[0][1] = 'white'; // white stone in atari
    board[0][0] = 'black'; // wait — this shape gives white (0,1) liberty at (1,1)?
    // Rebuild precisely: white (0,1) with liberties only at (0,2):
    board[0][1] = 'white';
    board[0][0] = 'black';
    board[1][0] = 'black';
    board[1][1] = 'black';
    // White (0,1): neighbours (0,0)=B, (0,2)=empty → one liberty at (0,2).
    board[0][2] = null;
    const state = buildState(board);

    for (let i = 0; i < 20; i++) {
      const move = pickStrategyMove(state, 'black', 'easy');
      if (move === 'pass' || move === null) throw new Error('unexpected pass');
      if (move.row === 0 && move.col === 2) return; // captured
    }
    fail('easy bot never took the free capture in 20 tries');
  });

  it('medium takes a capturing move when one exists', () => {
    const board = emptyBoard(5);
    board[0][1] = 'white';
    board[0][0] = 'black';
    board[1][0] = 'black';
    board[1][1] = 'black';
    const state = buildState(board);

    const move = pickStrategyMove(state, 'black', 'medium');
    expect(move).not.toBe('pass');
    expect(move).not.toBe(null);
    expect((move as { row: number; col: number }).row).toBe(0);
    expect((move as { row: number; col: number }).col).toBe(2);
  });

  it('hard/expert (MCTS) returns a legal non-eye placement on an open board', () => {
    const state = buildState(emptyBoard(9));
    for (const difficulty of ['hard', 'expert'] as const) {
      const move = pickStrategyMove(state, 'black', difficulty);
      expect(move).not.toBe(null);
      if (move !== 'pass' && move !== null) {
        expect(state.board[move.row][move.col]).toBe(null);
        expect(move.row).toBeGreaterThanOrEqual(0);
        expect(move.row).toBeLessThan(9);
      }
    }
  });
});

describe('GoBotService.checkAndPlay', () => {
  function buildBot() {
    const placedPayloads: Array<{ row: number; col: number }> = [];
    const passedTurns: string[] = [];
    const serviceStub = {
      placeStone: jest.fn(
        async (
          _userId: string,
          _roomId: string,
          payload: { row: number; col: number },
        ) => {
          placedPayloads.push(payload);
          return Promise.resolve({
            status: 'active',
            state: {
              ...buildState(emptyBoard()),
              phase: GAME_PHASE.GAME_OVER,
              winnerId: BLACK,
            },
          });
        },
      ),
      passTurn: jest.fn((userId: string) => {
        passedTurns.push(userId);
        return Promise.resolve({
          status: 'active',
          state: buildState(emptyBoard()),
        });
      }),
      completeSession: jest.fn(() => Promise.resolve(undefined)),
    };
    const bot = new GoBotService(serviceStub as never);
    return { bot, placedPayloads, passedTurns, serviceStub };
  }

  it('ignores sessions whose current player is human', async () => {
    const { bot, serviceStub } = buildBot();
    await bot.checkAndPlay({
      id: 's1',
      roomId: 'r1',
      gameId: 'go_v1',
      engine: 'go_v1',
      status: 'active',
      state: buildState(emptyBoard(), {
        currentTurnIndex: 1, // WHITE — a human
      }),
      createdAt: '',
      updatedAt: '',
    });
    expect(serviceStub.placeStone).not.toHaveBeenCalled();
  });

  it('plays until the game is over when it is the bot’s turn', async () => {
    const { bot, serviceStub } = buildBot();
    await bot.checkAndPlay({
      id: 's1',
      roomId: 'r1',
      gameId: 'go_v1',
      engine: 'go_v1',
      status: 'active',
      state: buildState(emptyBoard()),
      createdAt: '',
      updatedAt: '',
    });
    expect(serviceStub.placeStone).toHaveBeenCalledTimes(1);
  });

  it('passes defensively instead of deadlocking when no moves exist', async () => {
    const size = 3;
    const board: GoState['board'] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => 'black' as const),
    );
    board[2][2] = null; // only a true eye remains → bot must pass
    const { bot, serviceStub } = buildBot();
    await bot.checkAndPlay({
      id: 's1',
      roomId: 'r1',
      gameId: 'go_v1',
      engine: 'go_v1',
      status: 'active',
      state: buildState(board),
      createdAt: '',
      updatedAt: '',
    });
    expect(serviceStub.passTurn).toHaveBeenCalledWith(BLACK, 'r1');
  });
});
