import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClanLeaderboardTable } from './ClanLeaderboardTable';
import type { ClanLeaderboardEntry } from '../model/types';

describe('ClanLeaderboardTable', () => {
  const mockEntries: ClanLeaderboardEntry[] = [
    {
      rank: 1,
      id: 'clan-1',
      name: 'Vanguard Alpha',
      tag: 'VANG',
      description: 'Elite competitive clan',
      avatarUrl: null,
      memberCount: 15,
      totalWins: 120,
      totalGames: 150,
      winRate: 80,
    },
    {
      rank: 2,
      id: 'clan-2',
      name: 'Iron Legion',
      tag: 'IRON',
      description: 'Casual board players',
      avatarUrl: null,
      memberCount: 20,
      totalWins: 90,
      totalGames: 130,
      winRate: 69,
    },
  ];

  it('renders leaderboard table with ranked clan rows and badges', () => {
    const onSortChange = vi.fn();
    render(
      <ClanLeaderboardTable
        entries={mockEntries}
        currentSort="wins"
        onSortChange={onSortChange}
      />,
    );

    expect(screen.getByTestId('clan-leaderboard-table')).toBeInTheDocument();
    expect(screen.getByText('Vanguard Alpha')).toBeInTheDocument();
    expect(screen.getByText('[VANG]')).toBeInTheDocument();
    expect(screen.getByText('Iron Legion')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('triggers sort change callbacks when sort buttons clicked', () => {
    const onSortChange = vi.fn();
    render(
      <ClanLeaderboardTable
        entries={mockEntries}
        currentSort="wins"
        onSortChange={onSortChange}
      />,
    );

    const winRateButton = screen.getByTestId('sort-clan-winrate');
    fireEvent.click(winRateButton);
    expect(onSortChange).toHaveBeenCalledWith('winRate');

    const membersButton = screen.getByTestId('sort-clan-members');
    fireEvent.click(membersButton);
    expect(onSortChange).toHaveBeenCalledWith('members');
  });

  it('renders empty state when no entries provided', () => {
    const onSortChange = vi.fn();
    render(
      <ClanLeaderboardTable
        entries={[]}
        currentSort="wins"
        onSortChange={onSortChange}
      />,
    );

    expect(screen.getByText('No clans ranked yet')).toBeInTheDocument();
  });
});
