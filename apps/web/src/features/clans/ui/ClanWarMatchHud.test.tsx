import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ClanWarMatchHud } from './ClanWarMatchHud';
import type { ClanWar, Clan } from '../model/types';

describe('ClanWarMatchHud', () => {
  const mockWar: ClanWar = {
    id: 'war-hud-1',
    initiatorClanId: 'clan-alpha',
    initiatorClanName: 'Vanguard Knights',
    initiatorClanTag: 'VNG',
    initiatorScore: 4,
    targetClanId: 'clan-beta',
    targetClanName: 'Shadow Syndicate',
    targetClanTag: 'SHD',
    targetClanScore: 2,
    targetScore: 5,
    gameId: 'chess',
    status: 'active',
    winnerClanId: null,
    expiresAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    matchLogs: [],
  };

  const mockMyClan: Clan = {
    id: 'clan-alpha',
    name: 'Vanguard Knights',
    tag: 'VNG',
    description: 'Elite squad',
    avatarUrl: null,
    leaderId: 'user-1',
    memberCount: 15,
    visibility: 'public',
    inviteCode: 'VNG123',
    totalWins: 100,
    totalGames: 120,
    createdAt: new Date().toISOString(),
  };

  it('renders rival clan tags, live badge, and current match scores', () => {
    render(<ClanWarMatchHud war={mockWar} myClan={mockMyClan} />);

    expect(screen.getByTestId('clan-war-match-hud')).toBeInTheDocument();
    expect(screen.getByText('[VNG]')).toBeInTheDocument();
    expect(screen.getByText('[SHD]')).toBeInTheDocument();
    expect(
      screen.getByTestId('clan-war-hud-initiator-score'),
    ).toHaveTextContent('4');
    expect(screen.getByTestId('clan-war-hud-target-score')).toHaveTextContent(
      '2',
    );
    expect(screen.getByTestId('clan-war-hud-live-badge')).toBeInTheDocument();
  });

  it('renders target win goal and Your Clan label for player clan', () => {
    render(<ClanWarMatchHud war={mockWar} myClan={mockMyClan} />);

    expect(screen.getByTestId('clan-war-hud-target-goal')).toHaveTextContent(
      '5',
    );
    expect(screen.getByText('Your Clan')).toBeInTheDocument();
  });

  it('toggles minimized view when minimize button is clicked', () => {
    render(<ClanWarMatchHud war={mockWar} myClan={mockMyClan} />);

    const toggleButton = screen.getByRole('button', {
      name: /collapse war hud/i,
    });
    expect(
      screen.getByTestId('clan-war-hud-initiator-score'),
    ).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(
      screen.queryByTestId('clan-war-hud-initiator-score'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /expand war hud/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /expand war hud/i }));
    expect(
      screen.getByTestId('clan-war-hud-initiator-score'),
    ).toBeInTheDocument();
  });
});
