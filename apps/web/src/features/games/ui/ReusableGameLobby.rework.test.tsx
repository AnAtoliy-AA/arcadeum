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

describe('ReusableGameLobby - Reworked Layout', () => {
  it('renders hero section and game settings card with options slot', () => {
    render(
      <ReusableGameLobby
        room={makeRoom()}
        userId="user-1"
        isHost
        startBusy={false}
        onStartGame={vi.fn()}
        gameName="Checkers"
        gameIcon="🏁"
        minPlayers={2}
        maxPlayers={2}
        optionsSlot={<div data-testid="custom-options-slot">Board Options</div>}
      />,
    );

    expect(screen.getByTestId('room-name-text')).toHaveTextContent(
      'Checkers Lounge',
    );
    expect(screen.getByText('Checkers')).toBeInTheDocument();
    expect(screen.getByTestId('lobby-game-settings-card')).toBeInTheDocument();
    expect(screen.getByTestId('custom-options-slot')).toBeInTheDocument();
  });

  it('renders host controls with bot count and difficulty inside setup section', () => {
    render(
      <ReusableGameLobby
        room={makeRoom()}
        userId="user-1"
        isHost
        startBusy={false}
        onStartGame={vi.fn()}
        gameName="Checkers"
        gameIcon="🏁"
        minPlayers={2}
        maxPlayers={2}
        enableBots
        showDifficulty
      />,
    );

    expect(screen.getByTestId('bot-count-1')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-easy')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-medium')).toBeInTheDocument();
  });

  it('renders field size badge when boardSize option is provided', () => {
    render(
      <ReusableGameLobby
        room={makeRoom()}
        userId="user-1"
        isHost
        startBusy={false}
        onStartGame={vi.fn()}
        gameName="Checkers"
        gameIcon="🏁"
        minPlayers={2}
        maxPlayers={2}
      />,
    );

    const badge = screen.getByTestId('lobby-field-size-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Field: 8×8');
  });
});
