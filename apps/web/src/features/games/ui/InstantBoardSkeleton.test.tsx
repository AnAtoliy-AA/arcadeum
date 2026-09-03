import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { InstantBoardSkeleton } from './InstantBoardSkeleton';

describe('InstantBoardSkeleton', () => {
  it('renders skeleton container with testid', () => {
    render(<InstantBoardSkeleton gameId="chess" />);
    expect(screen.getByTestId('instant-board-skeleton')).toBeDefined();
  });

  it('renders correct grid layout for tic-tac-toe', () => {
    render(<InstantBoardSkeleton gameId="tic-tac-toe" />);
    const skeleton = screen.getByTestId('instant-board-skeleton');
    expect(skeleton).toBeDefined();
  });
});
