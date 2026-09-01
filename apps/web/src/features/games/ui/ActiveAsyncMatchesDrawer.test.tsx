import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveAsyncMatchesDrawer } from './ActiveAsyncMatchesDrawer';
import type { AsyncMatchItem } from '@/shared/lib/async-match';

describe('ActiveAsyncMatchesDrawer', () => {
  const matches: AsyncMatchItem[] = [
    {
      matchId: 'm-1',
      gameType: 'chess',
      playerA: 'u-1',
      playerB: 'u-2',
      currentTurnPlayerId: 'u-1',
      status: 'active',
      turnDurationHours: 24,
      lastTurnAt: new Date().toISOString(),
      turnExpiresAt: new Date(Date.now() + 3600000 * 5).toISOString(),
    },
  ];

  it('renders drawer with active match info when open', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <ActiveAsyncMatchesDrawer
        matches={matches}
        currentUserId="u-1"
        onSelectMatch={onSelect}
        isOpen={true}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('Active Turn-Based Matches')).toBeDefined();
    expect(screen.getByText('chess')).toBeDefined();
    expect(screen.getByText('👉 Your Turn')).toBeDefined();

    fireEvent.click(screen.getByText('Resume Match'));
    expect(onSelect).toHaveBeenCalledWith('m-1');
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ActiveAsyncMatchesDrawer
        matches={matches}
        currentUserId="u-1"
        onSelectMatch={vi.fn()}
        isOpen={false}
        onClose={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
