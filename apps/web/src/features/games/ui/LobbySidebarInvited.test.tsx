import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LobbySidebarInvited } from './LobbySidebarInvited';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('./InGameAvatar', () => ({ InGameAvatar: () => <span /> }));

const base = {
  pendingInvited: [{ id: 'u1', displayName: 'Friend One' }],
  pendingDeclined: [],
  invitedPlayersLabel: 'Invited',
  declinedLabel: 'Declined',
  reinviteLabel: 'Re-invite',
};

describe('LobbySidebarInvited', () => {
  it('shows the awaiting-reply state with resend and cancel for the host', () => {
    const onReinvite = vi.fn();
    const onCancelInvite = vi.fn();
    render(
      <LobbySidebarInvited
        {...base}
        isHost
        onReinvite={onReinvite}
        onCancelInvite={onCancelInvite}
      />,
    );
    expect(screen.getByText('games.lobby.invitedAwaitingReply')).toBeVisible();
    fireEvent.click(screen.getByTestId('lobby-invite-resend-u1'));
    expect(onReinvite).toHaveBeenCalledWith(['u1']);
    fireEvent.click(screen.getByTestId('lobby-invite-cancel-u1'));
    expect(onCancelInvite).toHaveBeenCalledWith(['u1']);
  });

  it('hides host actions from non-hosts', () => {
    render(
      <LobbySidebarInvited
        {...base}
        isHost={false}
        onReinvite={vi.fn()}
        onCancelInvite={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('lobby-invite-cancel-u1')).toBeNull();
    expect(screen.queryByTestId('lobby-invite-resend-u1')).toBeNull();
  });

  it('disables actions while a request for that user is in flight', () => {
    render(
      <LobbySidebarInvited
        {...base}
        isHost
        onReinvite={vi.fn()}
        onCancelInvite={vi.fn()}
        busyIds={new Set(['u1'])}
      />,
    );
    expect(screen.getByTestId('lobby-invite-cancel-u1')).toBeDisabled();
  });
});
