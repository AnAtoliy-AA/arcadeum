import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PracticeDrillBoard } from './PracticeDrillBoard';

describe('PracticeDrillBoard', () => {
  it('renders correct number of cells for a 3x3 grid', () => {
    render(
      <PracticeDrillBoard
        gameId="tic-tac-toe"
        grid={['X..', '.O.', '..X']}
      />,
    );

    const cells = screen.getAllByTestId(/^puzzle-cell-/);
    expect(cells).toHaveLength(9);
    expect(cells[0]).toHaveTextContent('X');
    expect(cells[4]).toHaveTextContent('O');
    expect(cells[8]).toHaveTextContent('X');
  });

  it('triggers onCellClick callback with cell coordinates and index', () => {
    const handleCellClick = vi.fn();
    render(
      <PracticeDrillBoard
        gameId="tic-tac-toe"
        grid={['...', '...', '...']}
        onCellClick={handleCellClick}
      />,
    );

    fireEvent.click(screen.getByTestId('puzzle-cell-4'));
    expect(handleCellClick).toHaveBeenCalledTimes(1);
    expect(handleCellClick).toHaveBeenCalledWith(4, 1, 1);
  });

  it('does not trigger onCellClick when disabled', () => {
    const handleCellClick = vi.fn();
    render(
      <PracticeDrillBoard
        gameId="tic-tac-toe"
        grid={['...', '...', '...']}
        disabled={true}
        onCellClick={handleCellClick}
      />,
    );

    fireEvent.click(screen.getByTestId('puzzle-cell-2'));
    expect(handleCellClick).not.toHaveBeenCalled();
  });

  it('applies solvedIndex highlight styling', () => {
    render(
      <PracticeDrillBoard
        gameId="tic-tac-toe"
        grid={['X..', '.O.', '..X']}
        solvedIndex={2}
      />,
    );

    const solvedCell = screen.getByTestId('puzzle-cell-2');
    expect(solvedCell.className).toContain('ring-2');
  });

  it('renders chess pieces on 8x8 grid with file and rank labels', () => {
    render(
      <PracticeDrillBoard
        gameId="chess"
        grid={[
          'r.bqk.nr',
          'pppp.ppp',
          '..n.....',
          '..B.p...',
          '....P...',
          '.....Q..',
          'PPPP.PPP',
          'RNB.K.NR',
        ]}
      />,
    );

    expect(screen.getAllByTestId(/^puzzle-cell-/)).toHaveLength(64);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('h')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
