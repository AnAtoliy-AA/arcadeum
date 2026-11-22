import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RematchWaitingModal } from './RematchWaitingModal';
import type { TranslationKey } from '@/shared/i18n/useTranslation';

vi.mock('./InGameAvatar', () => ({
  InGameAvatar: ({ name }: { name: string }) => <div>{name}</div>,
}));

describe('RematchWaitingModal', () => {
  const mockCancel = vi.fn();
  const mockJoin = vi.fn();
  const mockDismiss = vi.fn();
  const mockT = (key: TranslationKey) => key;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders waiting state with countdown and calls onCancel', () => {
    render(
      <RematchWaitingModal
        waiting={{
          newRoomId: 'room-1',
          pendingUserIds: ['user-2'],
          status: 'waiting',
        }}
        waitingTimeLeft={20}
        players={[
          { playerId: 'user-1', displayName: 'Player 1', alive: true },
          { playerId: 'user-2', displayName: 'Player 2', alive: true },
        ]}
        currentUserId="user-1"
        onCancel={mockCancel}
        onJoin={mockJoin}
        onDismiss={mockDismiss}
        t={mockT}
      />,
    );

    expect(screen.getByTestId('rematch-waiting-status')).toBeInTheDocument();
    expect(screen.getByText('20s')).toBeInTheDocument();

    const cancelButton = screen.getByTestId('cancel-rematch-button');
    fireEvent.click(cancelButton);
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('renders partial state and calls onJoin', () => {
    render(
      <RematchWaitingModal
        waiting={{
          newRoomId: 'room-1',
          pendingUserIds: [],
          acceptedUserIds: ['user-1', 'user-2'],
          declinedUserIds: ['user-3'],
          status: 'partial',
        }}
        waitingTimeLeft={10}
        players={[
          { playerId: 'user-1', displayName: 'Player 1', alive: true },
          { playerId: 'user-2', displayName: 'Player 2', alive: true },
          { playerId: 'user-3', displayName: 'Player 3', alive: true },
        ]}
        currentUserId="user-1"
        onCancel={mockCancel}
        onJoin={mockJoin}
        onDismiss={mockDismiss}
        t={mockT}
      />,
    );

    const joinButton = screen.getByTestId('join-rematch-button');
    fireEvent.click(joinButton);
    expect(mockJoin).toHaveBeenCalledTimes(1);
  });

  it('renders declined state and calls onDismiss', () => {
    render(
      <RematchWaitingModal
        waiting={{
          newRoomId: 'room-1',
          pendingUserIds: [],
          acceptedUserIds: ['user-1'],
          declinedUserIds: ['user-2'],
          status: 'declined',
        }}
        waitingTimeLeft={0}
        players={[
          { playerId: 'user-1', displayName: 'Player 1', alive: true },
          { playerId: 'user-2', displayName: 'Player 2', alive: true },
        ]}
        currentUserId="user-1"
        onCancel={mockCancel}
        onJoin={mockJoin}
        onDismiss={mockDismiss}
        t={mockT}
      />,
    );

    const closeButton = screen.getByTestId('close-rematch-button');
    fireEvent.click(closeButton);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders play with bot button on decline for two-player game', () => {
    render(
      <RematchWaitingModal
        waiting={{
          newRoomId: 'room-1',
          pendingUserIds: [],
          acceptedUserIds: ['user-1'],
          declinedUserIds: ['user-2'],
          status: 'declined',
        }}
        waitingTimeLeft={0}
        players={[
          { playerId: 'user-1', displayName: 'Player 1', alive: true },
          { playerId: 'user-2', displayName: 'Player 2', alive: true },
        ]}
        currentUserId="user-1"
        onCancel={mockCancel}
        onJoin={mockJoin}
        onDismiss={mockDismiss}
        t={mockT}
      />,
    );

    const playWithBotButton = screen.getByTestId('play-with-bot-button');
    fireEvent.click(playWithBotButton);
    expect(mockJoin).toHaveBeenCalledTimes(1);
  });

  it('renders try again button on expired when onRetry is provided', () => {
    const mockRetry = vi.fn();
    render(
      <RematchWaitingModal
        waiting={{
          newRoomId: 'room-1',
          pendingUserIds: ['user-2'],
          status: 'expired',
        }}
        waitingTimeLeft={0}
        players={[
          { playerId: 'user-1', displayName: 'Player 1', alive: true },
          { playerId: 'user-2', displayName: 'Player 2', alive: true },
        ]}
        currentUserId="user-1"
        onCancel={mockCancel}
        onJoin={mockJoin}
        onDismiss={mockDismiss}
        onRetry={mockRetry}
        t={mockT}
      />,
    );

    const retryButton = screen.getByTestId('try-again-rematch-button');
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('handles Escape key to cancel when waiting', () => {
    render(
      <RematchWaitingModal
        waiting={{
          newRoomId: 'room-1',
          pendingUserIds: ['user-2'],
          status: 'waiting',
        }}
        waitingTimeLeft={25}
        players={[
          { playerId: 'user-1', displayName: 'Player 1', alive: true },
          { playerId: 'user-2', displayName: 'Player 2', alive: true },
        ]}
        currentUserId="user-1"
        onCancel={mockCancel}
        onJoin={mockJoin}
        onDismiss={mockDismiss}
        t={mockT}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('renders series badge when rematchNumber is greater than 1', () => {
    render(
      <RematchWaitingModal
        waiting={{
          newRoomId: 'room-1',
          pendingUserIds: ['user-2'],
          status: 'waiting',
          rematchNumber: 3,
        }}
        waitingTimeLeft={25}
        players={[
          { playerId: 'user-1', displayName: 'Player 1', alive: true },
          { playerId: 'user-2', displayName: 'Player 2', alive: true },
        ]}
        currentUserId="user-1"
        onCancel={mockCancel}
        onJoin={mockJoin}
        onDismiss={mockDismiss}
        t={mockT}
      />,
    );

    expect(screen.getByTestId('rematch-series-badge')).toBeInTheDocument();
  });
});
