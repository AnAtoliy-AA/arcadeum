import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Checkerboard } from './Checkerboard';

describe('Checkerboard', () => {
  it('renders default 8x8 grid cells', () => {
    render(
      <Checkerboard
        dataTestId="test-board"
        renderCell={({ row, col, isDark }) => (
          <div
            key={`${row}-${col}`}
            data-testid={`cell-${row}-${col}`}
            data-dark={isDark}
          />
        )}
      />,
    );

    const board = screen.getByTestId('test-board');
    expect(board).toBeInTheDocument();
    expect(screen.getByTestId('cell-0-0')).toBeInTheDocument();
    expect(screen.getByTestId('cell-7-7')).toBeInTheDocument();
  });

  it('provides coordinate labels when showCoordinates is true', () => {
    render(
      <Checkerboard
        showCoordinates
        renderCell={({ row, col, isLastFile, isBottomRank, rankLabel, fileLabel }) => (
          <div key={`${row}-${col}`}>
            {isLastFile && rankLabel && <span>rank-{rankLabel}</span>}
            {isBottomRank && fileLabel && <span>file-{fileLabel}</span>}
          </div>
        )}
      />,
    );

    expect(screen.getByText('rank-8')).toBeInTheDocument();
    expect(screen.getByText('file-a')).toBeInTheDocument();
  });

  it('reverses orientation when isFlipped is true', () => {
    const renderedOrder: string[] = [];
    render(
      <Checkerboard
        isFlipped
        renderCell={({ row, col }) => {
          renderedOrder.push(`${row}-${col}`);
          return <div key={`${row}-${col}`} />;
        }}
      />,
    );

    expect(renderedOrder[0]).toBe('7-7');
    expect(renderedOrder[renderedOrder.length - 1]).toBe('0-0');
  });
});
