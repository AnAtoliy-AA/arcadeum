import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BoardDiagram } from './BoardDiagram';

describe('BoardDiagram', () => {
  it('renders sea-battle grid with coordinates and ships', () => {
    render(
      <BoardDiagram
        gameId="sea-battle"
        title="Test Perimeter Layout"
        caption="Perimeter setup caption text."
        grid={[
          'SSSS......',
          '..........',
          'SSS.......',
          '..........',
          'SSS.......',
          '..........',
          'SS...SS...',
          '..........',
          'SS........',
          '.S.S.S.S..',
        ]}
        legend={[
          { variant: 'ship', label: 'Ships' },
          { variant: 'deadzone', label: 'Dead Zones' },
        ]}
      />,
    );

    expect(screen.getByTestId('board-diagram')).toBeInTheDocument();
    expect(screen.getByText('Test Perimeter Layout')).toBeInTheDocument();
    expect(screen.getByText('Perimeter setup caption text.')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Ships')).toBeInTheDocument();
    expect(screen.getByText('Dead Zones')).toBeInTheDocument();
  });

  it('renders chess board with pieces and ranks', () => {
    render(
      <BoardDiagram
        gameId="chess"
        title="Scholar Mate"
        grid={[
          'r.bqkb.r',
          'pppp.Qpp',
          '..n..n..',
          '....p...',
          '..B.P...',
          '........',
          'PPPP.PPP',
          'RNB.K.NR',
        ]}
      />,
    );

    expect(screen.getByText('Scholar Mate')).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('h')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
