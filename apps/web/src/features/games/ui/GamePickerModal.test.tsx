import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { GamePickerModal } from './GamePickerModal';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/en',
}));

vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({
    gameRoom: (id: string) => `/games/rooms/${id}`,
  }),
}));

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({ snapshot: { accessToken: 'token-123' } }),
}));

vi.mock('@/features/games/api', () => ({
  gamesApi: {
    getCatalog: vi.fn().mockResolvedValue({
      games: [],
    }),
    quickplay: vi.fn(),
  },
}));

import { gamesApi } from '@/features/games/api';

const quickplay = gamesApi.quickplay as ReturnType<typeof vi.fn>;

describe('GamePickerModal', () => {
  beforeEach(() => {
    push.mockClear();
    quickplay.mockClear();
    quickplay.mockResolvedValue({ room: { id: 'room-101' } });
  });

  it('renders nothing when open is false', () => {
    const { container } = render(
      <GamePickerModal open={false} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal header, category chips, search bar, and game cards when open', async () => {
    await act(async () => {
      render(<GamePickerModal open={true} onClose={vi.fn()} />);
    });

    expect(screen.getByTestId('game-picker-modal')).toBeInTheDocument();
    expect(screen.getByTestId('game-picker-title')).toBeInTheDocument();
    expect(screen.getByTestId('game-picker-search')).toBeInTheDocument();
    expect(screen.getByTestId('game-picker-category-all')).toBeInTheDocument();
    expect(screen.getByTestId('game-picker-card-chess_v1')).toBeInTheDocument();
  });

  it('filters games when selecting a category chip', async () => {
    await act(async () => {
      render(<GamePickerModal open={true} onClose={vi.fn()} />);
    });

    expect(screen.getByTestId('game-picker-card-chess_v1')).toBeInTheDocument();
    expect(
      screen.getByTestId('game-picker-card-critical_v1'),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('game-picker-category-board'));
    });

    expect(screen.getByTestId('game-picker-card-chess_v1')).toBeInTheDocument();
    expect(
      screen.queryByTestId('game-picker-card-critical_v1'),
    ).not.toBeInTheDocument();
  });

  it('filters games by search query input', async () => {
    await act(async () => {
      render(<GamePickerModal open={true} onClose={vi.fn()} />);
    });

    const searchInput = screen.getByTestId('game-picker-search');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'chess' } });
    });

    expect(screen.getByTestId('game-picker-card-chess_v1')).toBeInTheDocument();
    expect(
      screen.queryByTestId('game-picker-card-critical_v1'),
    ).not.toBeInTheDocument();
  });

  it('triggers quickplay against AI and redirects to game room when a card is clicked', async () => {
    const onClose = vi.fn();
    await act(async () => {
      render(<GamePickerModal open={true} onClose={onClose} />);
    });

    const chessCard = screen.getByTestId('game-picker-card-chess_v1');
    await act(async () => {
      fireEvent.click(chessCard);
    });

    await waitFor(() => {
      expect(quickplay).toHaveBeenCalledWith('chess_v1', undefined, {
        token: 'token-123',
      });
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith('/games/rooms/room-101');
    });
  });

  it('handles quickplay error without routing', async () => {
    quickplay.mockRejectedValueOnce(new Error('Server error'));
    const onClose = vi.fn();
    await act(async () => {
      render(<GamePickerModal open={true} onClose={onClose} />);
    });

    const chessCard = screen.getByTestId('game-picker-card-chess_v1');
    await act(async () => {
      fireEvent.click(chessCard);
    });

    await waitFor(() => {
      expect(quickplay).toHaveBeenCalledWith('chess_v1', undefined, {
        token: 'token-123',
      });
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
