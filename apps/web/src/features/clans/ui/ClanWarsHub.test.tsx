import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ClanWarsHub } from './ClanWarsHub';
import type { ClanWar, Clan } from '../model/types';

describe('ClanWarsHub', () => {
  const mockClan: Clan = {
    id: 'clan-1',
    name: 'Knights',
    tag: 'KNG',
    description: 'Brave clan',
    avatarUrl: null,
    leaderId: 'user-1',
    memberCount: 5,
    visibility: 'public',
    inviteCode: null,
    totalWins: 20,
    totalGames: 25,
    createdAt: new Date().toISOString(),
  };

  const mockWars: ClanWar[] = [
    {
      id: 'war-1',
      initiatorClanId: 'clan-1',
      initiatorClanName: 'Knights',
      initiatorClanTag: 'KNG',
      initiatorScore: 3,
      targetClanId: 'clan-2',
      targetClanName: 'Dragons',
      targetClanTag: 'DRG',
      targetClanScore: 2,
      targetScore: 5,
      gameId: 'all',
      status: 'active',
      winnerClanId: null,
      expiresAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      matchLogs: [
        {
          id: 'log-1',
          playerClanId: 'clan-1',
          playerName: 'Arthur',
          opponentClanId: 'clan-2',
          opponentName: 'Smaug',
          gameId: 'chess',
          winnerClanId: 'clan-1',
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'war-2',
      initiatorClanId: 'clan-3',
      initiatorClanName: 'Vikings',
      initiatorClanTag: 'VIK',
      initiatorScore: 5,
      targetClanId: 'clan-4',
      targetClanName: 'Samurai',
      targetClanTag: 'SAM',
      targetClanScore: 3,
      targetScore: 5,
      gameId: 'sea-battle',
      status: 'completed',
      winnerClanId: 'clan-3',
      expiresAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      matchLogs: [],
    },
  ];

  it('renders counters and wars list correctly', () => {
    render(<ClanWarsHub wars={mockWars} myClan={mockClan} popularClans={[]} />);

    expect(screen.getByTestId('active-wars-counter')).toHaveTextContent('1');
    expect(screen.getByText('Knights')).toBeInTheDocument();
    expect(screen.getByText('Dragons')).toBeInTheDocument();
    expect(screen.getByText('Vikings')).toBeInTheDocument();
  });

  it('filters wars by active status', () => {
    render(<ClanWarsHub wars={mockWars} myClan={mockClan} popularClans={[]} />);

    fireEvent.click(screen.getByTestId('filter-wars-active'));
    expect(screen.getByText('Knights')).toBeInTheDocument();
    expect(screen.queryByText('Vikings')).not.toBeInTheDocument();
  });

  it('opens declare war modal on button click', () => {
    render(<ClanWarsHub wars={mockWars} myClan={mockClan} popularClans={[]} />);

    const declareBtn = screen.getByTestId('declare-war-button');
    expect(declareBtn).toBeInTheDocument();
    fireEvent.click(declareBtn);
    expect(screen.getByTestId('declare-war-modal')).toBeInTheDocument();
  });
});
