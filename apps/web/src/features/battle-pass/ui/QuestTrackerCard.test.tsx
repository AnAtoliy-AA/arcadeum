import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestTrackerCard } from './QuestTrackerCard';
import type { QuestDefinition } from '@/shared/lib/quests-progression';

describe('QuestTrackerCard', () => {
  const quests: QuestDefinition[] = [
    {
      id: 'q-1',
      title: 'Daily Challenger',
      description: 'Play 3 matches',
      category: 'daily',
      actionType: 'play',
      targetCount: 3,
      currentCount: 3,
      rewardXp: 100,
      rewardCoins: 50,
      completed: true,
      claimed: false,
    },
    {
      id: 'q-2',
      title: 'Weekly Master',
      description: 'Win 10 matches',
      category: 'weekly',
      actionType: 'win',
      targetCount: 10,
      currentCount: 5,
      rewardXp: 500,
      rewardCoins: 200,
      completed: false,
      claimed: false,
    },
  ];

  it('renders daily quests by default and allows claiming', () => {
    const onClaim = vi.fn();
    render(<QuestTrackerCard quests={quests} onClaim={onClaim} />);

    expect(screen.getByText('Daily Challenger')).toBeDefined();
    expect(screen.getByText('Play 3 matches')).toBeDefined();

    const claimButton = screen.getByText('Claim');
    fireEvent.click(claimButton);
    expect(onClaim).toHaveBeenCalledWith('q-1');
  });

  it('switches to weekly quests when clicking tab', () => {
    render(<QuestTrackerCard quests={quests} onClaim={vi.fn()} />);

    fireEvent.click(screen.getByText('Weekly'));
    expect(screen.getByText('Weekly Master')).toBeDefined();
    expect(screen.getByText('Win 10 matches')).toBeDefined();
  });
});
