import { GoEngine } from './go.engine';
import { GAME_PHASE } from './go.constants';
import type { GoState } from './go.types';

const PLAYER_A = 'player-a';
const PLAYER_B = 'player-b';

/** Test harness with deterministic color access. */
class Harness {
  engine = new GoEngine();
  state: GoState;

  constructor(boardSize: number = 9) {
    this.state = this.engine.initializeState([PLAYER_A, PLAYER_B], {
      options: { boardSize: boardSize as GoState['boardSize'] },
    });
    // Pin colors deterministically for tests (random assignment itself is
    // covered by a dedicated test below).
    this.state.players[0].color = 'black';
    this.state.players[1].color = 'white';
  }

  get black(): string {
    return this.state.players.find((p) => p.color === 'black')!.playerId;
  }

  get white(): string {
    return this.state.players.find((p) => p.color === 'white')!.playerId;
  }

  currentId(): string {
    return this.state.playerOrder[this.state.currentTurnIndex];
  }

  place(userId: string, row: number, col: number): void {
    const result = this.engine.executeAction(
      this.state,
      'place_stone',
      ctx(userId),
      { row, col },
    );
    if (!result.success || !result.state) {
      throw new Error(result.error ?? 'place_stone failed');
    }
    this.state = result.state;
  }

  tryPlace(userId: string, row: number, col: number) {
    return this.engine.executeAction(this.state, 'place_stone', ctx(userId), {
      row,
      col,
    });
  }

  pass(userId: string): void {
    const result = this.engine.executeAction(
      this.state,
      'pass_turn',
      ctx(userId),
    );
    if (!result.success || !result.state) {
      throw new Error(result.error ?? 'pass failed');
    }
    this.state = result.state;
  }

  /** Inject a hand-built board while keeping players/logs intact. */
  injectBoard(board: GoState['board']): void {
    this.state = {
      ...this.state,
      boardSize: board.length as GoState['boardSize'],
      board,
      consecutivePasses: 0,
      koPoint: null,
      lastMove: null,
    };
  }

  setTurn(userId: string): void {
    this.state = {
      ...this.state,
      currentTurnIndex: this.state.playerOrder.indexOf(userId),
    };
  }
}

function ctx(userId: string) {
  return {
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  };
}

