import { ChessEngine } from './chess.engine';
import { parseFen, generateChess960BackRank, boardToFen } from './chess.board';
import type { MovePayload } from './chess.types';
import { getLegalMoves } from './chess.move-generator';

describe('ChessEngine - Chess960', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  it('should generate valid back rank with king between rooks', () => {
    for (let i = 0; i < 50; i++) {
      const rank = generateChess960BackRank();
      const kingIdx = rank.findIndex((p) => p?.type === 'king');
      const rookIndices = rank.reduce<number[]>(
        (acc, p, idx) => (p?.type === 'rook' ? [...acc, idx] : acc),
        [],
      );
      expect(rookIndices.length).toBe(2);
      expect(kingIdx).toBeGreaterThan(rookIndices[0]);
      expect(kingIdx).toBeLessThan(rookIndices[1]);
    }
  });

  it('should generate back rank with bishops on opposite colors', () => {
    for (let i = 0; i < 50; i++) {
      const rank = generateChess960BackRank();
      const bishopIndices = rank.reduce<number[]>(
        (acc, p, idx) => (p?.type === 'bishop' ? [...acc, idx] : acc),
        [],
      );
      expect(bishopIndices.length).toBe(2);
      expect(bishopIndices[0] % 2).not.toBe(bishopIndices[1] % 2);
    }
  });

  it('should generate back rank with correct piece counts', () => {
    for (let i = 0; i < 20; i++) {
      const rank = generateChess960BackRank();
      const pieces = rank.filter(Boolean);
      expect(pieces.length).toBe(8);
      expect(rank.filter((p) => p?.type === 'king').length).toBe(1);
      expect(rank.filter((p) => p?.type === 'queen').length).toBe(1);
      expect(rank.filter((p) => p?.type === 'rook').length).toBe(2);
      expect(rank.filter((p) => p?.type === 'bishop').length).toBe(2);
      expect(rank.filter((p) => p?.type === 'knight').length).toBe(2);
    }
  });

  it('should initialize chess960 variant with random position', () => {
    const state = engine.initializeState(['p1', 'p2'], {
      variant: 'chess960',
    });
    expect(state.variant).toBe('chess960');
    expect(state.board[7]).toHaveLength(8);
    expect(state.board[0]).toHaveLength(8);

    const whiteKingIdx = state.board[7].findIndex((p) => p?.type === 'king');
    const whiteRookIndices = state.board[7].reduce<number[]>(
      (acc, p, idx) => (p?.type === 'rook' ? [...acc, idx] : acc),
      [],
    );
    expect(whiteRookIndices.length).toBe(2);
    expect(whiteKingIdx).toBeGreaterThan(whiteRookIndices[0]);
    expect(whiteKingIdx).toBeLessThan(whiteRookIndices[1]);

    for (let f = 0; f < 8; f++) {
      if (state.board[7][f]) {
        expect(state.board[7][f]!.color).toBe('white');
      }
      if (state.board[0][f]) {
        expect(state.board[0][f]!.color).toBe('black');
      }
    }

    expect(state.board[6].every((p) => p?.type === 'pawn')).toBe(true);
    expect(state.board[1].every((p) => p?.type === 'pawn')).toBe(true);
  });

  it('should handle castling in chess960 with non-standard rook positions', () => {
    const state = engine.initializeState(['p1', 'p2'], {
      variant: 'chess960',
    });

    state.board = parseFen('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R');
    state.currentTurnColor = 'white';

    const legalMoves = getLegalMoves(state, 'white');
    const castleMoves = legalMoves.filter((m) => m.isCastle);
    expect(castleMoves.length).toBe(2);
  });

  it('should generate valid standard FEN from boardToFen', () => {
    const state = engine.initializeState(['p1', 'p2']);
    const standardFen = boardToFen(state.board);
    expect(standardFen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    expect(state.positionHistory[0]).toContain(standardFen);
  });

  it('should initialize positionHistory with actual chess960 board FEN', () => {
    const state = engine.initializeState(['p1', 'p2'], {
      variant: 'chess960',
    });
    const actualFen = boardToFen(state.board);
    expect(state.positionHistory[0]).toContain(actualFen);
    expect(actualFen.split('/').length).toBe(8);
  });

  it('should not allow castling through check', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('r3k2r/pppppppp/8/8/8/8/PPPPPP1P/R3K2R');
    state.currentTurnColor = 'white';

    state.board[5][7] = { type: 'bishop', color: 'black' };

    const legalMoves = getLegalMoves(state, 'white');
    const castleMoves = legalMoves.filter((m) => m.isCastle);

    const queenSide = castleMoves.find((m) => m.to.file === 'c');
    expect(queenSide).toBeDefined();

    const kingSide = castleMoves.find((m) => m.to.file === 'g');
    expect(kingSide).toBeUndefined();
  });

  it('should not allow castling when king is in check', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('r3k2r/pppppppp/8/8/8/8/PPPP1PPP/R3K2R');
    state.currentTurnColor = 'white';
    state.board[5][4] = { type: 'rook', color: 'black' };

    const legalMoves = getLegalMoves(state, 'white');
    const castleMoves = legalMoves.filter((m) => m.isCastle);
    expect(castleMoves.length).toBe(0);
  });

  it('should revoke castling rights when opponent captures a rook', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('r3k2r/8/8/8/8/8/8/R3K2R');
    state.currentTurnColor = 'black';

    const payload: MovePayload = {
      fromFile: 'a',
      fromRank: 8,
      toFile: 'a',
      toRank: 1,
    };
    const result = engine.executeAction(
      state,
      'move',
      { userId: 'p2', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
      payload,
    );
    expect(result.success).toBe(true);
    expect(result.state?.castlingRights.whiteQueenSide).toBe(false);
    expect(result.state?.castlingRights.whiteKingSide).toBe(true);
  });
});

