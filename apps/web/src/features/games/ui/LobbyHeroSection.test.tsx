import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LobbyHeroSection } from './LobbyHeroSection';

const baseProps = {
  gameName: 'Hearts',
  waitingLabel: 'Waiting',
  defaultSubtitle: 'Waiting for players',
  playersLabel: 'Players',
  playerCount: 1,
  maxPlayers: 4,
  progress: 25,
  roomStatus: 'lobby',
  isQueued: false,
  onToggleQueue: vi.fn(),
  findOpponentLabel: 'Find opponent',
  cancelQueueLabel: 'Cancel search',
  queueSearchingSubtitle: 'Searching...',
  findOpponentHint: 'Match with a random player',
};

describe('LobbyHeroSection', () => {
  it('renders the find-opponent toggle as not pressed by default', () => {
    render(<LobbyHeroSection {...baseProps} />);
    const btn = screen.getByRole('button', { name: 'Find opponent' });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText('Match with a random player')).toBeTruthy();
  });

  it('shows pressed state and cancel label while queued', () => {
    render(<LobbyHeroSection {...baseProps} isQueued />);
    const btn = screen.getByRole('button', { name: 'Cancel search' });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Searching...')).toBeTruthy();
  });

  it('calls onToggleQueue when clicked', () => {
    const onToggleQueue = vi.fn();
    render(<LobbyHeroSection {...baseProps} onToggleQueue={onToggleQueue} />);
    fireEvent.click(screen.getByRole('button', { name: 'Find opponent' }));
    expect(onToggleQueue).toHaveBeenCalledTimes(1);
  });

  it('hides the queue button when the room is full or not in lobby', () => {
    const { rerender } = render(
      <LobbyHeroSection {...baseProps} playerCount={4} />,
    );
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<LobbyHeroSection {...baseProps} roomStatus="in_progress" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
