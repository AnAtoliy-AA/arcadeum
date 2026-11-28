import { ChessEngine } from './chess.engine';
import { parseFen } from './chess.board';
import type { ChessState, MovePayload } from './chess.types';
import { getLegalMoves } from './chess.move-generator';
import {
  applyBotMove,
  hasMatingMaterial,
  isInsufficientMaterial,
  repetitionKey,
  toFen,
} from './index';

const ctx = (userId: string) => ({
  userId,
  roomId: 'r1',
  sessionId: 's1',
  timestamp: new Date(),
});

function mv(uci: string, promotion?: MovePayload['promotion']): MovePayload {
  return {
    fromFile: uci[0] as MovePayload['fromFile'],
    fromRank: Number(uci[1]) as MovePayload['fromRank'],
    toFile: uci[2] as MovePayload['toFile'],
    toRank: Number(uci[3]) as MovePayload['toRank'],
    promotion,
  };
}

describe('Chess FIDE rules', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  /** Builds a game from a FEN-like setup (placement, side to move, rights). */
  function setup(
    placement: string,
    turn: 'white' | 'black' = 'white',
    rights = '-',
  ): ChessState {
    const state = engine.initializeState(['w', 'b']);
    state.board = parseFen(placement);
    state.currentTurnColor = turn;
    state.castlingRights = {
      whiteKingSide: rights.includes('K'),
      whiteQueenSide: rights.includes('Q'),
      blackKingSide: rights.includes('k'),
      blackQueenSide: rights.includes('q'),
    };
    state.positionHistory = [toFen(state)];
    return state;
  }

  function play(state: ChessState, ...moves: string[]): ChessState {
    let s = state;
    for (const m of moves) {
      const user = s.currentTurnColor === 'white' ? 'w' : 'b';
      const promo =
        m.length > 4 ? (m.slice(4) as MovePayload['promotion']) : undefined;
      const res = engine.executeAction(s, 'move', ctx(user), mv(m, promo));
      if (!res.success) throw new Error(`Move ${m} failed: ${res.error}`);
      s = res.state!;
    }
    return s;
  }

  const castles = (s: ChessState) =>
    getLegalMoves(s, s.currentTurnColor).filter((m) => m.isCastle);

  describe('castling', () => {
    it('forbids castling through an attacked square', () => {
      // Black rook on f8 covers f1.
      const s = setup('4kr2/8/8/8/8/8/8/R3K2R', 'white', 'KQ');
      const files = castles(s).map((m) => m.to.file);
      expect(files).toEqual(['c']);
    });

    it('forbids castling into check', () => {
      const s = setup('4k1r1/8/8/8/8/8/8/R3K2R', 'white', 'KQ');
      expect(castles(s).map((m) => m.to.file)).toEqual(['c']);
    });

    it('allows queenside castling when only b1 is attacked', () => {
      const s = setup('1r2k3/8/8/8/8/8/8/R3K3', 'white', 'Q');
      expect(castles(s).map((m) => m.to.file)).toEqual(['c']);
    });

    it('never castles with an opponent rook', () => {
      const s = setup('4k3/8/8/8/8/8/8/4K2r', 'white', 'K');
      expect(castles(s)).toHaveLength(0);
    });

    it('moves king and rook to the right squares', () => {
      const s = play(setup('4k3/8/8/8/8/8/8/R3K2R', 'white', 'KQ'), 'e1g1');
      expect(s.board[7][6]).toEqual({ type: 'king', color: 'white' });
      expect(s.board[7][5]).toEqual({ type: 'rook', color: 'white' });
      expect(s.board[7][7]).toBeNull();
      expect(s.moveHistory[0].notation).toBe('O-O');
      expect(s.castlingRights.whiteQueenSide).toBe(false);
    });

    it('supports Chess960 castling where the king lands on the rook square', () => {
      // King f1, rook g1: O-O puts king on g1 and rook on f1.
      const s = engine.initializeState(['w', 'b'], { variant: 'chess960' });
      s.board = parseFen('4k3/8/8/8/8/8/8/1R3KR1');
      s.castlingRookFiles = {
        white: { kingSide: 6, queenSide: 1 },
        black: { kingSide: 7, queenSide: 0 },
      };
      s.castlingRights = {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: false,
        blackQueenSide: false,
      };
      const moves = castles(s);
      const targets = moves.map((m) => `${m.to.file}${m.to.rank}`).sort();
      expect(targets).toEqual(['b1', 'g1']);
      const after = play(s, 'f1g1');
      expect(after.board[7][6]).toEqual({ type: 'king', color: 'white' });
      expect(after.board[7][5]).toEqual({ type: 'rook', color: 'white' });
      expect(after.moveHistory[0].notation).toBe('O-O');
      const qs = play(s, 'f1b1');
      expect(qs.board[7][2]).toEqual({ type: 'king', color: 'white' });
      expect(qs.board[7][3]).toEqual({ type: 'rook', color: 'white' });
      expect(qs.board[7][1]).toBeNull();
      expect(qs.moveHistory[0].notation).toBe('O-O-O');
    });

    it('loses castling rights when the castling rook is captured', () => {
      const s = play(setup('4k3/8/8/8/8/8/6b1/R3K2R', 'black', 'KQ'), 'g2h1');
      expect(s.castlingRights.whiteKingSide).toBe(false);
      expect(s.castlingRights.whiteQueenSide).toBe(true);
    });
  });

  describe('en passant', () => {
    it('captures en passant and removes the pawn', () => {
      const s = play(
        engine.initializeState(['w', 'b']),
        'e2e4',
        'a7a6',
        'e4e5',
        'd7d5',
        'e5d6',
      );
      expect(s.board[3][3]).toBeNull();
      expect(s.board[2][3]).toEqual({ type: 'pawn', color: 'white' });
      expect(s.moveHistory[4].notation).toBe('exd6');
    });

    it('rejects en passant that exposes the king along the rank', () => {
      // White K a5, pawn b5; black pawn c7-c5 with rook h5 behind.
      let s = setup('4k3/2p5/8/KP5r/8/8/8/8', 'black');
      s = play(s, 'c7c5');
      const ep = getLegalMoves(s, 'white').filter((m) => m.isEnPassant);
      expect(ep).toHaveLength(0);
      expect(toFen(s).split(' ')[3]).toBe('-');
    });

    it('only records the en passant square in FEN when a capture is legal', () => {
      const s = play(engine.initializeState(['w', 'b']), 'e2e4');
      expect(toFen(s).split(' ')[3]).toBe('-');
      const t = play(
        engine.initializeState(['w', 'b']),
        'e2e4',
        'a7a6',
        'e4e5',
        'd7d5',
      );
      expect(toFen(t).split(' ')[3]).toBe('d6');
    });
  });

  describe('promotion', () => {
    it.each([
      ['queen', 'Q'],
      ['rook', 'R'],
      ['bishop', 'B'],
      ['knight', 'N'],
    ] as const)('promotes to %s', (piece, letter) => {
      const s = play(setup('7k/P7/8/8/8/8/8/K7'), `a7a8${piece}`);
      expect(s.board[0][0]).toEqual({ type: piece, color: 'white' });
      expect(s.moveHistory[0].notation.startsWith(`a8=${letter}`)).toBe(true);
    });

    it('defaults to a queen when no piece is given', () => {
      const s = play(setup('7k/P7/8/8/8/8/8/K7'), 'a7a8');
      expect(s.board[0][0]?.type).toBe('queen');
    });
  });

  describe('SAN notation', () => {
    it('adds check and mate suffixes to the move history', () => {
      const s = play(
        engine.initializeState(['w', 'b']),
        'f2f3',
        'e7e5',
        'g2g4',
        'd8h4',
      );
      expect(s.moveHistory[3].notation).toBe('Qh4#');
      expect(s.isCheckmate).toBe(true);
      expect(s.endReason).toBe('checkmate');
      expect(s.winnerColor).toBe('black');
    });

    it('disambiguates by file, then by rank', () => {
      const byFile = play(setup('4k3/8/8/8/8/8/8/1N2KN2'), 'b1d2');
      expect(byFile.moveHistory[0].notation).toBe('Nbd2');
      const byRank = play(setup('4k3/8/8/R7/8/8/8/R3K3'), 'a1a3');
      expect(byRank.moveHistory[0].notation).toBe('R1a3');
    });

    it('uses file and rank when both are needed', () => {
      const s = play(setup('4k3/8/8/8/8/Q7/8/Q1Q1K3'), 'a1b2');
      expect(s.moveHistory[0].notation).toBe('Qa1b2');
    });
  });

  describe('game end', () => {
    it('detects stalemate', () => {
      const s = play(setup('k7/8/1Q6/8/8/8/8/K7'), 'b6c7');
      expect(s.isStalemate).toBe(true);
      expect(s.endReason).toBe('stalemate');
      expect(engine.getResult(s)).toEqual({ winnerIds: [], isDraw: true });
    });

    it('rejects moves after the game is over', () => {
      const s = play(
        engine.initializeState(['w', 'b']),
        'f2f3',
        'e7e5',
        'g2g4',
        'd8h4',
      );
      expect(engine.validateAction(s, 'move', ctx('w'), mv('a2a3'))).toBe(
        false,
      );
      expect(engine.validateAction(s, 'resign', ctx('w'))).toBe(false);
    });

    it('applies the fifty-move rule at 100 half-moves', () => {
      const s = setup('4k3/8/8/8/8/8/8/R3K3');
      s.halfMoveClock = 99;
      const after = play(s, 'a1a2');
      expect(after.isDrawByFiftyMoveRule).toBe(true);
      expect(after.endReason).toBe('fifty_move');
    });

    it('prefers checkmate over the fifty-move rule', () => {
      const s = setup('k7/8/1K6/8/8/8/8/7R');
      s.halfMoveClock = 99;
      const after = play(s, 'h1h8');
      expect(after.isCheckmate).toBe(true);
      expect(after.isDrawByFiftyMoveRule).toBe(false);
    });

    it('compares positions without move counters', () => {
      expect(repetitionKey('8/8/8/8/8/8/8/K6k w - - 3 40')).toBe(
        repetitionKey('8/8/8/8/8/8/8/K6k w - - 9 44'),
      );
    });
  });

  describe('insufficient material', () => {
    it.each([
      ['K v K', '4k3/8/8/8/8/8/8/4K3', true],
      ['K+B v K', '4k3/8/8/8/8/8/8/2B1K3', true],
      ['K+N v K', '4k3/8/8/8/8/8/8/1N2K3', true],
      ['K+B v K+B same colour', '4kb2/8/8/8/8/8/8/2B1K3', true],
      ['K+B v K+B opposite colour', '2b1k3/8/8/8/8/8/8/2B1K3', false],
      ['K+N v K+N', '1n2k3/8/8/8/8/8/8/1N2K3', false],
      ['K+B+B same colour v K', '4k3/8/8/8/8/8/8/B1B1K3', true],
      ['K+P v K', '4k3/8/8/8/8/8/P7/4K3', false],
    ])('%s -> %s', (_label, placement, expected) => {
      expect(isInsufficientMaterial(parseFen(placement))).toBe(expected);
    });

    it('declares the draw after a capture leaves K+B v K+B on one colour', () => {
      const s = play(setup('4kb2/8/8/8/8/8/3r4/2B1K3'), 'e1d2');
      expect(s.isInsufficientMaterial).toBe(true);
      expect(s.endReason).toBe('insufficient_material');
    });

    it('does not apply to King of the Hill', () => {
      const s = engine.initializeState(['w', 'b'], {
        variant: 'king_of_the_hill',
      });
      s.board = parseFen('4k3/8/8/8/8/8/3r4/4K3');
      const after = engine.executeAction(
        s,
        'move',
        ctx('w'),
        mv('e1d2'),
      ).state!;
      expect(after.isInsufficientMaterial).toBe(false);
    });
  });

  describe('timeout', () => {
    it('is a draw when the opponent has only a king', () => {
      const s = setup('4k3/8/8/8/8/8/8/Q3K3', 'white');
      const res = engine.executeAction(s, 'timeout', ctx('w'));
      expect(res.state?.isDrawByTimeout).toBe(true);
      expect(res.state?.endReason).toBe('timeout_vs_insufficient');
      expect(engine.getResult(res.state!)).toEqual({
        winnerIds: [],
        isDraw: true,
      });
    });

    it('is a loss when the opponent can still mate', () => {
      const s = setup('4k2r/8/8/8/8/8/8/4K3', 'white');
      const res = engine.executeAction(s, 'timeout', ctx('w'));
      expect(res.state?.winnerColor).toBe('black');
      expect(res.state?.endReason).toBe('timeout');
    });

    it('treats a lone knight as mating material when the defender has pawns', () => {
      expect(
        hasMatingMaterial(parseFen('4k1n1/8/8/8/8/8/P7/4K3'), 'black'),
      ).toBe(true);
      expect(
        hasMatingMaterial(parseFen('4k1n1/8/8/8/8/8/8/4K3'), 'black'),
      ).toBe(false);
    });

    it('only lets the side to move flag', () => {
      const s = setup('4k3/8/8/8/8/8/8/Q3K3', 'white');
      expect(engine.validateAction(s, 'timeout', ctx('b'))).toBe(false);
    });
  });

  describe('abort', () => {
    it('aborts before both sides moved, with no result', () => {
      const s = play(engine.initializeState(['w', 'b']), 'e2e4');
      expect(engine.validateAction(s, 'abort', ctx('b'))).toBe(true);
      const res = engine.executeAction(s, 'abort', ctx('b'));
      expect(res.state?.isAborted).toBe(true);
      expect(engine.isGameOver(res.state!)).toBe(true);
      expect(engine.getResult(res.state!)).toEqual({
        winnerIds: [],
        isDraw: false,
        aborted: true,
      });
    });

    it('cannot abort once both sides have moved', () => {
      const s = play(engine.initializeState(['w', 'b']), 'e2e4', 'e7e5');
      expect(engine.validateAction(s, 'abort', ctx('w'))).toBe(false);
    });

    it('rejects a mid-game abort on the executeAction path', () => {
      const s = play(engine.initializeState(['w', 'b']), 'e2e4', 'e7e5');
      const res = engine.executeAction(s, 'abort', ctx('w'));
      expect(res.success).toBe(false);
    });
  });

  describe('draw offers', () => {
    it('is declined implicitly when the opponent moves', () => {
      let s = engine.initializeState(['w', 'b']);
      s = engine.executeAction(s, 'draw_offer', ctx('w')).state!;
      s = play(s, 'e2e4');
      expect(s.drawOfferedBy).toBe('w');
      s = play(s, 'e7e5');
      expect(s.drawOfferedBy).toBeNull();
      expect(engine.validateAction(s, 'draw_accept', ctx('b'))).toBe(false);
    });

    it('can be declined explicitly and offered again', () => {
      let s = play(engine.initializeState(['w', 'b']), 'e2e4');
      s = engine.executeAction(s, 'draw_offer', ctx('w')).state!;
      expect(engine.validateAction(s, 'draw_decline', ctx('w'))).toBe(false);
      s = engine.executeAction(s, 'draw_decline', ctx('b')).state!;
      expect(s.drawOfferedBy).toBeNull();
      expect(engine.validateAction(s, 'draw_offer', ctx('w'))).toBe(true);
    });

    it('ends the game when accepted', () => {
      let s = engine.initializeState(['w', 'b']);
      s = engine.executeAction(s, 'draw_offer', ctx('w')).state!;
      s = engine.executeAction(s, 'draw_accept', ctx('b')).state!;
      expect(s.isDrawByAgreement).toBe(true);
      expect(s.endReason).toBe('agreement');
    });
  });

  describe('takeback', () => {
    it("takes back only the requester's last move when it is the opponent's turn", () => {
      let s = play(engine.initializeState(['w', 'b']), 'e2e4', 'e7e5', 'g1f3');
      s = engine.executeAction(s, 'takeback_offer', ctx('w')).state!;
      s = engine.executeAction(s, 'takeback_accept', ctx('b')).state!;
      expect(s.moveHistory).toHaveLength(2);
      expect(s.currentTurnColor).toBe('white');
      expect(s.board[7][6]).toEqual({ type: 'knight', color: 'white' });
      expect(s.fullMoveNumber).toBe(2);
    });

    it("takes back two plies when it is the requester's turn", () => {
      let s = play(engine.initializeState(['w', 'b']), 'e2e4', 'e7e5');
      s = engine.executeAction(s, 'takeback_offer', ctx('w')).state!;
      s = engine.executeAction(s, 'takeback_accept', ctx('b')).state!;
      expect(s.moveHistory).toHaveLength(0);
      expect(s.currentTurnColor).toBe('white');
    });

    it('restores castling rights and keeps the board well-formed', () => {
      let s = play(setup('4k3/8/8/8/8/8/8/R3K2R', 'white', 'KQ'), 'e1f1');
      expect(s.castlingRights.whiteKingSide).toBe(false);
      s = engine.executeAction(s, 'takeback_offer', ctx('w')).state!;
      s = engine.executeAction(s, 'takeback_accept', ctx('b')).state!;
      expect(s.castlingRights.whiteKingSide).toBe(true);
      expect(s.castlingRights.whiteQueenSide).toBe(true);
      expect(s.board.every((row) => row.length === 8)).toBe(true);
      expect(castles(s)).toHaveLength(2);
    });

    it('is cancelled by a move', () => {
      let s = play(engine.initializeState(['w', 'b']), 'e2e4');
      s = engine.executeAction(s, 'takeback_offer', ctx('w')).state!;
      s = play(s, 'e7e5');
      expect(s.takebackOfferedBy).toBeNull();
    });

    it('cannot be accepted by the requester on the executeAction path', () => {
      let s = play(engine.initializeState(['w', 'b']), 'e2e4');
      s = engine.executeAction(s, 'takeback_offer', ctx('w')).state!;
      expect(engine.executeAction(s, 'takeback_accept', ctx('w')).success).toBe(
        false,
      );
    });

    it('rejects a move out of turn on the executeAction path', () => {
      const s = engine.initializeState(['w', 'b']);
      expect(
        engine.executeAction(s, 'move', ctx('b'), mv('e7e5')).success,
      ).toBe(false);
    });

    it('cannot be offered before moving', () => {
      const s = play(engine.initializeState(['w', 'b']), 'e2e4');
      expect(engine.validateAction(s, 'takeback_offer', ctx('b'))).toBe(false);
    });
  });

  it('bot search sets the en passant square behind a double push', () => {
    const s = engine.initializeState(['w', 'b']);
    const push = getLegalMoves(s, 'white').find(
      (m) => m.from.file === 'e' && m.from.rank === 2 && m.to.rank === 4,
    )!;
    const next = applyBotMove(s, push);
    expect(next.enPassantTarget).toEqual({ file: 'e', rank: 3 });
    expect(next.halfMoveClock).toBe(0);
  });

  it('parses a full FEN string without corrupting the board', () => {
    const board = parseFen(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    );
    expect(board.every((row) => row.length === 8)).toBe(true);
    expect(board[7][4]).toEqual({ type: 'king', color: 'white' });
  });
});
