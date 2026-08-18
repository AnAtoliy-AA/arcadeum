import { TicTacToeBotService } from './tic-tac-toe-bot.service';
import { TicTacToeEngine } from '../engines/tic-tac-toe/tic-tac-toe.engine';
import { GameActionContext } from '../engines/base/game-engine.interface';
import type { TicTacToeService } from './tic-tac-toe.service';

const engine = new TicTacToeEngine();
const bot = new TicTacToeBotService({} as unknown as TicTacToeService);

function ctx(userId: string): GameActionContext {
  return { userId, roomId: 'r', sessionId: 's', timestamp: new Date() };
}

describe('TicTacToeBotService difficulty tiers', () => {
  it('expert picks the center on an empty 5×5 (highest line potential)', () => {
    const state = engine.initializeState(['bot-1', 'b'], {
      options: { boardSize: 5, aiDifficulty: 'expert' },
    });
    const move = bot.pickMove(state, 'bot-1');
    expect(move).toEqual({ row: 2, col: 2 });
  });

  it('expert completes a winning line when available', () => {
    let state = engine.initializeState(['bot-1', 'b'], {
      options: { boardSize: 5, aiDifficulty: 'expert' },
    });
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

  it('medium blocks an immediate opponent win on 5×5', () => {
    let state = engine.initializeState(['bot-1', 'b'], {
      options: { boardSize: 5, aiDifficulty: 'medium' },
    });
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

  it('easy never plays an occupied cell even when a win is available', () => {
    let state = engine.initializeState(['bot-1', 'b'], {
      options: { boardSize: 3, aiDifficulty: 'easy' },
    });
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
    for (let i = 0; i < 25; i++) {
      const move = bot.pickMove(state, 'bot-1');
      expect(move).not.toBeNull();
      if (move) expect(state.board[move.row][move.col]).toBeNull();
    }
  });

  it('easy only occasionally takes an obvious win', () => {
    let state = engine.initializeState(['bot-1', 'b'], {
      options: { boardSize: 3, aiDifficulty: 'easy' },
    });
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
    let winPicks = 0;
    const trials = 60;
    for (let i = 0; i < trials; i++) {
      const move = bot.pickMove(state, 'bot-1');
      if (move && move.row === 0 && move.col === 2) winPicks++;
    }
    // Easy only grabs the win ~15% of the time, so it must NOT always win.
    expect(winPicks).toBeLessThan(trials);
  });

  it('expert plays the perfect winning move on 3×3', () => {
    let state = engine.initializeState(['bot-1', 'b'], {
      options: { boardSize: 3, aiDifficulty: 'expert' },
    });
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
    const move = bot.pickMove(state, 'bot-1');
    expect(move).toEqual({ row: 0, col: 2 });
  });
});
