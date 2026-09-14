import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameSpecTable } from './GameSpecTable';

describe('GameSpecTable', () => {
  const mockItems = [
    { label: 'Engine', value: 'Stockfish 19', badge: 'NNUE' },
    { label: 'Players', value: '2 Players', hint: 'Head-to-head' },
  ];

  it('renders title, kicker and items', () => {
    render(
      <GameSpecTable
        title="Technical Specifications"
        kicker="Game Facts"
        items={mockItems}
      />,
    );

    expect(screen.getByText('Technical Specifications')).toBeInTheDocument();
    expect(screen.getByText('Game Facts')).toBeInTheDocument();
    expect(screen.getByText('Engine')).toBeInTheDocument();
    expect(screen.getByText('Stockfish 19')).toBeInTheDocument();
    expect(screen.getByText('NNUE')).toBeInTheDocument();
    expect(screen.getByText('Head-to-head')).toBeInTheDocument();
  });

  it('returns null when items array is empty', () => {
    const { container } = render(<GameSpecTable items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
