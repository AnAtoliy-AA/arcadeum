import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EventCard } from './EventCard';
import type { GameNightEvent } from '../model/types';

describe('EventCard', () => {
  const mockEvent: GameNightEvent = {
    id: 'evt-123',
    title: 'Friday Night Blitz Chess',
    description: 'Weekly blitz competition.',
    gameType: 'chess',
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    prizeBadge: 'champion_crown',
    participantCount: 5,
    activeGamesCount: 2,
    mvpUserId: null,
    mvpDisplayName: null,
    mvpPoints: 0,
    createdAt: new Date().toISOString(),
  };

  it('renders event details and live status badge', () => {
    render(<EventCard event={mockEvent} locale="en" />);
    expect(screen.getByText('Friday Night Blitz Chess')).toBeInTheDocument();
    expect(screen.getByText('Weekly blitz competition.')).toBeInTheDocument();
    expect(screen.getByText('LIVE NOW')).toBeInTheDocument();
    expect(screen.getByText(/5 participants/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Play Now/i }),
    ).toBeInTheDocument();
  });

  it('renders upcoming badge for scheduled event', () => {
    const upcomingEvent: GameNightEvent = {
      ...mockEvent,
      status: 'upcoming',
    };
    render(<EventCard event={upcomingEvent} locale="en" />);
    expect(screen.getByText('UPCOMING')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /View Details/i }),
    ).toBeInTheDocument();
  });
});
