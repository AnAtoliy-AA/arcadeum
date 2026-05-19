import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '@/shared/config/tamagui.config';
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
vi.mock('@/widgets/GlimwormGame/store/glimwormStore', () => ({
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
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <GlimwormLobby room={MOCK_ROOM} isHost={isHost} currentUserId="user-1" />
    </TamaguiProvider>,
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
            { id: 'battle_royale', comingSoon: false },
            { id: 'time_attack', comingSoon: false },
          ],
        },
      ],
    });

    renderLobby();

    await waitFor(() => {
      expect(
        screen.getByTestId('variant-tile-battle_royale'),
      ).toBeInTheDocument();
    });

    const battleRoyaleTile = screen.getByTestId('variant-tile-battle_royale');
    expect(battleRoyaleTile).not.toHaveAttribute('aria-disabled', 'true');

    const timeAttackTile = screen.getByTestId('variant-tile-time_attack');
    expect(timeAttackTile).toBeInTheDocument();
    expect(timeAttackTile).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('renders a coming-soon variant as disabled with a badge, and click is a no-op', async () => {
    vi.mocked(gamesApi.getCatalog).mockResolvedValueOnce({
      games: [
        {
          gameId: 'glimworm_v1',
          comingSoon: false,
          variants: [
            { id: 'battle_royale', comingSoon: false },
            { id: 'time_attack', comingSoon: true },
          ],
        },
      ],
    });

    renderLobby();

    await waitFor(() => {
      expect(
        screen.getByTestId('variant-tile-battle_royale'),
      ).toBeInTheDocument();
    });

    // battle_royale: active by default, not coming-soon
    const battleRoyaleTile = screen.getByTestId('variant-tile-battle_royale');
    expect(battleRoyaleTile).not.toHaveAttribute('aria-disabled', 'true');

    // time_attack: coming-soon — disabled with badge
    const timeAttackTile = screen.getByTestId('variant-tile-time_attack');
    expect(timeAttackTile).toHaveAttribute('aria-disabled', 'true');
    expect(
      within(timeAttackTile).getByTestId('coming-soon-badge'),
    ).toBeInTheDocument();

    // Clicking time_attack must not change the selected variant
    // (battle_royale remains the active tile — its aria-pressed / active state unchanged)
    fireEvent.click(timeAttackTile);
    // After click, battle_royale should still not have aria-disabled
    // and time_attack should still be aria-disabled (state did not switch)
    expect(battleRoyaleTile).not.toHaveAttribute('aria-disabled', 'true');
    expect(timeAttackTile).toHaveAttribute('aria-disabled', 'true');
  });
});
