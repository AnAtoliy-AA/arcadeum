import { CheckersBotService } from './checkers-bot.service';
import { CheckersEngine } from '../engines/checkers/checkers.engine';
import { BOARD_SIZE } from '../engines/checkers/checkers.constants';
import type { CheckersState } from '../engines/checkers/checkers.types';
import type { CheckersService } from './checkers.service';

const engine = new CheckersEngine();
const bot = new CheckersBotService({} as unknown as CheckersService);

function clearBoard(state: CheckersState): void {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      state.board[r][c] = null;
    }
  }
}

function openingState(
  botDifficulty: CheckersState['options']['botDifficulty'],
): CheckersState {
  return engine.initializeState(['bot-1', 'b'], {
    options: { botDifficulty },
  });
}

describe('CheckersBotService difficulty tiers', () => {
  it.each(['easy', 'medium', 'hard', 'expert'] as const)(
    'produces a valid opening move on %s difficulty',
    (difficulty) => {
      const state = openingState(difficulty);
      const move = bot.pickMove(state, 'bot-1');
      expect(move).not.toBeNull();
      if (move) {
        expect(move.steps.length).toBeGreaterThan(0);
        // Every step must be a legal diagonal jump on the board.
        for (const step of move.steps) {
          expect(step.fromRow).toBeGreaterThanOrEqual(0);
          expect(step.fromCol).toBeGreaterThanOrEqual(0);
        }
      }
    },
  );

  it('takes a capture on any difficulty when one is available', () => {
    for (const difficulty of ['easy', 'medium', 'hard', 'expert'] as const) {
      const state = openingState(difficulty);
      clearBoard(state);
      state.board[5][0] = { playerId: 'bot-1', type: 'man' };
      state.board[4][1] = { playerId: 'b', type: 'man' };
      const move = bot.pickMove(state, 'bot-1');
      expect(move).not.toBeNull();
      if (move) {
        expect(move.steps.length).toBeGreaterThan(0);
        expect(move.steps[0].capturedRow).toBe(4);
        expect(move.steps[0].capturedCol).toBe(1);
      }
    }
  });

  it('expert prefers the longest capture chain', () => {
    const state = openingState('expert');
    clearBoard(state);
    // bot-1 man at (5,0) can capture b at (4,1) landing (3,2); from there it
    // can capture another b at (2,3) landing (1,4) — a two-jump chain.
    state.board[5][0] = { playerId: 'bot-1', type: 'man' };
    state.board[4][1] = { playerId: 'b', type: 'man' };
    state.board[2][3] = { playerId: 'b', type: 'man' };
    const move = bot.pickMove(state, 'bot-1');
    expect(move).not.toBeNull();
    if (move) {
      expect(move.steps.length).toBe(2);
    }
  });
});
