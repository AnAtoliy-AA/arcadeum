import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChessClientState, ChessMove } from '../types';
import { MoveList } from './MoveList';

const t = ((key: string, params?: Record<string, string | number>) =>
  params ? `${key}:${JSON.stringify(params)}` : key) as never;

const move = (notation: string): ChessMove =>
  ({
    from: { file: 'e', rank: 2 },
    to: { file: 'e', rank: 4 },
    notation,
  }) as unknown as ChessMove;

const emptyRow = () => Array(8).fill(null);
const state = {
  board: [
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
    [
      null,
      null,
      null,
      null,
      { type: 'king', color: 'white' },
      null,
      null,
      null,
    ],
  ],
  currentTurnColor: 'white',
  castlingRights: {
    whiteKingSide: false,
    whiteQueenSide: false,
    blackKingSide: false,
    blackQueenSide: false,
  },
  enPassantTarget: null,
  halfMoveClock: 0,
  fullMoveNumber: 2,
  moveHistory: [move('e4'), move('e5'), move('Nf3')],
  players: [],
  winnerColor: null,
  isDrawByAgreement: false,
  isDrawByRepetition: false,
  isDrawByFiftyMoveRule: false,
  isInsufficientMaterial: false,
  isStalemate: false,
  variant: 'standard',
} as unknown as ChessClientState;

describe('MoveList', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn(() => Promise.resolve()) },
    });
  });

  it('renders translated, labelled moves and marks the latest as current', () => {
    render(<MoveList state={state} t={t} />);
    expect(screen.getByText('games.chess_v1.moveList.title')).toBeDefined();
    const latest = screen.getByTestId('chess-move-2');
    expect(latest.getAttribute('aria-current')).toBe('step');
    expect(latest.getAttribute('aria-label')).toContain('"san":"Nf3"');
    expect(latest.getAttribute('aria-label')).toContain('"number":2');
  });

  it('shows the empty state', () => {
    render(<MoveList state={{ ...state, moveHistory: [] }} t={t} />);
    expect(screen.getByText('games.chess_v1.moveList.empty')).toBeDefined();
  });

  it('selects a move on click and highlights it', () => {
    const onSelectMove = vi.fn();
    render(
      <MoveList
        state={state}
        t={t}
        onSelectMove={onSelectMove}
        selectedMoveIndex={0}
      />,
    );
    fireEvent.click(screen.getByTestId('chess-move-1'));
    expect(onSelectMove).toHaveBeenCalledWith(1);
    expect(
      screen.getByTestId('chess-move-0').getAttribute('aria-current'),
    ).toBe('step');
  });

  it('delegates navigation buttons to onStep and disables next when live', () => {
    const onStep = vi.fn();
    render(<MoveList state={state} t={t} onStep={onStep} />);
    fireEvent.click(screen.getByLabelText('games.chess_v1.moveList.prev'));
    expect(onStep).toHaveBeenCalledWith('prev');
    expect(
      (
        screen.getByLabelText(
          'games.chess_v1.moveList.next',
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it('disables back buttons at the start position', () => {
    render(
      <MoveList state={state} t={t} onStep={vi.fn()} selectedMoveIndex={-1} />,
    );
    expect(
      (
        screen.getByLabelText(
          'games.chess_v1.moveList.first',
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it('copies a full FEN of the live position', async () => {
    render(<MoveList state={state} t={t} />);
    fireEvent.click(screen.getByText('games.chess_v1.moveList.copyFen'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '8/8/8/8/8/8/8/4K3 w - - 0 2',
    );
    await waitFor(() =>
      expect(
        screen.getAllByText('games.chess_v1.moveList.copied').length,
      ).toBeGreaterThan(0),
    );
  });

  it('copies PGN and reports clipboard failures', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn(() => Promise.reject(new Error('no'))) },
    });
    render(<MoveList state={state} t={t} />);
    fireEvent.click(screen.getByText('games.chess_v1.moveList.copyPgn'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('1. e4 e5 2. Nf3'),
    );
    await waitFor(() =>
      expect(
        screen.getByText('games.chess_v1.moveList.copyFailed'),
      ).toBeDefined(),
    );
  });
});