describe('GoEngine', () => {
  it('exposes metadata for go_v1', () => {
    const meta = new GoEngine().getMetadata();
    expect(meta.gameId).toBe('go_v1');
    expect(meta.minPlayers).toBe(2);
    expect(meta.maxPlayers).toBe(2);
    expect(meta.name).toBe('Go');
  });

  describe('initializeState', () => {
    it('creates an empty board of the requested size', () => {
      const h = new Harness(13);
      expect(h.state.boardSize).toBe(13);
      expect(h.state.board.length).toBe(13);
      expect(h.state.board.flat().every((cell) => cell === null)).toBe(true);
    });

    it('falls back to 9×9 for unsupported sizes', () => {
      const engine = new GoEngine();
      const state = engine.initializeState([PLAYER_A, PLAYER_B], {
        options: { boardSize: 25 as unknown as 9 },
      });
      expect(state.boardSize).toBe(9);
    });

    it('assigns black to players[0] and lets black move first', () => {
      const h = new Harness();
      expect(h.state.players[0].color).toBe('black');
      expect(h.currentId()).toBe(h.black);
    });

    it('randomizes color assignment across seeds', () => {
      const engine = new GoEngine();
      const assignments = new Set<string>();
      for (let i = 0; i < 40 && assignments.size < 2; i++) {
        const s = engine.initializeState([PLAYER_A, PLAYER_B]);
        assignments.add(s.players.find((p) => p.playerId === PLAYER_A)!.color);
      }
      expect(assignments.size).toBe(2);
    });
  });

  describe('place_stone', () => {
    it('places a stone, switches turns and records lastMove', () => {
      const h = new Harness();
      h.place(h.black, 4, 4);
      expect(h.state.board[4][4]).toBe('black');
      expect(h.currentId()).toBe(h.white);
      expect(h.state.lastMove).toEqual({ row: 4, col: 4 });
    });

    it('rejects moves by the wrong player', () => {
      const h = new Harness();
      const result = h.tryPlace(h.white, 0, 0);
      expect(result.success).toBe(false);
    });

    it('rejects occupied intersections', () => {
      const h = new Harness();
      h.place(h.black, 2, 2);
      const result = h.tryPlace(h.white, 2, 2);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/occupied/i);
    });

    it('rejects out-of-bounds and non-integer coordinates', () => {
      const h = new Harness();
      expect(h.tryPlace(h.black, 9, 9).success).toBe(false);
      expect(h.tryPlace(h.black, Number.NaN, 0).success).toBe(false);
      expect(h.tryPlace(h.black, 1.5, 0).success).toBe(false);
    });

    it('captures a lone opposing stone with no liberties', () => {
      const h2 = new Harness();
      h2.place(h2.black, 0, 0); // black dummy first
      h2.place(h2.white, 4, 4); // white victim center
      h2.place(h2.black, 4, 3);
      h2.place(h2.white, 8, 8);
      h2.place(h2.black, 3, 4);
      h2.place(h2.white, 8, 7);
      h2.place(h2.black, 5, 4);
      h2.place(h2.white, 8, 6);
      h2.place(h2.black, 4, 5); // final liberty closed → capture
      expect(h2.state.board[4][4]).toBe(null);
      expect(h2.state.captures.black).toBe(1);
      expect(h2.state.logs.some((l) => l.message.includes('captured 1'))).toBe(
        true,
      );
    });

    it('rejects suicide placements', () => {
      const h = new Harness();
      h.place(h.black, 0, 1); // wall right of corner
      h.place(h.white, 8, 8);
      h.place(h.black, 1, 0); // wall below corner
      const result = h.tryPlace(h.white, 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/suicide/i);
    });

    it('enforces simple ko — immediate recapture forbidden once', () => {
      const h = new Harness(5);

      // Hand-built classic ko shape (see design doc):
      //
      //   col:  0 1 2
      //   r0:   . B W
      //   r1:   B W W
      //   r2:   . . .
      //
      // White plays (0,0): captures B(0,1) (its last liberty), and the new
      // white stone's only liberty is the captured point → koPoint=(0,1).
      h.injectBoard([
        [null, 'black', 'white', null, null],
        ['black', 'white', 'white', null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
      ]);
      h.setTurn(h.white);
      h.place(h.white, 0, 0);

      expect(h.state.board[0][1]).toBe(null);
      expect(h.state.captures.white).toBe(1);
      expect(h.state.koPoint).toEqual({ row: 0, col: 1 });

      const recapture = h.tryPlace(h.black, 0, 1);
      expect(recapture.success).toBe(false);
      expect(recapture.error).toMatch(/ko/i);

      // After each side plays elsewhere the ban lifts and black may take
      // the ko back — capturing the white stone at (0,0).
      h.place(h.black, 4, 4); // ko threat (clears koPoint)
      expect(h.state.koPoint).toBe(null);
      h.place(h.white, 4, 3); // white responds elsewhere
      const retake = h.tryPlace(h.black, 0, 1);
      expect(retake.success).toBe(true);
      if (retake.success && retake.state) h.state = retake.state;
      expect(h.state.board[0][1]).toBe('black');
      expect(h.state.board[0][0]).toBe(null);
      expect(h.state.captures.black).toBe(1);
      expect(h.state.koPoint).toEqual({ row: 0, col: 0 });
    });
  });

  describe('pass / scoring', () => {
    it('ends the game after two consecutive passes and scores with komi', () => {
      const h = new Harness();
      h.place(h.black, 0, 0); // black stone + its territory
      h.pass(h.white);
      expect(h.state.phase).toBe(GAME_PHASE.PLAYING);
      expect(h.state.consecutivePasses).toBe(1);
      h.pass(h.black);

      expect(h.state.phase).toBe(GAME_PHASE.GAME_OVER);
      // Chinese area: black 1 stone + 80 territory = 81; white komi only.
      expect(h.state.scores).toEqual({ black: 81, white: 7.5 });
      expect(h.state.winnerId).toBe(h.black);
      expect(new GoEngine().getWinners(h.state)).toEqual([h.black]);
    });

    it('resets the pass counter after an intervening move', () => {
      const h = new Harness();
      h.pass(h.black);
      expect(h.state.consecutivePasses).toBe(1);
      h.place(h.white, 3, 3);
      expect(h.state.consecutivePasses).toBe(0);
    });

    it('rejects actions after game over', () => {
      const h = new Harness();
      h.pass(h.black);
      h.pass(h.white);
      const result = h.tryPlace(h.black, 1, 1);
      expect(result.success).toBe(false);
    });
  });

  describe('forfeit', () => {
    it('awards the win to the opponent', () => {
      const h = new Harness();
      const result = h.engine.executeAction(h.state, 'forfeit', ctx(h.black));
      expect(result.success).toBe(true);
      expect(result.state?.winnerId).toBe(h.white);
      expect(h.engine.isGameOver(result.state!)).toBe(true);
    });

    it('marks the resigner dead in the new state and leaves the input state untouched', () => {
      const h = new Harness();
      const inputState = h.state;
      const result = h.engine.executeAction(h.state, 'forfeit', ctx(h.black));
      expect(result.success).toBe(true);
      expect(
        result.state?.players.find((p) => p.playerId === h.black)?.alive,
      ).toBe(false);
      expect(
        inputState.players.find((p) => p.playerId === h.black)?.alive,
      ).toBe(true);
    });

    it('rejects forfeit after game over', () => {
      const h = new Harness();
      h.pass(h.black);
      h.pass(h.white);
      const result = h.engine.executeAction(h.state, 'forfeit', ctx(h.black));
      expect(result.success).toBe(false);
    });
  });

  describe('getAvailableActions / validateConfig', () => {
    it('offers place+pass+forfeit to the mover and forfeit to the waiting player', () => {
      const h = new Harness();
      expect(h.engine.getAvailableActions(h.state, h.black)).toEqual([
        'place_stone',
        'pass_turn',
        'forfeit',
      ]);
      expect(h.engine.getAvailableActions(h.state, h.white)).toEqual([
        'forfeit',
      ]);
    });

    it('returns no actions once the game is over', () => {
      const h = new Harness();
      h.pass(h.black);
      h.pass(h.white);
      expect(h.engine.getAvailableActions(h.state, h.black)).toEqual([]);
    });

    it('validates config board sizes', () => {
      const engine = new GoEngine();
      expect(engine.validateConfig({ options: { boardSize: 19 } })).toBe(true);
      expect(engine.validateConfig({ options: { boardSize: 11 } })).toBe(false);
      expect(engine.validateConfig({})).toBe(true);
    });
  });
});
