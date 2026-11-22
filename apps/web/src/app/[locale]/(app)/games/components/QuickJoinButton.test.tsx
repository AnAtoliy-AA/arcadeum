import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickJoinButton } from './QuickJoinButton';

const push = vi.fn();
const getRooms = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({ gameRoom: (id: string) => `/rooms/${id}` }),
}));
vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({ snapshot: { accessToken: 't', userId: 'u1' } }),
}));
vi.mock('@/features/games/api', () => ({
  gamesApi: { getRooms: (...args: unknown[]) => getRooms(...args) },
}));

describe('QuickJoinButton', () => {
  beforeEach(() => {
    push.mockReset();
    getRooms.mockReset();
  });

  it('navigates to the first open lobby', async () => {
    getRooms.mockResolvedValue({ rooms: [{ id: 'r9' }], total: 1 });
    render(<QuickJoinButton gameId="chess_v1" />);
    fireEvent.click(screen.getByTestId('rooms-quick-join'));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/rooms/r9'));
    expect(getRooms.mock.calls[0][0]).toMatchObject({
      status: 'lobby',
      openSeats: true,
      gameId: 'chess_v1',
      participation: 'not_joined',
    });
  });

  it('shows a message when nothing is open', async () => {
    getRooms.mockResolvedValue({ rooms: [], total: 0 });
    render(<QuickJoinButton />);
    fireEvent.click(screen.getByTestId('rooms-quick-join'));
    expect(
      await screen.findByText('roomsBrowser.quickJoinNone'),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('shows an error message when the request fails', async () => {
    getRooms.mockRejectedValue(new Error('boom'));
    render(<QuickJoinButton />);
    fireEvent.click(screen.getByTestId('rooms-quick-join'));
    expect(
      await screen.findByText('roomsBrowser.quickJoinError'),
    ).toBeInTheDocument();
  });
});
