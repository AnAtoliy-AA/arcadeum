import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BracketView } from './BracketView';
import type { BracketMatchView, TournamentBracketView } from '../api';

const labels = {
  'round-0': 'Round of 4',
  tbd: 'TBD',
  winner: 'Winner',
};

const match = (
  overrides: Partial<BracketMatchView> = {},
): BracketMatchView => ({
  round: 1,
  matchIndex: 0,
  playerA: 'aaaaaaaaaaaaaaaa',
  playerB: 'bbbbbbbbbbbbbbbb',
  winnerUserId: null,
  ...overrides,
});

const bracket = (
  rounds: BracketMatchView[][],
  format: TournamentBracketView['format'] = 'single_elimination',
): TournamentBracketView => ({
  tournamentId: 'tour-1',
  status: 'live',
  format,
  rounds,
});

describe('BracketView', () => {
  it('renders one column per round with testids', () => {
    render(
      <BracketView
        bracket={bracket([
          [match(), match({ matchIndex: 1 })],
          [match({ round: 2, playerA: null, playerB: null })],
        ])}
        labels={labels}
      />,
    );
    expect(screen.getByTestId('bracket-round-0')).toBeInTheDocument();
    expect(screen.getByTestId('bracket-round-1')).toBeInTheDocument();
    expect(screen.getByTestId('bracket-match-0-0')).toBeInTheDocument();
    expect(screen.getByTestId('bracket-match-0-1')).toBeInTheDocument();
    expect(screen.getByTestId('bracket-match-1-0')).toBeInTheDocument();
  });

  it('uses custom round labels falling back to Round N', () => {
    render(
      <BracketView
        bracket={bracket([[match()], [match({ round: 2 })]])}
        labels={labels}
      />,
    );
    expect(screen.getByText('Round of 4')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('shows TBD for empty slots', () => {
    render(
      <BracketView
        bracket={bracket([[match({ playerA: null })]])}
        labels={labels}
      />,
    );
    expect(screen.getAllByText('TBD').length).toBeGreaterThan(0);
  });

  it('highlights the winner slot', () => {
    const { container } = render(
      <BracketView
        bracket={bracket([[match({ winnerUserId: 'aaaaaaaaaaaaaaaa' })]])}
        labels={labels}
      />,
    );
    expect(container.textContent).toContain('✓');
    expect(container.textContent).toContain('Winner');
  });

  it('does not highlight anything while undecided', () => {
    const { container } = render(
      <BracketView bracket={bracket([[match()]])} labels={labels} />,
    );
    expect(container.textContent).not.toContain('Winner');
  });
});
