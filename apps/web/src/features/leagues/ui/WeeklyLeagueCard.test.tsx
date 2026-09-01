import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyLeagueCard } from './WeeklyLeagueCard';
import type { LeagueParticipant } from '@/shared/lib/social-leagues';

describe('WeeklyLeagueCard', () => {
  const participants: LeagueParticipant[] = [
    { rank: 1, userId: 'u-1', username: 'Champion', trophies: 1200 },
    { rank: 2, userId: 'u-2', username: 'RunnerUp', trophies: 1150 },
    {
      rank: 15,
      userId: 'u-me',
      username: 'PlayerOne',
      trophies: 800,
      isCurrentUser: true,
    },
  ];

  it('renders league tier and player standings correctly', () => {
    render(
      <WeeklyLeagueCard
        tier="gold"
        participants={participants}
        currentUserId="u-me"
      />,
    );

    expect(screen.getByText('Gold League')).toBeDefined();
    expect(screen.getByText('Champion')).toBeDefined();
    expect(screen.getByText('PlayerOne')).toBeDefined();
    expect(screen.getByText('YOU')).toBeDefined();
  });
});
