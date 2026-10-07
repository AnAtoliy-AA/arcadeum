import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ClanMvpBoard } from './ClanMvpBoard';
import type { ClanMvpEntry } from '../model/types';

describe('ClanMvpBoard', () => {
  const mockMvps: ClanMvpEntry[] = [
    {
      rank: 1,
      id: 'member-1',
      userId: 'user-1',
      username: 'GrandmasterPro',
      displayName: 'Alex Pro',
      equippedAvatarId: null,
      role: 'leader',
      wins: 45,
      gamesPlayed: 50,
      winRate: 90,
    },
  ];

  it('renders mvp board with player stats', () => {
    render(<ClanMvpBoard mvps={mockMvps} />);

    expect(screen.getByTestId('clan-mvp-board')).toBeInTheDocument();
    expect(screen.getByText('Alex Pro')).toBeInTheDocument();
    expect(screen.getByText('leader')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('renders empty state when no mvps provided', () => {
    render(<ClanMvpBoard mvps={[]} />);

    expect(
      screen.getByText('No member match history recorded yet.'),
    ).toBeInTheDocument();
  });
});
