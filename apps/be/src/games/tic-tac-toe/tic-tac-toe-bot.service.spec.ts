import { TicTacToeBotService } from './tic-tac-toe-bot.service';
import { TicTacToeEngine } from '../engines/tic-tac-toe/tic-tac-toe.engine';
import { GameActionContext } from '../engines/base/game-engine.interface';

import type { TicTacToeService } from './tic-tac-toe.service';

const engine = new TicTacToeEngine();
// We are not exercising the service.checkAndPlay loop here — only the pure
// pickMove strategy — so the forwardRef on TicTacToeService is never invoked.
const bot = new TicTacToeBotService({} as unknown as TicTacToeService);

function ctx(userId: string): GameActionContext {
  return { userId, roomId: 'r', sessionId: 's', timestamp: new Date() };
}

describe('TicTacToeBotService.pickMove', () => {
  describe('3×3 minimax', () => {
    it('takes the winning move when available', () => {
      let state = engine.initializeState(['bot-1', 'b']);
      // bot at (0,0) and (0,1) — needs (0,2) to win
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 0,
        col: 0,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 1,
        col: 0,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 0,
        col: 1,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 2,
        col: 2,
      }).state!;
      // Now it's bot-1's turn
      const move = bot.pickMove(state, 'bot-1');
      expect(move).toEqual({ row: 0, col: 2 });
    });

    it('blocks the opponent winning move when own win not available', () => {
      let state = engine.initializeState(['bot-1', 'b']);
      // b at (0,0) and (0,1) — bot must block (0,2)
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 1,
        col: 1,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 0,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 2,
        col: 2,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 1,
      }).state!;
      const move = bot.pickMove(state, 'bot-1');
      expect(move).toEqual({ row: 0, col: 2 });
    });

    it('never loses on 3×3 from the second-move position', () => {
      // Play 20 games where bot plays second; bot must never lose. Opponent
      // plays the center first, then makes random valid moves.
      for (let trial = 0; trial < 20; trial++) {
        let state = engine.initializeState(['b', 'bot-1']);
        state = engine.executeAction(state, 'place_mark', ctx('b'), {
          row: 1,
          col: 1,
        }).state!;
        while (state.phase === 'playing') {
          const currentId = state.playerOrder[state.currentTurnIndex];
          if (currentId === 'bot-1') {
            const move = bot.pickMove(state, 'bot-1')!;
            state = engine.executeAction(
              state,
              'place_mark',
              ctx('bot-1'),
              move,
            ).state!;
          } else {
            // Random valid move for opponent
            const empties: Array<{ row: number; col: number }> = [];
            for (let r = 0; r < 3; r++)
              for (let c = 0; c < 3; c++) {
                if (state.board[r][c] === null)
                  empties.push({ row: r, col: c });
              }
            const choice = empties[Math.floor(Math.random() * empties.length)];
            state = engine.executeAction(
              state,
              'place_mark',
              ctx('b'),
              choice,
            ).state!;
          }
        }
        // Bot must not have lost
        expect(state.winnerId).not.toBe('b');
      }
    });
  });

  describe('5×5 heuristic', () => {
    it('completes a 4-in-row when available', () => {
      let state = engine.initializeState(['bot-1', 'b'], {
        options: { boardSize: 5 },
      });
      // bot owns (2,0), (2,1), (2,2); needs (2,3) to win
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 2,
        col: 0,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 0,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 2,
        col: 1,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 1,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 2,
        col: 2,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 2,
      }).state!;
      const move = bot.pickMove(state, 'bot-1');
      expect(move).toEqual({ row: 2, col: 3 });
    });

    it('blocks opponent 3-in-row before completion', () => {
      let state = engine.initializeState(['bot-1', 'b'], {
        options: { boardSize: 5 },
      });
      // b has (0,0)(0,1)(0,2); bot scatters and should block at (0,3).
      // Bot moves are deliberately non-threatening so the only urgent action
      // is blocking.
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 4,
        col: 4,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 0,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 3,
        col: 1,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 1,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('bot-1'), {
        row: 2,
        col: 4,
      }).state!;
      state = engine.executeAction(state, 'place_mark', ctx('b'), {
        row: 0,
        col: 2,
      }).state!;
      const move = bot.pickMove(state, 'bot-1');
      expect(move).toEqual({ row: 0, col: 3 });
    });
  });

  describe('9×9 random', () => {
    it('returns an empty cell', () => {
      const state = engine.initializeState(['bot-1', 'b'], {
        options: { boardSize: 9 },
      });
      const move = bot.pickMove(state, 'bot-1')!;
      expect(state.board[move.row][move.col]).toBe(null);
    });
  });

  describe('isBot', () => {
    it('returns true for ids starting with bot-', () => {
      expect(bot.isBot('bot-1')).toBe(true);
      expect(bot.isBot('user-abc')).toBe(false);
    });
  });
});
