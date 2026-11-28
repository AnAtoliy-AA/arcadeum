import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReusableGameLobby } from './ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';

vi.mock('@/features/games/api', () => ({
  gamesApi: { getCatalog: vi.fn(() => Promise.resolve({ games: [] })) },
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/lib/socket', () => ({
  gameSocket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
}));
vi.mock('@/shared/lib/settings-storage', () => ({
  loadStoredSettings: vi.fn(() => ({})),
  saveStoredSettings: vi.fn(),
}));
vi.mock('./LobbySidebar', () => ({
  LobbySidebar: () => <div data-testid="sidebar" />,
}));
vi.mock('./HouseRulesSection', () => ({
  HouseRulesSection: () => <div data-testid="rules" />,
}));
vi.mock('./ConfirmationModal', () => ({
  ConfirmationModal: () => <div data-testid="confirm" />,
}));
vi.mock('./LobbyStartButton', () => ({
  LobbyStartButton: () => <div data-testid="start" />,
}));

function makeRoom(): GameRoomSummary {
  return {
    id: 'room-1',
    gameId: 'checkers_v1',
    name: 'Checkers Lounge',
    hostId: 'user-1',
    visibility: 'public',
    playerCount: 1,
    maxPlayers: 2,
    createdAt: new Date().toISOString(),
    status: 'lobby',
    gameOptions: {
      boardSize: 8,
    },
  };
}

describe('ReusableGameLobby - config prop', () => {
  const config = {
    gameName: 'Config Game',
    gameIcon: '🎯',
    variantName: 'Neon',
    seats: { min: 2, max: 2 },
    bots: { enabled: true, showDifficulty: false },
  };

  it('renders game name, variant and bot controls from config', () => {
    render(
      <ReusableGameLobby
        room={makeRoom()}
        userId="user-1"
        isHost
        startBusy={false}
        onStartGame={vi.fn()}
        config={config}
      />,
    );
    expect(screen.getAllByText('Config Game').length).toBeGreaterThan(0);
    expect(screen.getByTestId('bot-count-1')).toBeInTheDocument();
    expect(screen.queryByTestId('difficulty-easy')).not.toBeInTheDocument();
  });

  it('lets flat props override config values', () => {
    render(
      <ReusableGameLobby
        room={makeRoom()}
        userId="user-1"
        isHost
        startBusy={false}
        onStartGame={vi.fn()}
        config={config}
        gameName="Override Game"
        enableBots={false}
      />,
    );
    expect(screen.getAllByText('Override Game').length).toBeGreaterThan(0);
    expect(screen.queryByText('Config Game')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bot-count-1')).not.toBeInTheDocument();
  });
});
