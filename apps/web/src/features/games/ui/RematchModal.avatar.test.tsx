import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RematchModal } from './RematchModal';
import { RematchInvitationModal } from './RematchInvitationModal';

vi.mock('./InGameAvatar', () => ({
  InGameAvatar: ({
    playerId,
    'data-testid': testId,
  }: {
    playerId: string;
    name: string;
    'data-testid'?: string;
  }) => <div data-testid={testId || `avatar-${playerId}`} />,
}));

describe('Avatar Visibility in Rematch Modals', () => {
  it('renders InGameAvatar for each player in RematchModal', () => {
    const players = [
      { playerId: 'p1', displayName: 'Player One', alive: true },
      { playerId: 'p2', displayName: 'Player Two', alive: true },
    ];

    render(
      <RematchModal
        isOpen
        players={players}
        currentUserId="p1"
        rematchLoading={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        t={(key: string) => key}
      />,
    );

    expect(screen.getByTestId('rematch-player-avatar-p2')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });

  it('renders InGameAvatar for inviter in RematchInvitationModal', () => {
    render(
      <RematchInvitationModal
        isOpen
        senderName="HostPlayer"
        hostId="host-123"
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        t={(key: string, params?: Record<string, string | number>) =>
          params?.name ? `${key} (${params.name})` : key
        }
      />,
    );

    expect(screen.getByTestId('rematch-invitation-avatar')).toBeInTheDocument();
    expect(screen.getByText(/HostPlayer/)).toBeInTheDocument();
  });
});
