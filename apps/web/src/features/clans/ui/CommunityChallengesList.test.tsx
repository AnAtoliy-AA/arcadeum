import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommunityChallengesList } from './CommunityChallengesList';
import type { CommunityChallenge } from '../model/types';

describe('CommunityChallengesList', () => {
  const mockChallenges: CommunityChallenge[] = [
    {
      id: 'ch-1',
      title: 'Armada Vanguard',
      description: 'Sink 5,000 warships',
      gameId: 'sea-battle',
      target: 5000,
      currentProgress: 2500,
      progressPercent: 50,
      participantsCount: 42,
      rewardTitle: 'Fleet Admiral',
      rewardBadge: 'badge_admiral',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: 'active',
    },
  ];

  it('renders challenge card with progress, title, and reward', () => {
    const onContribute = vi.fn().mockResolvedValue(undefined);
    render(
      <CommunityChallengesList
        challenges={mockChallenges}
        onContribute={onContribute}
      />,
    );

    expect(screen.getByText('Armada Vanguard')).toBeInTheDocument();
    expect(screen.getByText('Sink 5,000 warships')).toBeInTheDocument();
    expect(screen.getByText('Fleet Admiral')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('2,500 / 5,000')).toBeInTheDocument();
  });

  it('handles contribution click', async () => {
    const onContribute = vi.fn().mockResolvedValue(undefined);
    render(
      <CommunityChallengesList
        challenges={mockChallenges}
        onContribute={onContribute}
      />,
    );

    const button = screen.getByTestId('contribute-button-ch-1');
    await act(async () => {
      fireEvent.click(button);
    });
    expect(onContribute).toHaveBeenCalledWith('ch-1');
  });
});
