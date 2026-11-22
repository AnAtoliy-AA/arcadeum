import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PachisiTokenStack, type PlacedToken } from './PachisiTokenStack';

describe('PachisiTokenStack', () => {
  it('renders a single token without stack count badge', () => {
    const tokens: PlacedToken[] = [
      { ownerId: 'p1', seat: 0, token: { id: 0, progress: 10 } },
    ];

    render(
      <PachisiTokenStack
        tokens={tokens}
        cellKey="10"
        currentUserId="p1"
        canMove={false}
        movable={new Set()}
        onMove={vi.fn()}
      />,
    );

    expect(screen.getByTestId('token-cell-10-0')).toBeInTheDocument();
    expect(screen.queryByTestId('stack-count-10')).not.toBeInTheDocument();
  });

  it('renders multi-token stack on shared star cell with count badge and stacked depth classes', () => {
    const tokens: PlacedToken[] = [
      { ownerId: 'p1', seat: 0, token: { id: 0, progress: 8 } },
      { ownerId: 'p2', seat: 1, token: { id: 1, progress: 8 } },
    ];

    render(
      <PachisiTokenStack
        tokens={tokens}
        cellKey="8"
        currentUserId="p1"
        canMove={false}
        movable={new Set()}
        onMove={vi.fn()}
      />,
    );

    const countBadge = screen.getByTestId('stack-count-8');
    expect(countBadge).toBeInTheDocument();
    expect(countBadge).toHaveTextContent('2');
    expect(countBadge).toHaveClass('bg-black/85');

    const token0 = screen.getByTestId('token-cell-8-0');
    const token1 = screen.getByTestId('token-cell-8-1');
    expect(token0).toHaveClass('pachisi-token-stacked');
    expect(token0).toHaveClass('pachisi-token-layer-0');
    expect(token1).toHaveClass('pachisi-token-stacked');
    expect(token1).toHaveClass('pachisi-token-layer-1');
  });

  it('renders a blockade with amber fortress badge and blockade depth class when tokens belong to the same player', () => {
    const onMove = vi.fn();
    const tokens: PlacedToken[] = [
      { ownerId: 'p1', seat: 0, token: { id: 0, progress: 14 } },
      { ownerId: 'p1', seat: 0, token: { id: 1, progress: 14 } },
    ];

    render(
      <PachisiTokenStack
        tokens={tokens}
        cellKey="14"
        currentUserId="p1"
        canMove={true}
        movable={new Set([0, 1])}
        onMove={onMove}
      />,
    );

    const countBadge = screen.getByTestId('stack-count-14');
    expect(countBadge).toBeInTheDocument();
    expect(countBadge).toHaveTextContent('2');
    expect(countBadge).toHaveClass('text-amber-300');

    const token0 = screen.getByTestId('token-cell-14-0');
    const token1 = screen.getByTestId('token-cell-14-1');
    expect(token0).toHaveClass('pachisi-token-blockade');
    expect(token1).toHaveClass('pachisi-token-blockade');

    fireEvent.click(token0);
    expect(onMove).toHaveBeenCalledWith(0);
  });
});
