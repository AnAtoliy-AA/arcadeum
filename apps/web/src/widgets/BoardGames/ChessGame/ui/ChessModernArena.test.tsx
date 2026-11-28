import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChessPieceIcon } from './ChessPieceIcon';
import { EvalBar } from './EvalBar';
import { ChessPlayerHud } from './ChessPlayerHud';
import type { Board, PlayerClock, PieceColor } from '../types';

function createBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[7][4] = { type: 'king', color: 'white' };
  board[7][3] = { type: 'queen', color: 'white' };
  board[0][4] = { type: 'king', color: 'black' };
  return board;
}

describe('ChessModernArena Components', () => {
  it('renders SVG piece icons correctly', () => {
    render(<ChessPieceIcon piece={{ type: 'knight', color: 'white' }} />);
    expect(screen.getByTestId('piece-white-knight')).toBeDefined();
  });

  it('renders classic Unicode piece variant correctly', () => {
    render(
      <ChessPieceIcon
        piece={{ type: 'queen', color: 'black' }}
        pieceStyle="classic"
      />,
    );
    expect(screen.getByTestId('piece-black-queen')).toBeDefined();
    expect(screen.getByText('♛')).toBeDefined();
  });

  it('renders solid bold Unicode piece variant correctly', () => {
    render(
      <ChessPieceIcon
        piece={{ type: 'king', color: 'white' }}
        pieceStyle="classic-filled"
      />,
    );
    expect(screen.getByTestId('piece-white-king')).toBeDefined();
    expect(screen.getByText('♚')).toBeDefined();
  });

  it('renders outline minimal Unicode piece variant correctly', () => {
    render(
      <ChessPieceIcon
        piece={{ type: 'bishop', color: 'white' }}
        pieceStyle="classic-outline"
      />,
    );
    expect(screen.getByTestId('piece-white-bishop')).toBeDefined();
    expect(screen.getByText('♗')).toBeDefined();
  });

  it('renders EvalBar with correct evaluation score', () => {
    render(<EvalBar evalScore={150} isFlipped={false} />);
    expect(screen.getByLabelText('Evaluation: +1.5')).toBeDefined();
    expect(screen.getByText('+1.5')).toBeDefined();
  });

  it('renders EvalBar with negative score for Black advantage', () => {
    render(<EvalBar evalScore={-240} isFlipped={false} />);
    expect(screen.getByLabelText('Evaluation: -2.4')).toBeDefined();
    expect(screen.getByText('-2.4')).toBeDefined();
  });

  it('renders EvalBar with mate score', () => {
    render(<EvalBar evalScore={null} mateScore={3} isFlipped={false} />);
    expect(screen.getByLabelText('Evaluation: M3')).toBeDefined();
    expect(screen.getByText('M3')).toBeDefined();
  });

  it('renders EvalBar in horizontal orientation', () => {
    render(
      <EvalBar evalScore={210} isFlipped={false} orientation="horizontal" />,
    );
    expect(screen.getByLabelText('Evaluation: +2.1')).toBeDefined();
    expect(screen.getByText('+2.1')).toBeDefined();
  });

  it('renders ChessPlayerHud with player info, clock, and material diff', () => {
    const board = createBoard();
    const clocks: Record<PieceColor, PlayerClock> = {
      white: { remainingSeconds: 185, lastMoveTimestamp: 0 },
      black: { remainingSeconds: 300, lastMoveTimestamp: 0 },
    };
    render(
      <ChessPlayerHud
        playerId="player-1"
        name="Grandmaster"
        color="white"
        isActive={true}
        isGameOver={true}
        clocks={clocks}
        currentTurnColor="white"
        gameCreatedAt={Date.now()}
        incrementSeconds={2}
        board={board}
      />,
    );

    expect(screen.getByText('Grandmaster')).toBeDefined();
    expect(screen.getByText('03:05')).toBeDefined();
    expect(screen.getByText('+2s')).toBeDefined();
  });

  it('displays low-time urgency on digital clock', () => {
    const board = createBoard();
    const clocks: Record<PieceColor, PlayerClock> = {
      white: { remainingSeconds: 300, lastMoveTimestamp: 0 },
      black: { remainingSeconds: 8, lastMoveTimestamp: 0 },
    };
    render(
      <ChessPlayerHud
        playerId="player-2"
        name="SpeedDemon"
        color="black"
        isActive={true}
        isGameOver={true}
        clocks={clocks}
        currentTurnColor="black"
        gameCreatedAt={Date.now()}
        board={board}
      />,
    );

    // Final ten seconds show tenths.
    expect(screen.getByText('00:08.0')).toBeDefined();
  });

  it('renders Arcadeum sprite piece style with use href symbol target', () => {
    const { container } = render(
      <ChessPieceIcon
        piece={{ type: 'king', color: 'white' }}
        pieceStyle="arcadeum"
      />,
    );
    expect(screen.getByTestId('piece-white-king')).toBeDefined();
    const useElement = container.querySelector('use');
    expect(useElement).toBeDefined();
    expect(useElement?.getAttribute('href')).toContain('#arcadeum-white-king');
  });
});