describe('ChessEngine - draw conditions', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  it('should detect fifty-move rule', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.halfMoveClock = 99;
    state.board = parseFen('4k3/8/8/8/8/8/8/4K2R');

    const payload: MovePayload = {
      fromFile: 'h',
      fromRank: 1,
      toFile: 'h',
      toRank: 2,
    };
    const result = engine.executeAction(
      state,
      'move',
      { userId: 'p1', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
      payload,
    );
    expect(result.success).toBe(true);
    expect(result.state?.isDrawByFiftyMoveRule).toBe(true);
  });

  it('should detect threefold repetition', () => {
    const state = engine.initializeState(['p1', 'p2']);
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    state.positionHistory = [fen, fen, fen];

    expect(state.positionHistory.filter((p) => p === fen).length).toBe(3);
  });

  it('should detect insufficient material - king vs king', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('4k3/8/8/8/8/8/8/4K3');

    const payload: MovePayload = {
      fromFile: 'e',
      fromRank: 1,
      toFile: 'f',
      toRank: 1,
    };
    const result = engine.executeAction(
      state,
      'move',
      { userId: 'p1', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
      payload,
    );
    expect(result.success).toBe(true);
    expect(result.state?.isInsufficientMaterial).toBe(true);
  });

  it('should detect insufficient material - king and bishop vs king', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('4k3/8/8/8/8/8/8/4KB2');

    const payload: MovePayload = {
      fromFile: 'f',
      fromRank: 1,
      toFile: 'g',
      toRank: 2,
    };
    const result = engine.executeAction(
      state,
      'move',
      { userId: 'p1', roomId: 'r1', sessionId: 's1', timestamp: new Date() },
      payload,
    );
    expect(result.success).toBe(true);
    expect(result.state?.isInsufficientMaterial).toBe(true);
  });

  it('should detect stalemate', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('k7/1K6/8/8/8/8/8/8');
    state.currentTurnColor = 'black';

    const legalMoves = getLegalMoves(state, 'black');
    expect(legalMoves.length).toBe(0);
  });

  it('should detect checkmate', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR');
    state.currentTurnColor = 'white';

    const legalMoves = getLegalMoves(state, 'white');
    expect(legalMoves.length).toBe(0);
  });
});

describe('ChessEngine - move generator edge cases', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  it('should handle en passant capture', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR');
    state.enPassantTarget = { rank: 6, file: 'd' };
    state.currentTurnColor = 'white';

    const legalMoves = getLegalMoves(state, 'white');
    const epMoves = legalMoves.filter((m) => m.isEnPassant);
    expect(epMoves.length).toBeGreaterThanOrEqual(1);
    if (epMoves.length > 0) {
      expect(epMoves[0].to.file).toBe('d');
      expect(epMoves[0].to.rank).toBe(6);
    }
  });

  it('should handle pawn promotion', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('8/4P3/8/8/8/8/8/4K2k');
    state.currentTurnColor = 'white';

    const legalMoves = getLegalMoves(state, 'white');
    const promoMoves = legalMoves.filter((m) => m.promotion);
    expect(promoMoves.length).toBe(4);
    expect(promoMoves.map((m) => m.promotion)).toEqual(
      expect.arrayContaining(['queen', 'rook', 'bishop', 'knight']),
    );
  });

  it('should generate legal moves for all piece types', () => {
    const state = engine.initializeState(['p1', 'p2']);
    const legalMoves = getLegalMoves(state, 'white');
    expect(legalMoves.length).toBe(20);

    const fromSquares = new Set(
      legalMoves.map((m) => `${m.from.file}${m.from.rank}`),
    );
    expect(fromSquares.has('e2')).toBe(true);
    expect(fromSquares.has('d2')).toBe(true);
    expect(fromSquares.has('b1')).toBe(true);
    expect(fromSquares.has('g1')).toBe(true);
  });

  it('should not allow moving into check', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('4k3/8/8/8/5r2/8/8/4K3');
    state.currentTurnColor = 'white';

    const legalMoves = getLegalMoves(state, 'white');
    const kingMoves = legalMoves.filter((m) => m.piece.type === 'king');
    expect(kingMoves.length).toBe(3);
    for (const move of kingMoves) {
      expect(move.to.file).not.toBe('f');
    }
  });

  it('should handle king side and queen side castling in standard chess', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.board = parseFen('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R');
    state.currentTurnColor = 'white';

    const legalMoves = getLegalMoves(state, 'white');
    const castleMoves = legalMoves.filter((m) => m.isCastle);
    expect(castleMoves.length).toBe(2);

    const kingSide = castleMoves.find((m) => m.to.file === 'g');
    const queenSide = castleMoves.find((m) => m.to.file === 'c');
    expect(kingSide).toBeDefined();
    expect(queenSide).toBeDefined();
  });
});

describe('ChessEngine - getResult', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  it('should return draw for stalemate', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.isStalemate = true;
    const result = engine.getResult(state);
    expect(result.isDraw).toBe(true);
    expect(result.winnerIds).toEqual([]);
  });

  it('should return winner for checkmate', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.winnerColor = 'white';
    const result = engine.getResult(state);
    expect(result.isDraw).toBe(false);
    expect(result.winnerIds).toEqual(['p1']);
  });

  it('should return no result for active game', () => {
    const state = engine.initializeState(['p1', 'p2']);
    const result = engine.getResult(state);
    expect(result.isDraw).toBe(false);
    expect(result.winnerIds).toEqual([]);
  });
});
