import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GlimwormLobby } from './GlimwormLobby';
import { gamesApi } from '@/features/games/api';
import type { GameRoomSummary } from '@/shared/types/games';

vi.mock('@/features/games/api', () => ({
  gamesApi: { getCatalog: vi.fn() },
}));
vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/lib/socket', () => ({
  gameSocket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
}));
vi.mock('@/widgets/ActionGames/GlimwormGame/store/glimwormStore', () => ({
  useGlimwormStore: (selector: (s: unknown) => unknown) =>
    selector({
      selectedColor: null,
      setColor: vi.fn(),
      latestSnapshot: null,
    }),
}));
vi.mock('@/features/games/ui/ReusableGameLobby', () => ({
  ReusableGameLobby: ({ optionsSlot }: { optionsSlot?: React.ReactNode }) => (
    <div data-testid="lobby-shell">{optionsSlot}</div>
  ),
}));

const MOCK_ROOM: GameRoomSummary = {
  id: 'room-1',
  gameId: 'glimworm_v1',
  name: 'Test Room',
  hostId: 'user-1',
  visibility: 'public',
  playerCount: 1,
  maxPlayers: null,
  createdAt: new Date().toISOString(),
  status: 'lobby',
};

function renderLobby(isHost = true) {
  return render(
    <GlimwormLobby room={MOCK_ROOM} isHost={isHost} currentUserId="user-1" />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GlimwormLobby — variant visibility (coming-soon)', () => {
  it('renders all interactive tiles when no variants are coming-soon', async () => {
    vi.mocked(gamesApi.getCatalog).mockResolvedValueOnce({
      games: [
        {
          gameId: 'glimworm_v1',
          comingSoon: false,
          variants: [
            { id: 'cyberpunk', comingSoon: false },
            { id: 'underwater', comingSoon: false },
          ],
          rules: [],
        },
      ],
    });

    renderLobby();

    await waitFor(() => {
      expect(
        screen.getByTestId('glimworm-variant-cyberpunk'),
      ).toBeInTheDocument();
    });

    const cyberpunkTile = screen.getByTestId('glimworm-variant-cyberpunk');
    expect(cyberpunkTile).not.toHaveAttribute('aria-disabled', 'true');

    const underwaterTile = screen.getByTestId('glimworm-variant-underwater');
    expect(underwaterTile).toBeInTheDocument();
    expect(underwaterTile).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('renders a coming-soon variant as disabled with a badge, and click is a no-op', async () => {
    vi.mocked(gamesApi.getCatalog).mockResolvedValueOnce({
      games: [
        {
          gameId: 'glimworm_v1',
          comingSoon: false,
          variants: [
            { id: 'cyberpunk', comingSoon: false },
            { id: 'underwater', comingSoon: true },
          ],
          rules: [],
        },
      ],
    });

    renderLobby();

    await waitFor(() => {
      expect(
        screen.getByTestId('glimworm-variant-cyberpunk'),
      ).toBeInTheDocument();
    });

    const cyberpunkTile = screen.getByTestId('glimworm-variant-cyberpunk');
    expect(cyberpunkTile).not.toHaveAttribute('aria-disabled', 'true');

    const underwaterTile = screen.getByTestId('glimworm-variant-underwater');
    expect(underwaterTile).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(underwaterTile);
    expect(cyberpunkTile).not.toHaveAttribute('aria-disabled', 'true');
    expect(underwaterTile).toHaveAttribute('aria-disabled', 'true');
  });
});
