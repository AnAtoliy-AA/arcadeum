import { describe, expect, it } from 'vitest';
import { calculateOptimisticChessState } from './optimisticMove';
import type { ChessClientState } from '../types';

describe('calculateOptimisticChessState', () => {
  const baseSnapshot: ChessClientState = {
    phase: 'playing',
    variant: 'standard',
    timeControl: null,
    board: [
      [
        { type: 'rook', color: 'black' },
        null,
        null,
        null,
        { type: 'king', color: 'black' },
        null,
        null,
        { type: 'rook', color: 'black' },
      ],
      [
        { type: 'pawn', color: 'black' },
        { type: 'pawn', color: 'black' },
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [
        { type: 'pawn', color: 'white' },
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      [
        { type: 'rook', color: 'white' },
        null,
        null,
        null,
        { type: 'king', color: 'white' },
        null,
        null,
        { type: 'rook', color: 'white' },
      ],
    ],
    currentTurnColor: 'white',
    castlingRights: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
    enPassantTarget: null,
    moveHistory: [],
    players: [
      { playerId: 'p1', color: 'white', isBot: false },
      { playerId: 'p2', color: 'black', isBot: false },
    ],
    winnerColor: null,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDrawByRepetition: false,
    isDrawByFiftyMoveRule: false,
    isInsufficientMaterial: false,
    isDrawByAgreement: false,
    drawOfferedBy: null,
    takebackOfferedBy: null,
    takebackMoveIndex: null,
    clocks: null,
    positionHistory: [],
    currentTurnIndex: 0,
    logs: [],
    halfMoveClock: 0,
    fullMoveNumber: 1,
    legalMovesForCurrentPlayer: [],
  };

  it('calculates regular pawn move correctly', () => {
    const result = calculateOptimisticChessState(baseSnapshot, 'a', 2, 'a', 4);
    expect(result).not.toBeNull();
    expect(result?.board[6][0]).toBeNull();
    expect(result?.board[4][0]).toEqual({ type: 'pawn', color: 'white' });
    expect(result?.currentTurnColor).toBe('black');
    expect(result?.moveHistory).toHaveLength(1);
    expect(result?.moveHistory[0].from).toEqual({ file: 'a', rank: 2 });
    expect(result?.moveHistory[0].to).toEqual({ file: 'a', rank: 4 });
  });

  it('calculates kingside castling correctly', () => {
    const result = calculateOptimisticChessState(baseSnapshot, 'e', 1, 'g', 1);
    expect(result).not.toBeNull();
    expect(result?.board[7][4]).toBeNull();
    expect(result?.board[7][6]).toEqual({ type: 'king', color: 'white' });
    expect(result?.board[7][5]).toEqual({ type: 'rook', color: 'white' });
    expect(result?.board[7][7]).toBeNull();
    expect(result?.moveHistory[0].isCastle).toBe(true);
  });

  it('calculates promotion correctly', () => {
    const promotionSnapshot: ChessClientState = {
      ...baseSnapshot,
      board: [
        [null, null, null, null, null, null, null, null],
        [
          { type: 'pawn', color: 'white' },
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        ...baseSnapshot.board.slice(2),
      ],
    };

    const result = calculateOptimisticChessState(
      promotionSnapshot,
      'a',
      7,
      'a',
      8,
      'queen',
    );
    expect(result).not.toBeNull();
    expect(result?.board[0][0]).toEqual({ type: 'queen', color: 'white' });
    expect(result?.board[1][0]).toBeNull();
    expect(result?.moveHistory[0].promotion).toBe('queen');
  });

  it('returns null if from square has no piece', () => {
    const result = calculateOptimisticChessState(baseSnapshot, 'c', 3, 'c', 4);
    expect(result).toBeNull();
  });
});
