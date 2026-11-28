import { ChessEngine } from './chess.engine';
import { parseFen } from './chess.board';
import type { ChessState, MovePayload } from './chess.types';
import { hasMatingMaterial, toFen } from './index';

const ctx = (userId: string) => ({
  userId,
  roomId: 'r1',
  sessionId: 's1',
  timestamp: new Date(),
});

const mv = (uci: string): MovePayload => ({
  fromFile: uci[0] as MovePayload['fromFile'],
  fromRank: Number(uci[1]) as MovePayload['fromRank'],
  toFile: uci[2] as MovePayload['toFile'],
  toRank: Number(uci[3]) as MovePayload['toRank'],
});

describe('Chess timeout (FIDE 6.9)', () => {
  const engine = new ChessEngine();

  function setup(placement: string, turn: 'white' | 'black'): ChessState {
    const state = engine.initializeState(['w', 'b']);
    state.board = parseFen(placement);
    state.currentTurnColor = turn;
    state.castlingRights = {
      whiteKingSide: false,
      whiteQueenSide: false,
      blackKingSide: false,
      blackQueenSide: false,
    };
    state.positionHistory = [toFen(state)];
    return state;
  }

  /** A blitz game where the side to move has just run out of time. */
  function flagged(placement: string): ChessState {
    const s = setup(placement, 'white');
    s.timeControl = {
      type: 'blitz',
      initialSeconds: 60,
      incrementSeconds: 0,
    };
    const now = Date.now();
    s.clocks = {
      white: {
        remainingSeconds: 1,
        remainingMs: 1000,
        lastMoveTimestamp: now - 30_000,
      },
      black: {
        remainingSeconds: 60,
        remainingMs: 60_000,
        lastMoveTimestamp: now - 10_000,
      },
    };
    return s;
  }

  it('is a draw when the opponent has only a king', () => {
    const s = flagged('4k3/8/8/8/8/8/8/Q3K3');
    const res = engine.executeAction(s, 'timeout', ctx('w'));
    expect(res.state?.isDrawByTimeout).toBe(true);
    expect(res.state?.endReason).toBe('timeout_vs_insufficient');
    expect(res.state?.clocks?.white.remainingMs).toBe(0);
    expect(engine.getResult(res.state!)).toEqual({
      winnerIds: [],
      isDraw: true,
    });
  });

  it('is a loss when the opponent can still mate', () => {
    const s = flagged('4k2r/8/8/8/8/8/8/4K3');
    const res = engine.executeAction(s, 'timeout', ctx('w'));
    expect(res.state?.winnerColor).toBe('black');
    expect(res.state?.endReason).toBe('timeout');
  });

  it('treats a lone knight as mating material when the defender has pawns', () => {
    expect(hasMatingMaterial(parseFen('4k1n1/8/8/8/8/8/P7/4K3'), 'black')).toBe(
      true,
    );
    expect(hasMatingMaterial(parseFen('4k1n1/8/8/8/8/8/8/4K3'), 'black')).toBe(
      false,
    );
  });

  it('only lets the flagged side to move time out', () => {
    const s = flagged('4k3/8/8/8/8/8/8/Q3K3');
    expect(engine.validateAction(s, 'timeout', ctx('b'))).toBe(false);
    const fresh = setup('4k3/8/8/8/8/8/8/Q3K3', 'white');
    expect(engine.validateAction(fresh, 'timeout', ctx('w'))).toBe(false);
  });

  it('rejects a move after the flag has fallen', () => {
    const s = flagged('4k3/8/8/8/8/8/8/Q3K3');
    const res = engine.executeAction(s, 'move', ctx('w'), mv('a1a2'));
    expect(res.success).toBe(false);
  });
});
