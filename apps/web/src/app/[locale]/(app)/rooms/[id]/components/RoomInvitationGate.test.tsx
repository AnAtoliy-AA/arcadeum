import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RoomInvitationGate } from './RoomInvitationGate';

const accept = vi.fn();
const decline = vi.fn();

vi.mock('@/features/rematch/api', () => ({
  rematchApi: {
    acceptInvitation: (...a: unknown[]) => accept(...a),
    declineInvitation: (...a: unknown[]) => decline(...a),
  },
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) =>
      params ? `${key}:${params.host}` : key,
  }),
}));
vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({ rooms: '/rooms' }),
}));
vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({ snapshot: { accessToken: 'tok' } }),
}));

describe('RoomInvitationGate', () => {
  beforeEach(() => {
    accept.mockReset();
    decline.mockReset();
  });

  it('names the host and calls accept, then notifies the page', async () => {
    accept.mockResolvedValue(undefined);
    const onAccepted = vi.fn();
    render(
      <RoomInvitationGate
        roomId="r1"
        hostName="Alice"
        onAccepted={onAccepted}
        onDeclined={vi.fn()}
      />,
    );
    expect(
      screen.getByText('games.roomPage.invitation.title:Alice'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('room-invitation-accept'));
    await waitFor(() => expect(onAccepted).toHaveBeenCalled());
    expect(accept).toHaveBeenCalledWith('r1', { token: 'tok' });
  });

  it('declines and notifies the page', async () => {
    decline.mockResolvedValue(undefined);
    const onDeclined = vi.fn();
    render(
      <RoomInvitationGate
        roomId="r1"
        hostName="Alice"
        onAccepted={vi.fn()}
        onDeclined={onDeclined}
      />,
    );
    fireEvent.click(screen.getByTestId('room-invitation-decline'));
    await waitFor(() => expect(onDeclined).toHaveBeenCalled());
  });

  it('shows an error and re-enables buttons when the request fails', async () => {
    accept.mockRejectedValue(new Error('Room is full'));
    const onAccepted = vi.fn();
    render(
      <RoomInvitationGate
        roomId="r1"
        hostName="Alice"
        onAccepted={onAccepted}
        onDeclined={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('room-invitation-accept'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'games.roomPage.invitation.error',
    );
    expect(onAccepted).not.toHaveBeenCalled();
    expect(screen.getByTestId('room-invitation-accept')).not.toBeDisabled();
  });
});
