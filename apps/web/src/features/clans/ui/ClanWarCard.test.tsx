import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClanWarCard } from './ClanWarCard';
import type { ClanWar } from '../model/types';

describe('ClanWarCard', () => {
  const mockWar: ClanWar = {
    id: 'war-123',
    initiatorClanId: 'clan-1',
    initiatorClanName: 'Knights',
    initiatorClanTag: 'KNG',
    initiatorScore: 3,
    targetClanId: 'clan-2',
    targetClanName: 'Dragons',
    targetClanTag: 'DRG',
    targetClanScore: 2,
    targetScore: 5,
    gameId: 'sea-battle',
    status: 'active',
    winnerClanId: null,
    expiresAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    matchLogs: [
      {
        id: 'log-1',
        playerClanId: 'clan-1',
        playerName: 'SirLancelot',
        opponentClanId: 'clan-2',
        opponentName: 'RedDrake',
        gameId: 'sea-battle',
        winnerClanId: 'clan-1',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  it('renders clan names, tags, scores, and game badge', () => {
    render(<ClanWarCard war={mockWar} />);

    expect(screen.getByText('Knights')).toBeInTheDocument();
    expect(screen.getByText('Dragons')).toBeInTheDocument();
    expect(screen.getByText('[KNG]')).toBeInTheDocument();
    expect(screen.getByText('[DRG]')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('sea-battle')).toBeInTheDocument();
  });

  it('renders report victory button for participants in active war', () => {
    const onRecordVictory = vi.fn();
    render(
      <ClanWarCard
        war={mockWar}
        myClanId="clan-1"
        onRecordVictory={onRecordVictory}
      />,
    );

    const button = screen.getByTestId('report-victory-war-123');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onRecordVictory).toHaveBeenCalledWith('war-123', 'clan-1');
  });

  it('renders completed banner if war is completed', () => {
    const completedWar: ClanWar = {
      ...mockWar,
      status: 'completed',
      winnerClanId: 'clan-1',
    };

    render(<ClanWarCard war={completedWar} />);
    expect(screen.getByText(/Victorious: Knights/)).toBeInTheDocument();
  });
});
